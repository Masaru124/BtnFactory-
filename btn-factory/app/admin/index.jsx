import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { Link } from "expo-router";
import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminDashboard() {
  const { signOut } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Fabricanna Supreme</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialIcons name="settings" size={26} color="#575757ff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Welcome, Admin</Text>

      {/* Stats Row */}
      {/* <View style={styles.statsRow}>
        <StatCard icon="group" label="Users" value="12" />
        <StatCard icon="assignment" label="Orders" value="58" />
        <StatCard icon="pending-actions" label="Pending" value="7" />
      </View> */}

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

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setModalVisible(false);
                signOut();
              }}
            >
              <MaterialIcons name="logout" size={22} color="#cc0000" />
              <Text style={[styles.modalText, { color: "#cc0000" }]}>
                Logout
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <MaterialIcons name={icon} size={20} color="#000" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AdminCard({ icon, title, desc, href }) {
  return (
    <Link href={href} asChild>
      <TouchableOpacity style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialIcons name={icon} size={24} color="#838383ff" />
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0273beff",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    backgroundColor: "#f0f0f0",
    borderRadius: 30,
    padding: 6,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  menu: {
    gap: 18,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  iconCircle: {
    backgroundColor: "#f2f2f2",
    borderRadius: 30,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    marginLeft: 14,
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  cardDesc: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#000",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  modalText: {
    fontSize: 16,
    color: "#000",
  },
  closeBtn: {
    marginTop: 20,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  closeText: {
    fontSize: 14,
    color: "#333",
  },
});
