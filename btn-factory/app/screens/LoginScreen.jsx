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
} from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false,
  });
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    Keyboard.dismiss();

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      const roles = await signIn({ username, password });

      // ✅ Use roles returned from signIn for redirection
      if (roles?.includes("admin")) {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    } catch (e) {
      console.error("Login error:", e);
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back to Fabricana Supreme </Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#94a3b8"
            value={username}
            onChangeText={setUsername}
            style={[styles.input, isFocused.username && styles.inputFocused]}
            autoCapitalize="none"
            onFocus={() => setIsFocused({ ...isFocused, username: true })}
            onBlur={() => setIsFocused({ ...isFocused, username: false })}
          />
        </View>

        <View style={styles.formGroup}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, isFocused.password && styles.inputFocused]}
            secureTextEntry
            onFocus={() => setIsFocused({ ...isFocused, password: true })}
            onBlur={() => setIsFocused({ ...isFocused, password: false })}
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => router.push("/forgot-password")}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6366f1"
            style={styles.loadingIndicator}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Dont have an account?</Text>
              <TouchableOpacity
                onPress={() => router.replace("/register")}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
    // </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: width * 0.08,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    textAlign: "center",
    fontWeight: "800",
    color: "#1e293b",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#64748b",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    fontWeight: "500",
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 56,
    borderWidth: 0.3,
    // borderColor: "#000000ff",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#004eccff",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    elevation: 0,
  },
  inputFocused: {
    borderColor: "#000000ff",
    shadowColor: "#000000ff",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  errorText: {
    color: "#ef4444",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    backgroundColor: "#0075faff",
    justifyContent: "center",
    alignItems: "center",
    // margin:10,
    marginTop: 8,
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 0,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#000000ff",
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  registerLink: {
    color: "#0752c2ff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  loadingIndicator: {
    marginVertical: 32,
  },
});

export default LoginScreen;
