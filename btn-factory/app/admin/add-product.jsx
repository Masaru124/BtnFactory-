import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const handleAddProduct = async () => {
    const token = await AsyncStorage.getItem('userToken');

    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
    };

    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Product added successfully');
        setName('');
        setDescription('');
        setPrice('');
        setStock('');
      } else {
        Alert.alert('Error', data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Add product error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />
      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Stock Quantity"
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button
        title="Add Product"
        onPress={handleAddProduct}
        color="#4CAF50"
      />

      <Link href="/admin" style={styles.backLink}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  backLink: {
    marginTop: 20,
  },
  backText: {
    color: '#2196F3',
    textAlign: 'center',
  },
});
