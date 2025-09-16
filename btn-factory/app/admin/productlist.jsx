import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Platform,
} from "react-native";
import { API_URL } from "../../constants/api";
import { Link } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import BackButton from "../../components/BackButton";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";

function OrderListScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const { userToken, userRoles } = useContext(AuthContext);

  const fetchOrders = async () => {
    if (!userToken) {
      setError("You must be logged in to view orders");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load orders");
      }

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Unexpected response format");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [userToken]);

  useEffect(() => {
    if (userRoles && !userRoles.includes("admin")) {
      Alert.alert("Unauthorized", "Admin access required");
      return;
    }
    fetchOrders();
  }, [userToken, userRoles]);

  useFocusEffect(
    useCallback(() => {
      if (userToken && userRoles?.includes("admin")) {
        fetchOrders();
      }
    }, [userToken, userRoles])
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Order Management</Text>
        <Link href="/admin/create-order" asChild>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.headerButtonText}>New</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {orders.length} order{orders.length !== 1 ? "s" : ""} in system
      </Text>

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="warning-outline" size={18} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id?.toString() || `temp-${Date.now()}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/admin/order-details",
              params: { order: JSON.stringify(item) },
            }}
            asChild
          >
            <TouchableOpacity style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="inventory" size={22} color="#000" />
                <Text style={styles.orderNumber}>
                  #{item._id?.slice(-6).toUpperCase() || "N/A"}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {item.status || "Unknown"}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.companyName}>
                  {item.companyName || "No company"}
                </Text>
                <Text style={styles.poNumber}>
                  PO: {item.poNumber || "N/A"}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.dateText}>
                  {item.createdDate
                    ? new Date(item.createdDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    : "No date"}
                </Text>
                <Text style={styles.itemsCount}>
                  {item.items?.length || 0} item
                  {item.items?.length !== 1 ? "s" : ""}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "#f59e0b";
    case "completed":
      return "#10b981";
    case "shipped":
      return "#3b82f6";
    case "cancelled":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centeredContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6b7280" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#000" },
  subtitle: { fontSize: 15, color: "#6b7280", marginBottom: 8, marginLeft: 16 },

  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerButtonText: { color: "#fff", fontWeight: "600", marginLeft: 4 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  errorText: { marginLeft: 6, color: "#dc2626", fontWeight: "500" },

  listContent: { padding: 16, paddingBottom: 100 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  orderNumber: { fontSize: 16, fontWeight: "600", color: "#000", flex: 1, marginLeft: 6 },
  statusBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  cardBody: { marginBottom: 8 },
  companyName: { fontSize: 16, fontWeight: "600", color: "#000" },
  poNumber: { fontSize: 14, color: "#6b7280" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between" },
  dateText: { fontSize: 13, color: "#6b7280" },
  itemsCount: { fontSize: 13, fontWeight: "500", color: "#6b7280" },

  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { fontSize: 16, fontWeight: "500", color: "#374151" },
  emptySubtext: { fontSize: 14, color: "#6b7280" },
});

export default OrderListScreen;
