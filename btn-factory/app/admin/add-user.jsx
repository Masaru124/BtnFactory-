import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { API_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
              <Picker.Item label="Raw Material" value="Raw Material" />
              <Picker.Item label="Casting" value="Casting" />
              <Picker.Item label="Turning" value="Turning" />
              <Picker.Item label="Polish" value="Polish" />
              <Picker.Item label="Packing" value="Packing" />
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
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: "#ffffffff",
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 32,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  input: {
    height: 50,
    borderWidth: 0.3,
    borderColor: "#000000ff",
    borderRadius: 1,
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
        elevation: 0,
      },
    }),
  },
  pickerContainer: {
    borderColor: "#000000ff",
    borderWidth: 0.3,
    borderRadius: 1,
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
        elevation: 0,
      },
    }),
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#1e293b",
  },
  button: {
    backgroundColor: "#4678e5ff",
    paddingVertical: 16,
    borderRadius: 3,
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
        elevation: 1,
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
});
