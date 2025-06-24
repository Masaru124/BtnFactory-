import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Manage your app</Text>

      <View style={styles.menuContainer}>
        <Link href="/admin/add-user" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Add User</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin/manage-users" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Manage Users</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/admin/productlist" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>All Product</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: width * 0.08,
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 32,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  menuContainer: {
    gap: 16,
    marginBottom: 40,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  menuText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});
