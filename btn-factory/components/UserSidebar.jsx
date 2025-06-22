import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

// Dummy icon component
const Icon = ({ color, size }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 4, marginRight: 10 }} />
);

const UserSidebar = ({ menuItems, selectedMenu, onSelectMenu, userName, onSignOut }) => {
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.menuItem, selectedMenu === item.key && styles.menuItemSelected]}
      onPress={() => onSelectMenu(item.key)}
    >
      <Icon color={item.iconColor} size={20} />
      <Text style={styles.menuItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <View style={styles.avatar} />
        <Text style={styles.sidebarUserName}>{userName}</Text>
      </View>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.key}
        extraData={selectedMenu}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={onSignOut}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    backgroundColor: '#6c757d',
    borderRadius: 30,
    marginBottom: 10,
  },
  sidebarUserName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  menuItemSelected: {
    backgroundColor: '#e9ecef',
  },
  menuItemText: {
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#dc3545',
    borderRadius: 4,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UserSidebar;
