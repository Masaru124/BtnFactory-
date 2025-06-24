// app/admin/users.jsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/api';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminUsers = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('Content-Type');

      if (!response.ok) {
        const errText = await response.text();
        console.error('Backend error:', errText);
        throw new Error('Failed to fetch users');
      }

      if (!contentType?.includes('application/json')) {
        throw new Error('Unexpected response format (expected JSON)');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id?.toString()}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.userCard}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.role}>{item.role}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  role: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});

export default AdminUsersScreen;
