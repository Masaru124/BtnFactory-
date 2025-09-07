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
} from "react-native";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

const PolishDepartment = ({ onSubmit }) => {
  const authContext = useContext(AuthContext);
  const { signOut, userToken } = authContext;

  const [token, setToken] = useState("");
  const [Totalsheets, setTotalSheets] = useState("");
  const [GrossWeight, setGrossWeight] = useState("");
  const [WtinKg, setWtinKg] = useState("");

  // ✅ Missing states added
  const [PolishDate, setPolishDate] = useState("");
  const [ReceivedDate, setReceivedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // DateTimePicker visibility
  const [showPolishDate, setShowPolishDate] = useState(false);
  const [showReceivedDate, setShowReceivedDate] = useState(false);
  const [showStartTime, setShowStartTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionVisible, setAccordionVisible] = useState(false);

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

  // 🔹 Submit Polish process
  const handleSubmit = async () => {
    if (
      !Totalsheets ||
      !PolishDate ||
      !ReceivedDate ||
      !startTime ||
      !endTime ||
      !GrossWeight ||
      !WtinKg
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        token,
        Totalsheets: Number(Totalsheets),
        PolishDate: new Date(PolishDate),
        ReceivedDate: new Date(ReceivedDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        GrossWeight: Number(GrossWeight),
        WtinKg: Number(WtinKg),
      });

      // ✅ Reset form
      setTotalSheets("");
      setPolishDate("");
      setReceivedDate("");
      setStartTime("");
      setEndTime("");
      setGrossWeight("");
      setWtinKg("");

      Alert.alert("Success", "Polish process data updated");
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert("Error", "Failed to update polishing data");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Order details component
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
        <BackButton />
        <Text style={styles.headerTitle}>Polish Department</Text>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
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

              {/* Polish Date */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Polish Date</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPolishDate(true)}
                >
                  <Ionicons name="calendar" size={20} color="#374151" />
                  <Text style={styles.dateButtonText}>
                    {PolishDate
                      ? new Date(PolishDate).toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {showPolishDate && (
                  <DateTimePicker
                    value={PolishDate ? new Date(PolishDate) : new Date()}
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

              {/* Gross Weight */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>1 Gross weight in Gram</Text>
                <TextInput
                  style={styles.input}
                  value={GrossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="numeric"
                  placeholder="Gross Weight in Gram"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Weight in Kgs */}
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
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: "#334155",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#475569",
  },
  accordionContent: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  dateButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f3f4f6",
  padding: 10,
  borderRadius: 8,
  marginTop: 5,
},
dateButtonText: {
  marginLeft: 8,
  color: "#374151",
  fontSize: 16,
},
});

export default PolishDepartment;
