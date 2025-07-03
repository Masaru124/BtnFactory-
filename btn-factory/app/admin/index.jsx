import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

export default function AdminDashboard() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>Manage users, products, and settings</Text>
      </View>

      {/* Menu Cards */}
      <View style={styles.menuContainer}>
        <Link href="/admin/add-user" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>➕ Add User</Text>
            <Text style={styles.cardDescription}>Create new user accounts</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin/manage-users" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>👥 Manage Users</Text>
            <Text style={styles.cardDescription}>Edit or remove existing users</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin/productlist" asChild>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardTitle}>📦 Orders Inventory</Text>
            <Text style={styles.cardDescription}>View and manage orders</Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 16,
  },
});