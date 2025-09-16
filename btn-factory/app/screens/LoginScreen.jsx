import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const router = useRouter();
  const { signIn } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ username: false, password: false });

  const handleLogin = async () => {
    setError("");
    Keyboard.dismiss();

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);

    try {
      const roles = await signIn({ username, password });

      if (roles?.includes("admin")) {
        router.replace("/admin");
      } else if (roles?.includes("staff")) {
        router.replace("/staff");
      } else {
        router.replace("/user");
      }
    } catch (e) {
      console.error("❌ Login error:", e);
      setError(e.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inner}>
          {/* App Title */}
          <View style={styles.header}>
            <Text style={styles.title}>Fabricana Supreme</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Username Input */}
          <TextInput
            placeholder="Username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={[styles.input, isFocused.username && styles.inputFocused]}
            onFocus={() => setIsFocused({ ...isFocused, username: true })}
            onBlur={() => setIsFocused({ ...isFocused, username: false })}
            returnKeyType="next"
          />

          {/* Password Input */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, isFocused.password && styles.inputFocused]}
            secureTextEntry
            onFocus={() => setIsFocused({ ...isFocused, password: true })}
            onBlur={() => setIsFocused({ ...isFocused, password: false })}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Forgot Password */}
          {/* <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity> */}

          {/* Submit Button */}
          {loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.loadingIndicator} />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/register")} activeOpacity={0.7}>
              <Text style={styles.registerLink}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    // {/* </TouchableWithoutFeedback> */}
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // clean background
    justifyContent: "center",
  },
  inner: {
    paddingHorizontal: width * 0.08,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0963b8ff",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: "#6B7280",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 54,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: "#000",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 28,
  },
  forgotPasswordText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "#0963b8ff", // black primary
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#374151",
    fontSize: 15,
  },
  registerLink: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  loadingIndicator: {
    marginVertical: 32,
  },
});

export default LoginScreen;
