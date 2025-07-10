import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";

export default function UserOrders() {
  const { userToken } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // New states for order creation and token validation
  const [tokenInput, setTokenInput] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [validatedOrder, setValidatedOrder] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Form fields for new order
  const [companyName, setCompanyName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [casting, setCasting] = useState("");
  const [thickness, setThickness] = useState("");
  const [holes, setHoles] = useState("");
  const [boxType, setBoxType] = useState("");
  const [rate, setRate] = useState("");
  const [rawMaterials, setRawMaterials] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/orders`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Error fetching orders: ${res.status}`, text);
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("❌ Order fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateToken = async () => {
    if (!tokenInput) {
      Alert.alert("Validation Error", "Please enter a token number.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/user/orders/validate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ token: tokenInput }),
      });
      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Invalid Token", data.message || "Token validation failed.");
        setTokenValid(false);
        setValidatedOrder(null);
        return;
      }
      const data = await res.json();
      setTokenValid(true);
      setValidatedOrder(data.order);
      Alert.alert("Token Validated", "Token is valid. You can specify raw materials.");
    } catch (error) {
      console.error("❌ Token validation error:", error.message);
      Alert.alert("Error", "Failed to validate token.");
    }
  };

  const createOrder = async () => {
    if (!companyName || !poNumber || !poDate || !casting || !thickness || !holes || !boxType || !rate) {
      Alert.alert("Validation Error", "Please fill all required fields.");
      return;
    }
    setCreatingOrder(true);
    try {
      const res = await fetch(`${API_URL}/api/user/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          companyName,
          poNumber,
          poDate,
          casting,
          thickness,
          holes,
          boxType,
          rate,
          rawMaterials,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        Alert.alert("Order Creation Failed", data.message || "Failed to create order.");
        setCreatingOrder(false);
        return;
      }
      const data = await res.json();
      Alert.alert("Success", "Order created successfully with token: " + data.token);
      // Reset form
      setCompanyName("");
      setPoNumber("");
      setPoDate("");
      setCasting("");
      setThickness("");
      setHoles("");
      setBoxType("");
      setRate("");
      setRawMaterials("");
      setTokenInput("");
      setTokenValid(false);
      setValidatedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("❌ Order creation error:", error.message);
      Alert.alert("Error", "Failed to create order.");
    } finally {
      setCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (userToken) fetchOrders();
  }, [userToken]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>Your Orders</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No orders found.</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Order #{item._id}</Text>
                <Text style={styles.cardText}>
                  Date: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.cardText}>
                  Time: {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
                {item.status && (
                  <Text style={styles.cardText}>Status: {item.status}</Text>
                )}
              </View>
            )}
            contentContainerStyle={styles.list}
          />
        )}

        <View style={styles.divider} />

        <Text style={styles.subHeading}>Validate Token</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter token number"
          value={tokenInput}
          onChangeText={setTokenInput}
          autoCapitalize="characters"
        />
        <Button title="Validate Token" onPress={validateToken} />

        {tokenValid && validatedOrder && (
          <>
            <Text style={styles.subHeading}>Specify Raw Materials</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter raw materials"
              value={rawMaterials}
              onChangeText={setRawMaterials}
            />
          </>
        )}

        <Text style={styles.subHeading}>Create New Order</Text>
        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
        />
        <TextInput
          style={styles.input}
          placeholder="PO Number"
          value={poNumber}
          onChangeText={setPoNumber}
        />
        <TextInput
          style={styles.input}
          placeholder="PO Date (YYYY-MM-DD)"
          value={poDate}
          onChangeText={setPoDate}
        />
        <TextInput
          style={styles.input}
          placeholder="Casting"
          value={casting}
          onChangeText={setCasting}
        />
        <TextInput
          style={styles.input}
          placeholder="Thickness"
          value={thickness}
          onChangeText={setThickness}
        />
        <TextInput
          style={styles.input}
          placeholder="Holes"
          value={holes}
          onChangeText={setHoles}
        />
        <TextInput
          style={styles.input}
          placeholder="Box Type"
          value={boxType}
          onChangeText={setBoxType}
        />
        <TextInput
          style={styles.input}
          placeholder="Rate"
          value={rate}
          onChangeText={setRate}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Raw Materials"
          value={rawMaterials}
          onChangeText={setRawMaterials}
        />
        <Button title={creatingOrder ? "Creating..." : "Create Order"} onPress={createOrder} disabled={creatingOrder} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#555",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#007bff",
  },
  cardText: {
    fontSize: 14,
    color: "#444",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  input: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 20,
    marginHorizontal: 20,
  },
});
