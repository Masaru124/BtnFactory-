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
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const PolishDepartment = () => {
  const { signOut, userToken } = useContext(AuthContext);

  const [token, setToken] = useState("");
  const [totalSheets, setTotalSheets] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [wtinKg, setWtinKg] = useState("");

  const [polishDate, setPolishDate] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [showPolishDate, setShowPolishDate] = useState(false);
  const [showReceivedDate, setShowReceivedDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionVisible, setAccordionVisible] = useState(false);

  const [settingsVisible, setSettingsVisible] = useState(false);

  // 🔹 Fetch order by token
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
        throw new Error("Order not found");
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

  // 🔹 Submit Polish process
  const handleSubmit = async () => {
    if (
      !totalSheets ||
      !polishDate ||
      !receivedDate ||
      !startTime ||
      !endTime ||
      !grossWeight ||
      !wtinKg
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_URL}/api/staff/orders/polish-process/${token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            totalSheets: Number(totalSheets),
            polishDate: new Date(polishDate),
            receivedDate: new Date(receivedDate),
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            GrossWeight: Number(grossWeight),
            WtinKg: Number(wtinKg),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update polish process data");
      }

      Alert.alert("Success", "Polish process data updated successfully");
      setTotalSheets("");
      setPolishDate("");
      setReceivedDate("");
      setStartTime("");
      setEndTime("");
      setGrossWeight("");
      setWtinKg("");
    } catch (error) {
      Alert.alert("Error", error.message);
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
        <Text style={styles.headerTitle}>Polish Department</Text>
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={24} color="#000" />
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
                  <OrderDetail
                    label="Company"
                    value={orderDetails.companyName}
                  />
                  <OrderDetail
                    label="Polish Type"
                    value={orderDetails.polishType}
                  />
                  <OrderDetail label="Laser" value={orderDetails.laser} />
                  <OrderDetail label="Quantity" value={orderDetails.quantity} />
                </View>
              )}
            </View>

            {/* Polish Form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update Polish Process</Text>

              {/* Date & Time Pickers */}
              {/* Polish Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Polish Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPolishDate(true)}
                >
                  <Ionicons name="calendar" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {polishDate
                      ? new Date(polishDate).toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showPolishDate && (
                  <DateTimePicker
                    value={polishDate ? new Date(polishDate) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowPolishDate(false);
                      if (selectedDate)
                        setPolishDate(selectedDate.toISOString());
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
                    {receivedDate
                      ? new Date(receivedDate).toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showReceivedDate && (
                  <DateTimePicker
                    value={receivedDate ? new Date(receivedDate) : new Date()}
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

              {/* Start & End Times */}
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
                <Text style={styles.inputLabel}>Total Sheets</Text>
                <TextInput
                  style={styles.input}
                  value={totalSheets}
                  onChangeText={setTotalSheets}
                  keyboardType="numeric"
                  placeholder="Enter total sheets"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>1 Gross Weight in Gram</Text>
                <TextInput
                  style={styles.input}
                  value={grossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="numeric"
                  placeholder="Gross Weight in Gram"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wt. in Kg</Text>
                <TextInput
                  style={styles.input}
                  value={wtinKg}
                  onChangeText={setWtinKg}
                  keyboardType="numeric"
                  placeholder="Weight in Kgs"
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

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setSettingsVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                setSettingsVisible(false);
                signOut();
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
    // borderBottomWidth: 1,
    // borderColor: "#e5e7eb",
  },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#000" },

  content: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 16 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "500", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  searchButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  searchButtonText: { color: "#fff", fontWeight: "600", marginLeft: 6 },

  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  accordionTitle: { fontSize: 15, fontWeight: "500" },
  accordionContent: { marginTop: 12, borderTopWidth: 1, paddingTop: 12 },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: { fontSize: 14, color: "#64748b" },
  detailValue: { fontSize: 14, fontWeight: "500" },

  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
  },
  dateButtonText: { marginLeft: 8, color: "#374151" },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 10,
  },
  logoutText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
});

export default PolishDepartment;
