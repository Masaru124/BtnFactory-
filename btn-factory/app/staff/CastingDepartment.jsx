import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { API_URL } from '../../constants/api';

const CastingDepartment = ({ onSubmit }) => {
  const { token: authToken } = useContext(AuthContext);

  const [orderToken, setOrderToken] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [rawMaterialsUsed, setRawMaterialsUsed] = useState('');
  const [sheetsMade, setSheetsMade] = useState('');
  const [sheetsWasted, setSheetsWasted] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  const fetchOrderData = async (orderToken) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderToken}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const text = await response.text();
        setError(text || 'Order not found');
        setOrderData(null);
        return;
      }

      const data = await response.json();
      setOrderData(data);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error fetching order');
    }
  };

  useEffect(() => {
    if (orderToken.trim()) {
      fetchOrderData(orderToken);
    } else {
      setOrderData(null);
      setError('');
    }
  }, [orderToken]);

  const handleSubmit = async () => {
    if (!authToken) {
      setError('Not authenticated');
      return;
    }

    if (
      !orderToken ||
      !rawMaterialsUsed ||
      isNaN(sheetsMade) ||
      isNaN(sheetsWasted) ||
      !startTime ||
      !endTime
    ) {
      Alert.alert('Validation Error', 'Please fill all fields correctly.');
      return;
    }

    const body = {
      orderToken,
      rawMaterialsUsed,
      sheetsMade: Number(sheetsMade),
      sheetsWasted: Number(sheetsWasted),
      startTime,
      endTime,
    };

    try {
      const res = await fetch(`${API_URL}/api/casting/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to submit');
      }

      onSubmit?.(result);
      Alert.alert('Success', 'Submitted successfully');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Casting Department</Text>

      <Text style={styles.label}>Order Token:</Text>
      <TextInput
        style={styles.input}
        value={orderToken}
        onChangeText={setOrderToken}
        placeholder="Enter order token"
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {orderData && (
        <View style={styles.infoBox}>
          <Text>🖼️ Image: {orderData.buttonImage || 'N/A'}</Text>
          <Text>🧪 Casting Type: {orderData.casting}</Text>
          <Text>📏 Number of Lines: {orderData.linings ?? 'N/A'}</Text>
          <Text>🕳️ Number of Holes: {orderData.holes}</Text>
          <Text>📦 Quantity: {orderData.quantity ?? 'N/A'}</Text>
          <Text>🔩 Raw Materials: {orderData.rawMaterial?.materialName || 'N/A'}</Text>
        </View>
      )}

      <Text style={styles.label}>Raw Materials Used:</Text>
      <TextInput
        style={styles.input}
        value={rawMaterialsUsed}
        onChangeText={setRawMaterialsUsed}
        placeholder="e.g., 10kg alloy"
      />

      <Text style={styles.label}>Sheets Made:</Text>
      <TextInput
        style={styles.input}
        value={sheetsMade}
        onChangeText={setSheetsMade}
        keyboardType="numeric"
        placeholder="Number"
      />

      <Text style={styles.label}>Sheets Wasted:</Text>
      <TextInput
        style={styles.input}
        value={sheetsWasted}
        onChangeText={setSheetsWasted}
        keyboardType="numeric"
        placeholder="Number"
      />

      <Text style={styles.label}>Start Time:</Text>
      <TextInput
        style={styles.input}
        value={startTime}
        onChangeText={setStartTime}
        placeholder="HH:MM"
      />

      <Text style={styles.label}>End Time:</Text>
      <TextInput
        style={styles.input}
        value={endTime}
        onChangeText={setEndTime}
        placeholder="HH:MM"
      />

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default CastingDepartment;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  error: {
    color: 'red',
    marginVertical: 8,
  },
  infoBox: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
});
