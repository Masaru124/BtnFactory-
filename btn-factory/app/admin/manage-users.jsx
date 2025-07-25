import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
  Platform,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";

const ManageUsers = () => {
  const { userToken, isAdmin } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to load users");

      setUsers(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const deleteUser = async (username) => {
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
              const res = await fetch(
                `${API_URL}/api/admin/users/${username}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${userToken}`,
                  },
                }
              );

              if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to delete user");
              }

              setUsers((prevUsers) =>
                prevUsers.filter((u) => u.username !== username)
              );
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
  });

  if (!isAdmin) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>⚠️ Admin Access Required</Text>
        <Text style={styles.errorSubtext}>
          You do not have permission to view this page
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>
          {users.length} user{users.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.username}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4f46e5"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Roles:</Text>
                <Text style={styles.detailValue}>
                  {(item.roles || []).join(", ") || "None"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Departments:</Text>
                <Text style={styles.detailValue}>
                  {(item.departments || []).join(", ") || "None"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => deleteUser(item.username)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    paddingTop:10
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  userCard: {
    backgroundColor: "#ffffff",
    borderRadius: 1,
    borderWidth:0.2,
    padding: 8,
    paddingHorizontal:12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    color: "#334155",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
  },
});

export default ManageUsers;
