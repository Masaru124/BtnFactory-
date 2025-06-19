import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UserWelcome = ({ userName, userEmail, userPhone, onViewProfile }) => {
  return (
    <View style={styles.contentCard}>
      <Text style={styles.contentTitle}>Welcome {userName}</Text>
      <Text>Email: {userEmail}</Text>
      <Text>Phone: {userPhone}</Text>
      <TouchableOpacity style={styles.viewProfileButton} onPress={onViewProfile}>
        <Text style={styles.viewProfileButtonText}>View Profile</Text>
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
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#6c757d',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  viewProfileButtonText: {
    color: '#6c757d',
    fontWeight: 'bold',
  },
});

export default UserWelcome;
