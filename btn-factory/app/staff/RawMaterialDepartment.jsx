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
} from "react-native";
import { API_URL } from "../../constants/api";
import { AuthContext } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const RawMaterialDepartment = ({ onSubmit }) => {
  const authContext = useContext(AuthContext);
  const { signOut } = authContext;

  const [token, setToken] = useState("");
  // const [materialName, setMaterialName] = useState("");
  const [materials, setMaterials] = useState([
    { materialName: "", quantity: "", totalPrice: "" },
  ]);
  // const [quantity, setQuantity] = useState("");
  // const [totalPrice, setTotalPrice] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordionVisible, setAccordionVisible] = useState(false);

  const fetchOrder = async () => {
    if (!token) return Alert.alert("Error", "Please enter a valid token");

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/staff/orders/${token}`, {
        headers: {
          Authorization: `Bearer ${authContext.userToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Order not found");
      }

      const data = await response.json();
      console.log(data)
      setOrderDetails(data);
    } catch (error) {
      console.error("Error fetching order:", error.message);
      Alert.alert("Error", error.message);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Add new material row
  const addMaterial = () => {
    setMaterials([
      ...materials,
      { materialName: "", quantity: "", totalPrice: "" },
    ]);
  };

  // Update a material field
  const handleMaterialChange = (index, field, value) => {
    const updated = [...materials];
    updated[index][field] = value;
    setMaterials(updated);
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validate input
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
      Alert.alert(
        "Validation Error",
        "Please fill all fields with valid values before submitting."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/raw-material/${token}`, // ✅ this is UPDATE, not CREATE
        {
          method: "POST", // semantically should be PUT/PATCH if updating
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.userToken}`,
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API response error:", errorText);
        throw new Error("Failed to update raw material details");
      }

      const data = await response.json();
      console.log("✅ Raw Material Updated:", data);

      Alert.alert("Success", "Material details updated successfully");
      setMaterials([{ materialName: "", quantity: "", totalPrice: "" }]); // reset form
    } catch (error) {
      console.error("❌ Raw Material Submit Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const OrderDetail = ({ label, value }) => {
    // Check if the value is a URL string
    const isImageUrl =
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"));

    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        {isImageUrl ? (
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

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* <BackButton /> */}
        <Text style={styles.headerTitle}>Raw Material Staff</Text>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          {/* <Text>Logout</Text> */}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Order Lookup</Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="Enter order token"
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={fetchOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.searchButtonText}>Search Order</Text>
            )}
          </TouchableOpacity>
        </View>

        {orderDetails && (
          <>
            {/* Order Details Accordion */}
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
                <Text style={styles.subsectionTitle}>Material Information</Text>
                <OrderDetail
                  label="Button Image"
                  value={orderDetails.buttonImage}
                />

                <OrderDetail
                  label="Quantity"
                  value={orderDetails.rawMaterial?.quantity}
                />
                <OrderDetail
                  label="Last Updated"
                  value={formatDate(orderDetails.rawMaterial?.updatedAt)}
                />
              </View>
            )}

            {/* Update Form */}
            {/* Update Form */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Update Material Details</Text>

              {materials.map((mat, index) => (
                <View key={index} style={styles.materialBlock}>
                  <Text style={styles.inputLabel}>Material Name</Text>
                  <TextInput
                    style={styles.input}
                    value={mat.materialName}
                    onChangeText={(val) =>
                      handleMaterialChange(index, "materialName", val)
                    }
                    placeholder="Enter material name"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={mat.quantity}
                    onChangeText={(val) =>
                      handleMaterialChange(index, "quantity", val)
                    }
                    placeholder="Enter quantity"
                    placeholderTextColor="#9ca3af"
                  />

                  <Text style={styles.inputLabel}>Total Price (₹)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={mat.totalPrice}
                    onChangeText={(val) =>
                      handleMaterialChange(index, "totalPrice", val)
                    }
                    placeholder="Enter total price"
                    placeholderTextColor="#9ca3af"
                  />

                  {/* Remove Material Button */}
                  {materials.length > 1 && (
                    <TouchableOpacity
                      style={[
                        styles.smallButton,
                        { backgroundColor: "#ef4444" },
                      ]}
                      onPress={() => {
                        const updated = materials.filter((_, i) => i !== index);
                        setMaterials(updated);
                      }}
                    >
                      <Text style={styles.smallButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Buttons Side by Side */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: "#3b82f6", flex: 1, marginRight: 8 },
                  ]}
                  onPress={addMaterial}
                >
                  <Text style={styles.submitButtonText}>+ Add Material</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, { flex: 1 }]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>Update Details</Text>
                </TouchableOpacity>
              </View>
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
    // paddingHorizontal: 1,
    // paddingVertical: 15,
    padding:16,
    borderBottomColor: "#b12d2dff",
    borderColor: "red",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  logoutButton: {
    display: "flex",
    padding: 8,
  },
  content: {
    padding: 10,
    paddingBottom: 3,
  },
  searchSection: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 0,
    marginBottom: 16,
  },
  formSection: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 0,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: "#4f46e5",
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
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
    backgroundColor: "#ffffff",
    margin: 0,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
  },
  accordionContent: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 10,
    margin: 0,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  materialBlock: {
    marginBottom: 20,
    padding: 1,
    // borderWidth: 1,
    // borderColor: "#e5e7eb",
    // borderRadius: 8,
    // backgroundColor: "#f9fafb",
  },
  submitButton: {
    backgroundColor: "#10b981",
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 26,
    marginBottom:36,
  },
  smallButton: {
    alignSelf: "flex-start",
    backgroundColor: "#ef4444",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 6,
    marginTop: 5,
  },
});

export default RawMaterialDepartment;
