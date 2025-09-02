import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";

export default function OrderDetailsScreen() {
  const { order } = useLocalSearchParams();
  const orderData = JSON.parse(order);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setIsDeleting(true);
    console.log("Deleting order with PO:", orderData.poNumber);

    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log("Token:", token);
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderData.poNumber}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response status:", response.status);

      const respText = await response.text(); // capture raw response
      console.log("Response body:", respText);

      if (!response.ok) {
        throw new Error(
          respText || response.statusText || "Failed to delete order."
        );
      }

      Alert.alert("Success", "Order deleted successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/admin/productlist"),
        },
      ]);
    } catch (error) {
      console.error("Delete error caught:", error);
      Alert.alert("Error", error.message || "Failed to delete order.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Order Details</Text>
        </View>
        {/* Invisible spacer to balance the layout */}
        <View style={{ width: 24 }} />
      </View>

      {orderData.token && (
        <>
          <SectionTitle title="Tracking Information" />
          <DetailRow label="Tracking Token" value={orderData.token} />
        </>
      )}

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
          <DetailRow label="PO Image" value={orderData.poImage} />

        <SectionTitle title="Product Details" />
        <DetailRow label="Button Image" value={orderData.buttonImage} />
        <DetailRow label="Casting" value={orderData.casting} />
        <DetailRow label="Thickness" value={orderData.thickness} />
        <DetailRow label="Holes" value={orderData.holes} />
        <DetailRow label="Box Type" value={orderData.boxType} />
        <DetailRow
          label="Rate"
          value={`₹${orderData.rate.toLocaleString("en-IN")}`}
        />
        <DetailRow label="Lining" value={orderData.linings} />
        <DetailRow label="Laser Cutting" value={orderData.laser} />
        <DetailRow label="Polish Type" value={orderData.polishType} />
        <DetailRow label="Quantity" value={orderData.quantity?.toString()} />
        <DetailRow label="Packing Option" value={orderData.packingOption} />
        <DetailRow
          label="Dispatch Date"
          value={
            orderData.dispatchDate
              ? new Date(orderData.dispatchDate).toLocaleDateString("en-IN")
              : "-"
          }
        />

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
        {isDeleting ? (
          <ActivityIndicator size="small" color="#DC2626" />
        ) : (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Text style={styles.deleteBtnText}>Delete Order</Text>
          </TouchableOpacity>
        )}
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
    backgroundColor: "#ffffffff",
    marginTop: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject, // Fill entire parent
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
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

  deleteBtn: {
    borderColor: "#DC2626", // Tailwind red-600
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  deleteBtnText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
