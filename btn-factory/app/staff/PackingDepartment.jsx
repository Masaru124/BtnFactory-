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
// import { set } from "mongoose";

const PackingDepartment = ({ onSubmit }) => {
  const authContext = useContext(AuthContext);
  const { signOut, userToken } = authContext;

  const [token, setToken] = useState("");
  const [PackingDate, setTurningDate] = useState("");
  const [ReceivedDate, setReceivedDate] = useState("");
  const [GrossWeight, setGrossWeight] = useState("");   //  Added
  const [WtinKg, setWtinKg] = useState("");             //  Added
  const [FinishType, setFinishType] = useState("");             //  Added
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionVisible, setAccordionVisible] = useState(false);

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
      !PackingDate ||
      !ReceivedDate ||
      !GrossWeight || 
      !WtinKg ||
      !FinishType 
    ) {
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
        FinishType : Number(FinishType),
      });

      // Reset form
      setTurningDate("");
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
        <BackButton />
        <Text style={styles.headerTitle}>Packing Department</Text>
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

            {/* Packing Form Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update Packing Process</Text>


              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Packing Date</Text>
                <TextInput
                  style={styles.input}
                  value={PackingDate}
                  onChangeText={setTurningDate}
                  placeholder="Format: YYYY-MM-DDTHH:MM"
                 placeholderTextColor="#9ca3af"
                />
              </View> 

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Receving Date for Packing</Text>
                <TextInput
                  style={styles.input}
                  value={ReceivedDate}
                  onChangeText={setReceivedDate}
                  placeholder="Format: YYYY-MM-DDTHH:MM"
                  placeholderTextColor="#9ca3af"
                />
              </View> 

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>1 Gross weight in Gram</Text>
                <TextInput
                  style={styles.input}
                  value={GrossWeight}
                  onChangeText={setGrossWeight}
                  keyboardType="numeric"
                  placeholder="Weight in Kgs"
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
                    keyboardType="numeric"
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
                  <>
                    <Text style={styles.submitButtonText}>
                      Submit
                    </Text>
                  </>
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
});

export default PackingDepartment;
