import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const UserManageProfile = ({ userName, userEmail, userPhone, setUserName, setUserEmail, setUserPhone, onSaveProfile }) => {
  return (
    <View style={styles.contentCard}>
      <Text style={styles.contentTitle}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={userEmail}
        onChangeText={setUserEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={userPhone}
        onChangeText={setUserPhone}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={onSaveProfile}
      >
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  contentTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 40,
    marginTop: 5,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UserManageProfile;
