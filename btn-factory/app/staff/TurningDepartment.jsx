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
} from "react-native";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const TurningDepartment = ({ onSubmit }) => {
  const { signOut, userToken } = useContext(AuthContext);

  const [token, setToken] = useState("");
  const [Totalsheets, setTotalSheets] = useState("");
  const [TurningDate, setTurningDate] = useState("");
  const [ReceivedDate, setReceivedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [GrossWeight, setGrossWeight] = useState("");
  const [WtinKg, setWtinKg] = useState("");
  const [FinishThickness, setFinishThickness] = useState("");

  const [showTurningDate, setShowTurningDate] = useState(false);
  const [showReceivedDate, setShowReceivedDate] = useState(false);
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
      console.error("Error fetching order:", error.message);
      Alert.alert("Error", error.message);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !Totalsheets ||
      !TurningDate ||
      !ReceivedDate ||
      !startTime ||
      !endTime ||
      !GrossWeight ||
      !WtinKg ||
      !FinishThickness
    ) {
      Alert.alert("Error", "Please fill in all Turning fields");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        token,
        Totalsheets: Number(Totalsheets),
        TurningDate: new Date(TurningDate),
        ReceivedDate: new Date(ReceivedDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        GrossWeight: Number(GrossWeight),
        WtinKg: Number(WtinKg),
        FinishThickness: Number(FinishThickness),
      });

      // Reset form
      setTotalSheets("");
      setTurningDate("");
      setReceivedDate("");
      setStartTime("");
      setEndTime("");
      setGrossWeight("");
      setWtinKg("");
      setFinishThickness("");

      Alert.alert("Success", "Turning process data updated");
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Failed to update Turning data");
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
        {/* <BackButton />//////// */}
        <Text style={styles.headerTitle}>Turning Department</Text>
        <TouchableOpacity
          onPress={() => setSettingsVisible(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={22} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Settings Bottom Sheet */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSettingsVisible(false);
                signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.modalOptionText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { justifyContent: "center" }]}
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={[styles.modalOptionText, { color: "#64748b" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                  <OrderDetail
                    label="Company"
                    value={orderDetails.companyName}
                  />
                  <OrderDetail label="Quantity" value={orderDetails.quantity} />
                </View>
              )}
            </View>

            {/* Turning Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update Turning Process</Text>

              {/* Turning Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Turning Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowTurningDate(true)}
                >
                  <Ionicons name="calendar" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {TurningDate
                      ? new Date(TurningDate).toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showTurningDate && (
                  <DateTimePicker
                    value={TurningDate ? new Date(TurningDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowTurningDate(false);
                      if (selectedDate)
                        setTurningDate(selectedDate.toISOString());
                    }}
                  />
                )}
              </View>

              {/* Receiving Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Receiving Date</Text>
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
                      if (selectedTime)
                        setStartTime(selectedTime.toISOString());
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
                    {endTime
                      ? new Date(endTime).toLocaleTimeString()
                      : "Select Time"}
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

              {/* Inputs */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Gross weight (g)</Text>
                <TextInput
                  style={styles.input}
                  value={GrossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="numeric"
                  placeholder="Enter weight"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (Kg)</Text>
                <TextInput
                  style={styles.input}
                  value={WtinKg}
                  onChangeText={setWtinKg}
                  keyboardType="numeric"
                  placeholder="Enter weight"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Finish Thickness</Text>
                <TextInput
                  style={styles.input}
                  value={FinishThickness}
                  onChangeText={setFinishThickness}
                  keyboardType="numeric"
                  placeholder="Enter thickness"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    // borderBottomWidth: 1,
    // borderBottomColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  settingsButton: { padding: 8 },
  content: { padding: 12, paddingBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#1e293b", marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: "#475569", marginBottom: 6, fontWeight: "500" },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#334155",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  searchButtonText: { color: "#fff", fontWeight: "600", fontSize: 14, marginLeft: 6 },
  accordionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  accordionTitle: { fontSize: 15, fontWeight: "500", color: "#475569" },
  accordionContent: { paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailLabel: { fontSize: 14, color: "#64748b" },
  detailValue: { fontSize: 14, color: "#1e293b", fontWeight: "500" },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  dateButtonText: { marginLeft: 8, color: "#374151", fontSize: 14 },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  modalOptionText: { fontSize: 16, fontWeight: "500", color: "#1e293b" },
});

export default TurningDepartment;
