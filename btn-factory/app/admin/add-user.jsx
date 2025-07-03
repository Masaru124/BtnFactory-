import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ScrollView
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      username,
      password,
      roles: [role],
      departments: [department],
    };

    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(text || "Failed to create user");
      }

      if (response.ok) {
        Alert.alert("Success", "User created successfully");
        resetForm();
      } else {
        Alert.alert("Error", data.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Add user error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRole("user");
    setDepartment("production");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create New User</Text>
        <Text style={styles.subtitle}>Fill in the user details below</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            style={styles.input}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={setRole}
              style={styles.picker}
              dropdownIconColor="#64748b"
            >
              <Picker.Item label="User" value="user" />
              <Picker.Item label="Staff" value="staff" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Department</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={department}
              onValueChange={setDepartment}
              style={styles.picker}
              dropdownIconColor="#64748b"
            >
              <Picker.Item label="Production" value="Production" />
              <Picker.Item label="Quality" value="Quality" />
              <Picker.Item label="Packing" value="Packing" />
              <Picker.Item label="Accounting" value="Accounting" />
              <Picker.Item label="Inventory" value="Inventory" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.buttonDisabled]} 
          onPress={handleAddUser}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? "Creating..." : "Create User"}
          </Text>
        </TouchableOpacity>

        <Link href="/admin" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: 30,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 32,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#1e293b",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#1e293b",
  },
  button: {
    backgroundColor: "#4f46e5",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#4f46e5",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: "#a5b4fc",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  backButton: {
    marginTop: 20,
    padding: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#4f46e5",
    fontSize: 15,
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});