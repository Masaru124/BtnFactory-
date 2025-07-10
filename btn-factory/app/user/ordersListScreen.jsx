import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext'; // adjust path if needed
import { API_URL } from '../../constants/api'; // ensure your API URL is set correctly

export default function OrdersListScreen() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null); // currently expanded order ID

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn('Unexpected orders response:', data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const renderOrderItem = ({ item }) => {
    const isExpanded = expanded === item._id;

    return (
      <View style={styles.card}>
        <Text style={styles.company}>{item.companyName}</Text>
        <Text style={styles.label}>PO Number:</Text>
        <Text>{item.poNumber}</Text>
        <Text style={styles.label}>Casting:</Text>
        <Text>{item.casting}</Text>
        <Text style={styles.label}>Rate:</Text>
        <Text>₹ {item.rate}</Text>
        <Text style={styles.label}>Status:</Text>
        <Text>{item.status}</Text>

        {isExpanded && (
          <View style={styles.expanded}>
            <Text style={styles.label}>PO Date:</Text>
            <Text>{new Date(item.poDate).toLocaleDateString()}</Text>
            <Text style={styles.label}>Thickness:</Text>
            <Text>{item.thickness}</Text>
            <Text style={styles.label}>Holes:</Text>
            <Text>{item.holes}</Text>
            <Text style={styles.label}>Box Type:</Text>
            <Text>{item.boxType}</Text>
            <Text style={styles.label}>Token:</Text>
            <Text>{item.token}</Text>
            <Text style={styles.label}>Created:</Text>
            <Text>{new Date(item.createdDate).toLocaleString()}</Text>
            {item.rawMaterials && (
              <>
                <Text style={styles.label}>Raw Materials:</Text>
                {Array.isArray(item.rawMaterials)
                  ? item.rawMaterials.map((rm, index) => (
                      <Text key={index}>• {rm}</Text>
                    ))
                  : <Text>{item.rawMaterials}</Text>}
              </>
            )}
          </View>
        )}

        <TouchableOpacity onPress={() => toggleExpand(item._id)}>
          <Text style={styles.detailsToggle}>
            {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Orders</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>No orders found.</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  list: {
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#f4f4f4',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  company: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#444',
  },
  label: {
    fontWeight: '600',
    marginTop: 6,
    color: '#555',
  },
  expanded: {
    marginTop: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 6,
    padding: 10,
  },
  detailsToggle: {
    marginTop: 10,
    color: '#007bff',
    fontWeight: '500',
    textAlign: 'right',
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});
