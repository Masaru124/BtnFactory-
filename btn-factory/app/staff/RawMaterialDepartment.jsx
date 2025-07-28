import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_URL } from "../../constants/api"; // Adjust the import path as needed
import BackButton from "../../components/BackButton";
import { AuthContext } from "../contexts/AuthContext";

const RawMaterialDepartment = ({ onSubmit, onLogout }) => {
  const authContext = useContext(AuthContext);

  const [token, setToken] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signOut } = authContext;

  const fetchOrder = async () => {
    if (!token) return Alert.alert("Enter a valid token");

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/staff/orders/${token}`, {
        headers: {
          Authorization: `Bearer ${authContext.token}`,
          Accept: "application/json",
        },
      });

      const text = await response.text();
      console.log("📦 Raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.log(error)
        throw new Error("Invalid JSON response from server");
      }

      if (!response.ok) {
        throw new Error(data.message || "Order not found");
      }

      setOrderDetails(data);
      Alert.alert("Order found", `Order ID: ${data._id || token}`);
    } catch (error) {
      console.error("❌ Error fetching order:", error.message);
      Alert.alert("Error", error.message);
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!materialName || !quantity || !totalPrice) {
      return Alert.alert("Fill all material fields");
    }

    try {
      await onSubmit({
        token,
        materialName,
        quantity: Number(quantity),
        totalPrice: Number(totalPrice),
      });

      // Optionally clear input fields after submit
      setMaterialName("");
      setQuantity("");
      setTotalPrice("");
    } catch (error) {
      console.error("❌ Submit error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Button title="Logout" onPress={signOut} />
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Raw Material Department</Text>
        <Text style={styles.label}>Order ID / Token Number:</Text>
        <TextInput
          style={styles.input}
          value={token}
          onChangeText={setToken}
          placeholder="Enter token"
        />
        <Button title="Fetch Order" onPress={fetchOrder} />
        {loading && (
          <ActivityIndicator
            size="small"
            color="blue"
            style={{ marginVertical: 10 }}
          />
        )}

        {orderDetails && (
          <>
            <Text style={styles.info}>
              Order ID: {orderDetails._id || token}
            </Text>

            <Text style={styles.label}>Material Name:</Text>
            <TextInput
              style={styles.input}
              value={materialName}
              onChangeText={setMaterialName}
              placeholder="Enter material name"
            />

            <Text style={styles.label}>Quantity:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
            />

            <Text style={styles.label}>Total Price:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={totalPrice}
              onChangeText={setTotalPrice}
              placeholder="Enter total price"
            />

            <Button title="Submit Update" onPress={handleSubmit} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingLeft: -15,
    backgroundColor: "#ffffffff",
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  logoutButton: {
    padding: 5,
  },
  logoutText: {
    color: "blue",
    fontWeight: "500",
  },
  content: {
    padding: 15,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    fontStyle: "italic",
    marginVertical: 10,
    color: "#555",
  },
});

export default RawMaterialDepartment;
