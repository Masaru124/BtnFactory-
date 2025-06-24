import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import {API_URL} from '../../constants/api';

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [ordersRes, challansRes] = await Promise.all([
          fetch(`${API_URL}/api/user/orders`, { headers }),
          fetch(`${API_URL}/api/useruser/challans`, { headers }),
        ]);

        const ordersData = await ordersRes.json();
        const challansData = await challansRes.json();

        setOrders(ordersData || []);
        setChallans(challansData || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.name || 'User'}</Text>

      <View style={styles.cardRow}>
        <View style={[styles.card, { backgroundColor: '#007bff' }]}>
          <Text style={styles.cardTitle}>Your Orders</Text>
          <Text style={styles.cardCount}>{orders.length}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#28a745' }]}>
          <Text style={styles.cardTitle}>Your Challans</Text>
          <Text style={styles.cardCount}>{challans.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  welcome: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  cardCount: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
});
