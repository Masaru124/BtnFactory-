import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Link } from "expo-router";
import { useState } from "react";
import { API_URL } from "../../constants/api";

import AsyncStorage from "@react-native-async-storage/async-storage";
const { width } = Dimensions.get("window");

export default function AddUserScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [department, setDepartment] = useState("production");

  const handleAddUser = async () => {
    const payload = {
      username,
      password,
      roles: [role],
      departments: [department],
    };

    try {
      // 🔑 Get token from storage
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(text);
      }

      if (response.ok) {
        Alert.alert("Success", "User created successfully");
        setUsername("");
        setPassword("");
        setRole("user");
        setDepartment("production");
      } else {
        Alert.alert("Error", data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Add user error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New User</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter username"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Staff" value="staff" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>
      </View>

      <Text style={styles.label}>Department</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={department}
          onValueChange={(itemValue) => setDepartment(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Production" value="Production" />
          <Picker.Item label="Quality" value="Quality" />
          <Picker.Item label="Packing" value="Packing" />
          <Picker.Item label="Accounting" value="Accounting" />
          <Picker.Item label="Inventory" value="Inventory" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleAddUser}>
        <Text style={styles.buttonText}>Add User</Text>
      </TouchableOpacity>

      <Link href="/admin" asChild>
        <TouchableOpacity style={styles.backLink}>
          <Text style={styles.backText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: width * 0.08,
    paddingTop: 60,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 24,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#1e293b",
    marginBottom: 20,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  backLink: {
    marginTop: 24,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
