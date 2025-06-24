import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";

export default function AllChallanList() {
  const { userToken } = useContext(AuthContext);
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallans = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user/challans`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`Error fetching challans: ${res.status}`, text);
        throw new Error("Failed to fetch challans");
      }

      const data = await res.json();
      setChallans(data);
    } catch (error) {
      console.error("❌ Challan fetch error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) fetchChallans();
  }, [userToken]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Your Challans</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      ) : challans.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No challans found.</Text>
        </View>
      ) : (
        <FlatList
          data={challans}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Challan #{item._id}</Text>
              <Text style={styles.cardText}>
                Date: {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.cardText}>
                Time: {new Date(item.createdAt).toLocaleTimeString()}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
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
});
