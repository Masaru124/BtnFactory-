import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { API_URL } from "../../constants/api";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const RawMaterialDepartment = () => {
  const { signOut, userToken } = useContext(AuthContext);
  const [token, setToken] = useState("");
  const [materials, setMaterials] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionVisible, setAccordionVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const fetchOrder = async () => {
    if (!token) return Alert.alert("Error", "Please enter a valid token");

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/staff/orders/${token}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Order not found");
      }

      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      Alert.alert("Error", error.message);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = () => {
    setMaterials([...materials, { materialName: "", quantity: "", totalPrice: "" }]);
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  const handleSubmit = async () => {
    if (
      materials.some(
        (m) =>
          !m.materialName.trim() ||
          m.quantity === "" ||
          m.totalPrice === "" ||
          isNaN(Number(m.quantity)) ||
          isNaN(Number(m.totalPrice))
      )
    ) {
      Alert.alert("Validation Error", "Please fill all fields with valid values.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/raw-material/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            materials: materials.map((m) => ({
              materialName: m.materialName.trim(),
              quantity: Number(m.quantity),
              totalPrice: Number(m.totalPrice),
            })),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update raw material details");

      Alert.alert("Success", "Material details updated successfully");
      setMaterials([{ materialName: "", quantity: "", totalPrice: "" }]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const OrderDetail = ({ label, value }) => {
    const isImageUrl =
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"));

    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        {isImageUrl ? (
          <Image source={{ uri: value }} style={styles.detailImage} resizeMode="cover" />
        ) : (
          <Text style={styles.detailValue}>{value || "—"}</Text>
        )}
      </View>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fabricanna Supreme</Text>
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={styles.iconButton}
        >
          <Ionicons name="settings-outline" size={24} color="#636363ff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* SEARCH */}
        <Text style={styles.Title}>Raw Material Staff</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Enter Token Number</Text>
          <View style={styles.searchRow}>
            {/* <Ionicons name="key-outline" size={20} color="#6b7280" /> */}
            <TextInput
              style={styles.input}
              value={token}
              onChangeText={setToken}
              placeholder="Enter order token"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={fetchOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Search Order</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ORDER DETAILS */}
        {orderDetails && (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() => setAccordionVisible(!accordionVisible)}
              style={styles.accordionHeader}
            >
              <Text style={styles.accordionTitle}>
                {accordionVisible ? "Hide Order Details" : "Show Order Details"}
              </Text>
              <Ionicons
                name={accordionVisible ? "chevron-up" : "chevron-down"}
                size={20}
                color="#4b5563"
              />
            </TouchableOpacity>

            {accordionVisible && (
              <View style={styles.accordionContent}>
                <OrderDetail label="Button Image" value={orderDetails.buttonImage} />
                <OrderDetail label="Quantity" value={orderDetails.rawMaterial?.quantity} />
                <OrderDetail
                  label="Last Updated"
                  value={formatDate(orderDetails.rawMaterial?.updatedAt)}
                />
              </View>
            )}
          </View>
        )}

        {/* UPDATE FORM */}
        {orderDetails && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Update Material Details</Text>

            {materials.map((mat, index) => (
              <View key={index} style={styles.materialBlock}>
                <TextInput
                  style={styles.input}
                  value={mat.materialName}
                  onChangeText={(val) => handleMaterialChange(index, "materialName", val)}
                  placeholder="Material Name"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={mat.quantity}
                  onChangeText={(val) => handleMaterialChange(index, "quantity", val)}
                  placeholder="Quantity"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={mat.totalPrice}
                  onChangeText={(val) => handleMaterialChange(index, "totalPrice", val)}
                  placeholder="Total Price (₹)"
                  placeholderTextColor="#9ca3af"
                />
                {materials.length > 1 && (
                  <TouchableOpacity
                    style={styles.dangerButton}
                    onPress={() =>
                      setMaterials(materials.filter((_, i) => i !== index))
                    }
                  >
                    <Text style={styles.buttonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]}
                onPress={addMaterial}
              >
                <Ionicons name="add-circle-outline" size={18} color="#2563eb" />
                <Text style={[styles.secondaryButtonText, { marginLeft: 6 }]}>
                  Add Material
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>Update Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* SETTINGS BOTTOM SHEET */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setSettingsVisible(false)}>
          <View style={styles.sheet}>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={() => {
                setSettingsVisible(false);
                signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.sheetText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  Title: {
    fontSize: 18, fontWeight: "600", color: "#000000ff"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffffff",
    padding: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#000000ff" },
  iconButton: { padding: 6 },

  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#111827" },
  searchRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
  },

  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: { color: "#2563eb", fontWeight: "600", fontSize: 14 },

  dangerButton: {
    marginTop: 8,
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  buttonRow: { flexDirection: "row", marginTop: 16 },

  accordionHeader: { flexDirection: "row", justifyContent: "space-between" },
  accordionTitle: { fontSize: 14, fontWeight: "500", color: "#374151" },
  accordionContent: { marginTop: 12, gap: 8 },

  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  detailLabel: { fontSize: 13, color: "#6b7280" },
  detailValue: { fontSize: 13, color: "#111827", fontWeight: "500" },
  detailImage: { width: 100, height: 100, borderRadius: 6 },
  materialBlock: { marginBottom: 16 },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  sheetText: { fontSize: 16, fontWeight: "500", color: "#ef4444" },
});

export default RawMaterialDepartment;
