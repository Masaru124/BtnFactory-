import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Link } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const menuItems = [
  {
    key: "trackorder",
    label: "Track Order",
    icon: "truck-fast-outline",
  },
  {
    key: "userOrders",
    label: "Create Order",
    icon: "plus-circle-outline",
  },
  {
    key: "ordersListScreen",
    label: "My Orders",
    icon: "format-list-bulleted",
  },
];

export default function UserHome() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.title}>Fabricanna Supreme</Text>
          <Text style={styles.subtitle}>Welcome, User</Text>{" "}
        </View>
      </View>

      {/* Menu Buttons */}
      <FlatList
        data={menuItems}
        contentContainerStyle={styles.menuList}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Link href={`/user/${item.key}`} asChild>
            <TouchableOpacity style={styles.menuButton}>
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color="#5d5d5d"
                style={styles.menuIcon}
              />
              <Text style={styles.menuButtonText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#000000ff" />
            </TouchableOpacity>
          </Link>
        )}
      />

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={22} color="#e74c3c" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: "#ffffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    borderBottomWidth: 0,
    borderBottomColor: "#eaeaea",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0186bbff",
  },
  subtitle: {
    fontSize: 20,
    color: "#000000ff",
    marginTop: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#ffffffff",
  },
  menuList: {
    paddingBottom: 20,
  },
  menuButton: {
    backgroundColor: "#ffffffff",
    paddingVertical: 20,
    borderWidth: 0.3,
    paddingHorizontal: 10,
    borderRadius: 1,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    marginRight: 15,
    width: 24,
  },
  menuButtonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    marginTop: "auto",
    marginBottom: 30,
    borderRadius: 1,
    backgroundColor: "#fff",
    borderWidth: 0.3,
    borderColor: "#c70000ff",
  },
  logoutText: {
    color: "#e74c3c",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
});
