import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { API_URL } from "../../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/api/admin/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load products");
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>All Orders</Text>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products found.</Text>
        ) : (
          products
            .reduce((rows, product, index) => {
              if (index % 2 === 0) rows.push([product]);
              else rows[rows.length - 1].push(product);
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((product, colIndex) => (
                  <View key={colIndex} style={styles.card}>
                    <Text style={styles.name}>{product.name}</Text>
                    <Text style={styles.description}>
                      {product.description}
                    </Text>
                    <Text style={styles.detail}>Price: ${product.price}</Text>
                    <Text style={styles.detail}>Stock: {product.stock}</Text>
                  </View>
                ))}
              </View>
            ))
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomBar}>
          <Link href="/admin/create-order" asChild>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Create order</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 20,
  },
  container: {
    padding: 16,
    paddingBottom: 100, // add space for button
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1e293b",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    elevation: 2,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  description: {
    color: "#64748b",
    marginTop: 4,
    marginBottom: 8,
  },
  detail: {
    color: "#334155",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 50,
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});
