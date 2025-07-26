import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import RawMaterialDepartment from './RawMaterialDepartment';
import CastingDepartment from './CastingDepartment';

const StaffScreen = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext is null');
  }

  const { signOut, user } = authContext;
  const [message, setMessage] = useState('');

  const handleRawMaterialSubmit = async (data) => {
    try {
      const response = await fetch(`/api/staff/orders/raw-material/${data.token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialName: data.materialName,
          quantity: data.quantity,
          totalPrice: data.totalPrice,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update raw material details');
      }
      setMessage('Raw material details updated successfully');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleCastingSubmit = async (data) => {
    try {
      const response = await fetch(`/api/staff/orders/casting-process/${data.token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawMaterialsUsed: data.rawMaterialsUsed,
          sheetsMade: data.sheetsMade,
          sheetsWasted: data.sheetsWasted,
          startTime: data.startTime,
          endTime: data.endTime,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update casting process data');
      }
      setMessage('Casting process data updated successfully');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const renderDepartmentInterface = () => {
    switch (user.department) {
      case 'Raw Material':
        return <RawMaterialDepartment onSubmit={handleRawMaterialSubmit} />;
      case 'Casting':
        return <CastingDepartment onSubmit={handleCastingSubmit} />;
      default:
        return <Text>No interface available for your department.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Staff Dashboard</Text>
      {renderDepartmentInterface()}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Button title="Logout" onPress={signOut} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    marginVertical: 10,
    color: 'green',
    textAlign: 'center',
  },
});

export default StaffScreen;
