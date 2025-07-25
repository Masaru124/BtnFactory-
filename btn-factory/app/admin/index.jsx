import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext"; // <- adjust if needed
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminDashboard() {
  const { signOut } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fabricanna Supreme</Text>
        <Text style={styles.subtitle}>Welcome, Admin</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <AdminCard
          icon="person-add-alt"
          title="Add User"
          desc="Create new team accounts"
          href="/admin/add-user"
        />
        <AdminCard
          icon="group"
          title="Manage Users"
          desc="Edit or delete user access"
          href="/admin/manage-users"
        />
        <AdminCard
          icon="inventory"
          title="Orders Inventory"
          desc="Track and manage orders"
          href="/admin/productlist"
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <MaterialIcons name="logout" size={20} color="#cc0000ff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function AdminCard({ icon, title, desc, href }) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.card}>
        <MaterialIcons name={icon} size={28} color="#4e4e4e" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDesc}>{desc}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
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
  menu: {
    gap: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fdfdfdff",
    borderColor: "#000000",
    borderWidth: 0.19,
    padding: 16,
  },
  cardContent: {
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 18,
    color: "#000",
  },
  cardDesc: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  logoutBtn: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: "#cf0000ff",
    marginBottom: 20,
  },
  logoutText: {
    color: "#c90000ff",
    fontSize: 16,
    fontWeight: "500",
  },
});
