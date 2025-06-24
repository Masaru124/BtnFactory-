import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert, ScrollView, FlatList } from 'react-native';
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

  // New states for orders, challans, customer history, promotion schemes
  const [orders, setOrders] = useState([]);
  const [challans, setChallans] = useState([]);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [promotionSchemes, setPromotionSchemes] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    fetchChallans();
    fetchCustomerHistory();
    fetchPromotionSchemes();
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

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/user/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        Alert.alert('Error', 'Failed to fetch orders');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch orders');
    }
  };

  const fetchChallans = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/user/challans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setChallans(data);
      } else {
        Alert.alert('Error', 'Failed to fetch challans');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch challans');
    }
  };

  const fetchCustomerHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/user/customer-history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCustomerHistory(data);
      } else {
        Alert.alert('Error', 'Failed to fetch customer history');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch customer history');
    }
  };

  const fetchPromotionSchemes = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/api/user/promotion-schemes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPromotionSchemes(data);
      } else {
        Alert.alert('Error', 'Failed to fetch promotion schemes');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch promotion schemes');
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

  // Render functions for new data lists
  const handleApproveOrder = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/api/user/orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        Alert.alert('Success', 'Order approved');
        fetchOrders();
      } else {
        Alert.alert('Error', 'Failed to approve order');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve order');
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>Token: {item.token}</Text>
      <Text>Button: {item.button}</Text>
      <Text>Order Qty: {item.orderQty}</Text>
      <Text>Challan Qty: {item.challanQty}</Text>
      <Text>Laser: {item.laser}</Text>
      <Text>Created Date: {new Date(item.createdDate).toLocaleString()}</Text>
      <Button title="Approve Order" onPress={() => handleApproveOrder(item._id)} />
    </View>
  );

  const handleApproveChallan = async (challanId) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/api/user/challans/${challanId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        Alert.alert('Success', 'Challan approved');
        fetchChallans();
      } else {
        Alert.alert('Error', 'Failed to approve challan');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve challan');
    }
  };

  const renderChallanItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>Challan Number: {item.challanNumber}</Text>
      <Text>Order Token: {item.orderToken}</Text>
      <Text>Quantity: {item.quantity}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Created Date: {new Date(item.createdDate).toLocaleString()}</Text>
      <Button title="Approve Challan" onPress={() => handleApproveChallan(item._id)} />
    </View>
  );

  const renderCustomerHistoryItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>Customer Name: {item.customerName}</Text>
      <Text>Token: {item.token}</Text>
      <Text>Button: {item.button}</Text>
      <Text>Order Qty: {item.orderQty}</Text>
      <Text>Challan Qty: {item.challanQty}</Text>
      <Text>Laser: {item.laser}</Text>
      <Text>Created Date: {new Date(item.createdDate).toLocaleString()}</Text>
      <Text>Action: {item.action}</Text>
    </View>
  );

  const renderPromotionSchemeItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>Total QR: {item.totalQR}</Text>
      <Text>Used QR: {item.usedQR}</Text>
      <Text>Unused QR: {item.unusedQR}</Text>
      <Text>Creation Date: {new Date(item.creationDate).toLocaleString()}</Text>
      <Text>Total Approved: {item.totalApproved}</Text>
      <Text>Total Unapproved: {item.totalUnapproved}</Text>
      <Text>Positive Response: {item.positiveResponse}</Text>
      <Text>Negative Response: {item.negativeResponse}</Text>
    </View>
  );

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

      <Text style={styles.sectionTitle}>Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
      />

      <Text style={styles.sectionTitle}>Challans</Text>
      <FlatList
        data={challans}
        keyExtractor={(item) => item._id}
        renderItem={renderChallanItem}
      />

      <Text style={styles.sectionTitle}>Customer History</Text>
      <FlatList
        data={customerHistory}
        keyExtractor={(item) => item._id}
        renderItem={renderCustomerHistoryItem}
      />

      <Text style={styles.sectionTitle}>Promotion Schemes</Text>
      <FlatList
        data={promotionSchemes}
        keyExtractor={(item) => item._id}
        renderItem={renderPromotionSchemeItem}
      />

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
  listItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default AdminScreen;
