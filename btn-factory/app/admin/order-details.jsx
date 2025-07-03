import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Button,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/api";

export default function OrderDetailsScreen() {
  const { order } = useLocalSearchParams();
  const orderData = JSON.parse(order);

  const statusColors = {
    pending: "#F59E0B",
    completed: "#10B981",
    processing: "#3B82F6",
    cancelled: "#EF4444",
    shipped: "#8B5CF6",
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteOrder,
        },
      ]
    );
  };

  const deleteOrder = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderData._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Order deleted successfully", [
          {
            text: "OK",
            onPress: () => {
              router.replace("/admin/productlist");
            },
          },
        ]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete order");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Details</Text>
        <Text style={styles.subtitle}>Order #{orderData.poNumber}</Text>
      </View>

      <View style={styles.card}>
        <SectionTitle title="Order Information" />
        <DetailRow label="Company Name" value={orderData.companyName} />
        <DetailRow label="PO Number" value={orderData.poNumber} />
        <DetailRow
          label="PO Date"
          value={new Date(orderData.poDate).toLocaleDateString("en-IN")}
        />
        <DetailRow
          label="Created On"
          value={new Date(orderData.createdDate).toLocaleString("en-IN")}
        />
        <DetailRow
          label="Status"
          value={orderData.status}
          valueStyle={{
            color: statusColors[orderData.status.toLowerCase()] || "#1E293B",
          }}
        />

        <SectionTitle title="Product Details" />
        <DetailRow label="Casting" value={orderData.casting} />
        <DetailRow label="Thickness" value={orderData.thickness} />
        <DetailRow label="Holes" value={orderData.holes} />
        <DetailRow label="Box Type" value={orderData.boxType} />
        <DetailRow
          label="Rate"
          value={`₹${orderData.rate.toLocaleString("en-IN")}`}
        />

        {orderData.token && (
          <>
            <SectionTitle title="Tracking Information" />
            <DetailRow label="Tracking Token" value={orderData.token} />
          </>
        )}

        {orderData.poImage && (
          <>
            <SectionTitle title="Attachments" />
            <View style={styles.imageContainer}>
              <Text style={styles.imageLabel}>Purchase Order Image</Text>
              <Image
                source={{ uri: orderData.poImage }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </>
        )}
      </View>

      <View style={styles.deleteButtonContainer}>
        <Button title="Delete Order" color="#DC2626" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const DetailRow = ({ label, value, valueStyle }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueStyle]}>{value || "-"}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  card: {
    margin: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
    textAlign: "right",
    maxWidth: "60%",
  },
  imageContainer: {
    padding: 20,
  },
  imageLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "500",
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  deleteButtonContainer: {
    margin: 20,
  },
});
