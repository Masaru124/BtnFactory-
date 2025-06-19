import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserHeader = ({ companyName, userName }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerWelcome}>Welcome: {companyName || 'Company'}</Text>
      <Text style={styles.headerLoggedIn}>CURRENTLY LOGGED IN {userName || ''}</Text>
      <View style={styles.headerRight}>
        <View style={styles.notificationIcon} />
        <View style={styles.avatarSmall} />
        <Text style={styles.headerUserName}>{userName || ''}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: '#0d6efd',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  headerWelcome: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerLoggedIn: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    marginRight: 10,
  },
  avatarSmall: {
    width: 30,
    height: 30,
    backgroundColor: '#6c757d',
    borderRadius: 15,
    marginRight: 10,
  },
  headerUserName: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UserHeader;
