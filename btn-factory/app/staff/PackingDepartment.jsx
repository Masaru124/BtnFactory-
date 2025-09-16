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
  Modal,
  Pressable,
} from "react-native";
import { API_URL } from "../../constants/api";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const PackingDepartment = ({ onSubmit }) => {
  const { signOut, userToken } = useContext(AuthContext);

  const [token, setToken] = useState("");
  const [PackingDate, setPackingDate] = useState("");
  const [ReceivedDate, setReceivedDate] = useState("");
  const [showPackingDate, setShowPackingDate] = useState(false);
  const [showReceivedDate, setShowReceivedDate] = useState(false);
  const [GrossWeight, setGrossWeight] = useState("");
  const [WtinKg, setWtinKg] = useState("");
  const [FinishType, setFinishType] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionVisible, setAccordionVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const fetchOrder = async () => {
    if (!token) {
      Alert.alert("Error", "Please enter a valid token");
      return;
    }

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
      console.error("Error fetching order:", error.message);
      Alert.alert("Error", error.message);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!PackingDate || !ReceivedDate || !GrossWeight || !WtinKg || !FinishType) {
      Alert.alert("Error", "Please fill in all Packing fields");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        token,
        PackingDate: new Date(PackingDate),
        ReceivedDate: new Date(ReceivedDate),
        GrossWeight: Number(GrossWeight),
        WtinKg: Number(WtinKg),
        FinishType,
      });

      setPackingDate("");
      setReceivedDate("");
      setGrossWeight("");
      setWtinKg("");
      setFinishType("");

      Alert.alert("Success", "Packing process data updated");
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Failed to update Packing data");
    } finally {
      setLoading(false);
    }
  };

  const OrderDetail = ({ label, value }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || "—"}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fabricanna Supreme</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Page Title */}
      <Text style={styles.pageTitle}>Packing Department</Text>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Lookup</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter order token"
            placeholderTextColor="#9ca3af"
            value={token}
            onChangeText={setToken}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.searchButtonText}>Search Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {orderDetails && (
          <>
            {/* Order Details Card */}
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => setAccordionVisible(!accordionVisible)}
                style={styles.accordionHeader}
              >
                <Text style={styles.accordionTitle}>Order Details</Text>
                <Ionicons
                  name={accordionVisible ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>

              {accordionVisible && (
                <View style={styles.accordionContent}>
                  <OrderDetail label="Company" value={orderDetails.companyName} />
                  <OrderDetail label="Quantity" value={orderDetails.quantity} />
                </View>
              )}
            </View>

            {/* Packing Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update Packing Process</Text>

              {/* Packing Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Polish Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPackingDate(true)}
                >
                  <Ionicons name="calendar" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {PackingDate
                      ? new Date(PackingDate).toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showPackingDate && (
                  <DateTimePicker
                    value={PackingDate ? new Date(PackingDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowPackingDate(false);
                      if (selectedDate)
                        setPackingDate(selectedDate.toISOString());
                    }}
                  />
                )}
              </View>

              {/* Receiving Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Receiving Date from Laser/Turning
                </Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowReceivedDate(true)}
                >
                  <Ionicons name="calendar" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {ReceivedDate
                      ? new Date(ReceivedDate).toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showReceivedDate && (
                  <DateTimePicker
                    value={ReceivedDate ? new Date(ReceivedDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowReceivedDate(false);
                      if (selectedDate)
                        setReceivedDate(selectedDate.toISOString());
                    }}
                  />
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>1 Gross weight in Gram</Text>
                <TextInput
                  style={styles.input}
                  value={GrossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="numeric"
                  placeholder="Weight in Gram"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wt.in Kgs</Text>
                <TextInput
                  style={styles.input}
                  value={WtinKg}
                  onChangeText={setWtinKg}
                  keyboardType="numeric"
                  placeholder="Weight in Kgs"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Finishing Type</Text>
                <TextInput
                  style={styles.input}
                  value={FinishType}
                  onChangeText={setFinishType}
                  placeholder="Finishing Type"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Settings Bottom Sheet */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSettingsVisible(false)}
        />
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setSettingsVisible(false);
              signOut();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="red" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111" },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    margin: 16,
    color: "#111",
  },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  searchButtonText: { color: "#fff", fontWeight: "600" },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
  },
  dateButtonText: { marginLeft: 8, color: "#374151", fontSize: 15 },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accordionTitle: { fontSize: 15, fontWeight: "500" },
  accordionContent: { marginTop: 10 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: { fontSize: 13, color: "#6b7280" },
  detailValue: { fontSize: 13, fontWeight: "500" },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  submitButtonText: { color: "#fff", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  logoutText: { fontSize: 16, fontWeight: "500", color: "red" },
});

export default PackingDepartment;
