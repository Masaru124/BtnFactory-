import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";

const { width } = Dimensions.get("window");

const RegisterScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({
    username: false,
    password: false,
  });
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/api/register`)
      .then((res) => console.log("✅ Connection test:", res.status))
      .catch((err) => console.error("❌ Connection failed:", err.message));
  }, []);

  const handleRegister = async () => {
    setError("");
    Keyboard.dismiss();

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        router.replace("/");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.log(error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to get started</Text>
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Username */}
          <TextInput
            placeholder="Enter your username"
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            style={[styles.input, isFocused.username && styles.inputFocused]}
            autoCapitalize="none"
            onFocus={() => setIsFocused({ ...isFocused, username: true })}
            onBlur={() => setIsFocused({ ...isFocused, username: false })}
          />

          {/* Password */}
          <TextInput
            placeholder="At least 6 characters"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            style={[styles.input, isFocused.password && styles.inputFocused]}
            secureTextEntry
            onFocus={() => setIsFocused({ ...isFocused, password: true })}
            onBlur={() => setIsFocused({ ...isFocused, password: false })}
          />

          {/* Submit */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#000"
              style={styles.loadingIndicator}
            />
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.replace("/")} activeOpacity={0.7}>
              <Text style={styles.loginLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  button: {
    width: "100%",
    height: 54,
    borderRadius: 12,
    backgroundColor: "#0963b8ff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
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
  loginLink: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },
  loadingIndicator: {
    marginVertical: 32,
  },
});

export default RegisterScreen;
