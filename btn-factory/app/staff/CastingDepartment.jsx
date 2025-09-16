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
import BackButton from "../../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const CastingDepartment = ({ onSubmit }) => {
  const { signOut, userToken } = useContext(AuthContext);

  const [token, setToken] = useState("");
  const [rawMaterialsUsed, setRawMaterialsUsed] = useState("");
  const [sheetsMade, setSheetsMade] = useState("");
  const [sheetsWasted, setSheetsWasted] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
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
      Alert.alert("Error", error.message);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!rawMaterialsUsed || !sheetsMade || !sheetsWasted || !startTime || !endTime) {
      Alert.alert("Error", "Please fill in all casting fields");
      return;
    }
    try {
      setLoading(true);
      await onSubmit({
        token,
        rawMaterialsUsed,
        sheetsMade: Number(sheetsMade),
        sheetsWasted: Number(sheetsWasted),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });

      setRawMaterialsUsed("");
      setSheetsMade("");
      setSheetsWasted("");
      setStartTime("");
      setEndTime("");

      Alert.alert("Success", "Casting process data updated");
    } catch (error) {
      Alert.alert("Error", "Failed to update casting data");
    } finally {
      setLoading(false);
    }
  };

  const isRodCasting = orderDetails?.casting?.toLowerCase().trim() === "rod";

  const OrderDetail = ({ label, value }) => {
    const isImage =
      typeof value === "string" &&
      (value.startsWith("http") || value.startsWith("file:"));

    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        {isImage ? (
          <Image
            source={{ uri: value }}
            style={styles.detailImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.detailValue}>{value || "—"}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <BackButton /> */}
        <Text style={styles.headerTitle}>Casting Department</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

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
            style={styles.primaryButton}
            onPress={fetchOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="search" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Search Order</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {orderDetails && (
          <>
            {/* Order Details */}
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
                  <OrderDetail label="Casting Type" value={orderDetails.casting} />
                  <OrderDetail label="Box Type" value={orderDetails.boxType} />
                  <OrderDetail label="Thickness" value={orderDetails.thickness} />
                  <OrderDetail label="Holes" value={orderDetails.holes} />
                  <OrderDetail label="Quantity" value={orderDetails.quantity} />
                  <OrderDetail label="Button Image" value={orderDetails.buttonImage} />
                </View>
              )}
            </View>

            {/* Casting Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update Casting Process</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Raw Materials Used</Text>
                <TextInput
                  style={styles.input}
                  value={rawMaterialsUsed}
                  onChangeText={setRawMaterialsUsed}
                  placeholder="e.g., 5kg copper alloy"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isRodCasting ? "Rods Produced" : "Sheets Produced"}
                </Text>
                <TextInput
                  style={styles.input}
                  value={sheetsMade}
                  onChangeText={setSheetsMade}
                  keyboardType="numeric"
                  placeholder={isRodCasting ? "Number of rods" : "Number of sheets"}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {isRodCasting ? "Rods Wasted" : "Sheets Wasted"}
                </Text>
                <TextInput
                  style={styles.input}
                  value={sheetsWasted}
                  onChangeText={setSheetsWasted}
                  keyboardType="numeric"
                  placeholder={
                    isRodCasting ? "Number of rods wasted" : "Number of sheets wasted"
                  }
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Start Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Start Time</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowStartTime(true)}
                >
                  <Ionicons name="time" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {startTime
                      ? new Date(startTime).toLocaleTimeString()
                      : "Select Time"}
                  </Text>
                </TouchableOpacity>
                {showStartTime && (
                  <DateTimePicker
                    value={startTime ? new Date(startTime) : new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowStartTime(false);
                      if (selectedTime) setStartTime(selectedTime.toISOString());
                    }}
                  />
                )}
              </View>

              {/* End Time */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>End Time</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowEndTime(true)}
                >
                  <Ionicons name="time" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {endTime ? new Date(endTime).toLocaleTimeString() : "Select Time"}
                  </Text>
                </TouchableOpacity>
                {showEndTime && (
                  <DateTimePicker
                    value={endTime ? new Date(endTime) : new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setShowEndTime(false);
                      if (selectedTime) setEndTime(selectedTime.toISOString());
                    }}
                  />
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: "#10b981" }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Submit</Text>
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
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
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
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#1e293b" },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, color: "#475569", marginBottom: 6 },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    color: "#111",
  },
  primaryButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  accordionTitle: { fontSize: 14, fontWeight: "500", color: "#4b5563" },
  accordionContent: { marginTop: 8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailLabel: { fontSize: 14, color: "#64748b" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#1e293b" },
  detailImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#f3f4f6" },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dateButtonText: { marginLeft: 8, color: "#374151", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  logoutButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12 },
  logoutText: { color: "red", fontWeight: "600", fontSize: 16 },
});

export default CastingDepartment;
