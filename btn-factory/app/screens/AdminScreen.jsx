import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../contexts/AuthContext';

const AdminScreen = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext is null');
  }

  const { signOut } = authContext;

  // State for user form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState(['user']);
  const [departments, setDepartments] = useState([]);

  // State for product form
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');

  // State for existing users
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [newRoles, setNewRoles] = useState(['user']);
  const [newDepartments, setNewDepartments] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        Alert.alert('Error', 'Failed to fetch users');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch users');
    }
  };

  const handleUpdateUserRoles = async () => {
    if (!selectedUser || !newRoles.length) {
      Alert.alert('Error', 'Please select a user and at least one role');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser}/roles`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roles: newRoles, departments: newDepartments }),
      });
      if (response.ok) {
        Alert.alert('Success', 'User roles updated');
        setSelectedUser(undefined);
        setNewRoles(['user']);
        setNewDepartments([]);
        fetchUsers();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to update user roles');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update user roles');
    }
  };

  const handleAddUser = async () => {
    if (!username || !password || !roles.length) {
      Alert.alert('Error', 'Please fill all user fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, password, roles, departments }),
      });
      if (response.ok) {
        Alert.alert('Success', 'User added successfully');
        setUsername('');
        setPassword('');
        setRoles(['user']);
        setDepartments([]);
        fetchUsers();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to add user');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add user');
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !productDescription || !productPrice || !productStock) {
      Alert.alert('Error', 'Please fill all product fields');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productName,
          description: productDescription,
          price: parseFloat(productPrice),
          stock: parseInt(productStock, 10),
        }),
      });
      if (response.ok) {
        Alert.alert('Success', 'Product added successfully');
        setProductName('');
        setProductDescription('');
        setProductPrice('');
        setProductStock('');
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to add product');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add product');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <Text style={styles.sectionTitle}>Add User</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Text style={styles.label}>Select Roles</Text>
      <Picker
        selectedValue={roles[0]}
        onValueChange={(itemValue) => setRoles([itemValue])}
        style={styles.picker}
      >
        <Picker.Item label="User" value="user" />
        <Picker.Item label="Staff" value="staff" />
        <Picker.Item label="Admin" value="admin" />
      </Picker>
      <Text style={styles.label}>Select Departments</Text>
      <Picker
        selectedValue={departments[0]}
        onValueChange={(itemValue) => setDepartments([itemValue])}
        style={styles.picker}
      >
        <Picker.Item label="Production" value="Production" />
        <Picker.Item label="Quality" value="Quality" />
        <Picker.Item label="Packing" value="Packing" />
        <Picker.Item label="Accounting" value="Accounting" />
        <Picker.Item label="Inventory" value="Inventory" />
      </Picker>
      <Button title="Add User" onPress={handleAddUser} />

      <Text style={styles.sectionTitle}>Manage Users</Text>
      <Picker
        selectedValue={selectedUser}
        onValueChange={(itemValue) => setSelectedUser(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select User" value={undefined} />
        {users.map((user) => (
          <Picker.Item key={user.username} label={`${user.username} (${user.roles ? user.roles.join(', ') : user.role})`} value={user.username} />
        ))}
      </Picker>
      <Text style={styles.label}>Update Roles</Text>
      <Picker
        selectedValue={newRoles[0]}
        onValueChange={(itemValue) => setNewRoles([itemValue])}
        style={styles.picker}
      >
        <Picker.Item label="User" value="user" />
        <Picker.Item label="Staff" value="staff" />
        <Picker.Item label="Admin" value="admin" />
      </Picker>
      <Text style={styles.label}>Update Departments</Text>
      <Picker
        selectedValue={newDepartments[0]}
        onValueChange={(itemValue) => setNewDepartments([itemValue])}
        style={styles.picker}
      >
        <Picker.Item label="Production" value="Production" />
        <Picker.Item label="Quality" value="Quality" />
        <Picker.Item label="Packing" value="Packing" />
        <Picker.Item label="Accounting" value="Accounting" />
        <Picker.Item label="Inventory" value="Inventory" />
      </Picker>
      <Button title="Update Roles" onPress={handleUpdateUserRoles} />

      <Text style={styles.sectionTitle}>Add Product</Text>
      <TextInput
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
        style={styles.input}
      />
      <TextInput
        placeholder="Product Description"
        value={productDescription}
        onChangeText={setProductDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={productPrice}
        onChangeText={setProductPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Stock"
        value={productStock}
        onChangeText={setProductStock}
        style={styles.input}
        keyboardType="numeric"
      />
      <Button title="Add Product" onPress={handleAddProduct} />

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={signOut} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    marginBottom: 12,
  },
});

export default AdminScreen;
