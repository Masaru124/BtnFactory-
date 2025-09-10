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
  const [role, setRole] = useState(""); // "Select" state
  const [department, setDepartment] = useState(""); // "Select" state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    console.log("Creating user with:", {
      username,
      password,
      role,
      department,
    });

    if (!username || !password || !role || !department) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!userToken) {
      Alert.alert(
        "Error",
        "Authentication token not found. Please log in again."
      );
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
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
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

      console.log("API response:", data);

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
    setRole("");
    setDepartment("");
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Create New User</Text>
          <View style={{ width: 24 }} />
        </View>
        <Text style={styles.subtitle}>Fill in the user details below</Text>

        {/* Username */}
        <View style={styles.addusercontainer}>
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

          {/* Password */}
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

          {/* Role Picker */}
          {/* Role Picker */}
          <View style={styles.formGroup}>
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
          </View>

          {/* Department Picker (only for Staff) */}
          {role === "staff" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Department</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={department}
                  onValueChange={(value) => setDepartment(value)}
                  style={styles.picker}
                >
                  <Picker.Item
                    label="Select Department..."
                    value=""
                    enabled={false}
                  />
                  <Picker.Item label="Raw Material" value="Raw Material" />
                  <Picker.Item label="Casting" value="Casting" />
                  <Picker.Item label="Turning" value="Turning" />
                  <Picker.Item label="Polish" value="Polish" />
                  <Picker.Item label="Packing" value="Packing" />
                </Picker>
              </View>
            </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject, // Fill entire parent
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 22,
    color: "#000000",
    marginTop: 4,
    textAlign: "left",
    padding: 16,
    fontWeight: 800,
  },
  addusercontainer: {
    padding: 16,
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
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#ffffff",
    color: "#1e293b",
    borderRadius: 10,
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
    borderRadius: 10,
    // padding: 10,
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
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#4678e5ff",
    paddingVertical: 16,
    borderRadius: 10,
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
