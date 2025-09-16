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
import { useState, useContext } from "react";
import { API_URL } from "../../constants/api";
import { AuthContext } from "../contexts/AuthContext";
import BackButton from "../../components/BackButton";

export default function AddUserScreen() {
  const { userToken } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!username || !password || !role || (role === "staff" && !department)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!userToken) {
      Alert.alert("Error", "Authentication token not found. Please log in again.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      username,
      password,
      roles: [role],
      departments: role === "staff" ? [department] : [],
    };

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "User created successfully");
        resetForm();
      } else {
        Alert.alert("Error", data.message || "Failed to create user");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setRole("");
    setDepartment("");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>New User</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Fill in the details below</Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Username */}
          <FormField
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
          />

          {/* Password */}
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />

          {/* Role Picker */}
          <Text style={styles.label}>Role</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={role}
              onValueChange={(value) => setRole(value)}
              style={styles.picker}
            >
              <Picker.Item label="Select Role..." value="" enabled={false} />
              <Picker.Item label="User" value="user" />
              <Picker.Item label="Staff" value="staff" />
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          </View>

          {/* Department (only staff) */}
          {role === "staff" && (
            <>
              <Text style={styles.label}>Department</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={department}
                  onValueChange={(value) => setDepartment(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Department..." value="" enabled={false} />
                  <Picker.Item label="Raw Material" value="Raw Material" />
                  <Picker.Item label="Casting" value="Casting" />
                  <Picker.Item label="Turning" value="Turning" />
                  <Picker.Item label="Polish" value="Polish" />
                  <Picker.Item label="Packing" value="Packing" />
                </Picker>
              </View>
            </>
          )}

          {/* Button */}
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
      </View>
    </ScrollView>
  );
}

function FormField({ label, ...props }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#94a3b8"
        style={styles.input}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 10
  },
  form: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#111827",
    borderRadius: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  picker: {
    height: 48,
    width: "100%",
    color: "#111827",
  },
  button: {
    backgroundColor: "#005f9eff",
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
