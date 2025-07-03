import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from "react-native";
import { API_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";

function OrderListScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOrders(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
        <Text style={styles.title}>Order Management</Text>
        <Text style={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} in system
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4f46e5"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
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
                <Text style={styles.orderNumber}>#{item._id?.slice(-6).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              
              <View style={styles.orderDetails}>
                <Text style={styles.companyName}>{item.companyName}</Text>
                <Text style={styles.poNumber}>PO: {item.poNumber || 'N/A'}</Text>
              </View>
              
              <View style={styles.orderFooter}>
                <Text style={styles.dateText}>
                  {new Date(item.createdDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.itemsCount}>
                  {item.items?.length || 0} item{item.items?.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />

      <Link href="/admin/create-order" asChild>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>+ New Order</Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '#f59e0b';
    case 'completed':
      return '#10b981';
    case 'shipped':
      return '#3b82f6';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDetails: {
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  poNumber: {
    fontSize: 14,
    color: '#64748b',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
  },
  itemsCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4f46e5',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default OrderListScreen;