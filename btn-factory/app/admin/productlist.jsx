// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Alert,
//   Platform,
//   TouchableOpacity,
//   SafeAreaView,
//   RefreshControl,
// } from "react-native";
// import { API_URL } from "../../constants/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Link } from "expo-router";
// import { useFocusEffect } from "@react-navigation/native";

// function OrderListScreen() {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchOrders = async () => {
//     try {
//       const token = await AsyncStorage.getItem("userToken");
//       const response = await fetch(`${API_URL}/api/admin/orders`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setOrders(data);
//       } else {
//         Alert.alert("Error", data.message || "Failed to load orders");
//       }
//     } catch (error) {
//       console.error("Fetch orders error:", error);
//       Alert.alert("Error", "An unexpected error occurred");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchOrders();
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchOrders();
//     }, [])
//   );

//   if (loading && orders.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4f46e5" />
//         <Text style={styles.loadingText}>Loading orders...</Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>Order Management</Text>
//         <Text style={styles.subtitle}>
//           {orders.length} order{orders.length !== 1 ? "s" : ""} in system
//         </Text>
//       </View>

//       <FlatList
//         data={orders}
//         keyExtractor={(item) =>
//           item._id?.toString() || Math.random().toString()
//         }
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             tintColor="#4f46e5"
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No orders found</Text>
//             <Text style={styles.emptySubtext}>Pull down to refresh</Text>
//           </View>
//         }
//         renderItem={({ item }) => (
//           <Link
//             href={{
//               pathname: "/admin/order-details",
//               params: { order: JSON.stringify(item) },
//             }}
//             asChild
//           >
//             <TouchableOpacity style={styles.orderCard}>
//               <View style={styles.orderHeader}>
//                 <Text style={styles.orderNumber}>
//                   #{item._id?.slice(-6).toUpperCase()}
//                 </Text>
//                 <View
//                   style={[
//                     styles.statusBadge,
//                     { backgroundColor: getStatusColor(item.status) },
//                   ]}
//                 >
//                   <Text style={styles.statusText}>{item.status}</Text>
//                 </View>
//               </View>

//               <View style={styles.orderDetails}>
//                 <Text style={styles.companyName}>{item.companyName}</Text>
//                 <Text style={styles.poNumber}>
//                   PO: {item.poNumber || "N/A"}
//                 </Text>
//               </View>

//               <View style={styles.orderFooter}>
//                 <Text style={styles.dateText}>
//                   {new Date(item.createdDate).toLocaleDateString("en-US", {
//                     year: "numeric",
//                     month: "short",
//                     day: "numeric",
//                   })}
//                 </Text>
//                 <Text style={styles.itemsCount}>
//                   {item.items?.length || 0} item
//                   {item.items?.length !== 1 ? "s" : ""}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           </Link>
//         )}
//       />

//       <Link href="/admin/create-order" asChild>
//         <TouchableOpacity style={styles.createButton}>
//           <Text style={styles.createButtonText}>+ New Order</Text>
//         </TouchableOpacity>
//       </Link>
//     </SafeAreaView>
//   );
// }

// const getStatusColor = (status) => {
//   switch (status?.toLowerCase()) {
//     case "pending":
//       return "#f59e0b";
//     case "completed":
//       return "#10b981";
//     case "shipped":
//       return "#3b82f6";
//     case "cancelled":
//       return "#ef4444";
//     default:
//       return "#64748b";
//   }
// };

//

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
import { Ionicons } from "@expo/vector-icons";
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Order Management</Text>
        </View>
        <Link href="/admin/create-order" asChild>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#4f46e5" />
          </TouchableOpacity>
        </Link>
      </View>
      <Text style={styles.subtitle}>
        {orders.length} order{orders.length !== 1 ? "s" : ""} in system
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id?.toString() || `temp-${Date.now()}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#64748b"
              />
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
              <View style={styles.orderHeader}>
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

              <View style={styles.orderDetails}>
                <Text style={styles.companyName}>
                  {item.companyName || "No company"}
                </Text>
                <Text style={styles.poNumber}>
                  PO: {item.poNumber || "N/A"}
                </Text>
              </View>

              <View style={styles.orderFooter}>
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
      return "#64748b";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffffff",
  },
  loadingText: {
    marginTop: 16,
    color: "#64748b",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 18,
    color: "#64748b",
    marginTop: 4,
    marginLeft: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderWidth: 0.5,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 9,
    borderRadius: 1,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  orderDetails: {
    marginBottom: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  poNumber: {
    fontSize: 14,
    color: "#64748b",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#64748b",
  },
  itemsCount: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
  createButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#4f46e5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default OrderListScreen;
