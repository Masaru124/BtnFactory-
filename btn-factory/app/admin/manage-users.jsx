import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";
import { MaterialIcons } from "@expo/vector-icons";

const ManageUsers = () => {
  const { userToken, isAdmin } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load users");
      setUsers(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = (username) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete user "${username}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/api/admin/users/${username}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userToken}` },
              });

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to delete user");
              }

              setUsers((prev) => prev.filter((u) => u.username !== username));
              Alert.alert("Success", "User deleted successfully");
            } catch (err) {
              Alert.alert("Error", err.message);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <View style={styles.centeredContainer}>
        <MaterialIcons name="lock" size={48} color="#dc2626" />
        <Text style={styles.errorText}>Admin Access Required</Text>
        <Text style={styles.errorSubtext}>
          You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>User Management</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* User List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.username}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <MaterialIcons name="person-off" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            {/* Avatar / Icon */}
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={28} color="#000" />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Role</Text>
                <Text style={styles.detailValue}>
                  {(item.roles || []).join(", ") || "None"}
                </Text>
              </View>

              {item.roles?.includes("staff") && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Department</Text>
                  <Text style={styles.detailValue}>
                    {(item.departments || []).join(", ") || "None"}
                  </Text>
                </View>
              )}
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={() => deleteUser(item.username)}
              style={styles.deleteIconBtn}
            >
              <MaterialIcons name="delete" size={22} color="#dc2626" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "600", color: "#000" },

  listContent: { paddingHorizontal: 16, paddingBottom: 32 },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: { flex: 1 },
  username: { fontSize: 16, fontWeight: "600", color: "#111827" },
  detailRow: { flexDirection: "row", marginTop: 2 },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginRight: 6,
  },
  detailValue: { fontSize: 12, color: "#374151", flexShrink: 1 },

  deleteIconBtn: { padding: 6 },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { marginTop: 12, color: "#6b7280" },
  errorText: { fontSize: 18, fontWeight: "600", color: "#dc2626", marginTop: 8 },
  errorSubtext: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  emptyText: { fontSize: 16, color: "#6b7280", marginTop: 8 },
});

export default ManageUsers;
