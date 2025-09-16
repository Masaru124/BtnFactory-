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
  TextInput,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";
import { useAuth } from "../contexts/AuthContext";

export default function OrderDetailsScreen() {
  const { order } = useLocalSearchParams();
  const orderData = JSON.parse(order);

  const { userToken } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(orderData);
  const [isSaving, setIsSaving] = useState(false);

  const statusColors = {
    pending: "#F59E0B",
    completed: "#10B981",
    processing: "#3B82F6",
    cancelled: "#EF4444",
    shipped: "#8B5CF6",
  };

  // Delete order
  const handleDelete = () => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteOrder },
    ]);
  };

  const deleteOrder = async () => {
    if (!userToken) return Alert.alert("Error", "Authentication token not found");
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderData.poNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to delete order.");
      Alert.alert("Success", "Order deleted successfully.", [
        { text: "OK", onPress: () => router.replace("/admin/productlist") },
      ]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save edits
  const saveChanges = async () => {
    if (!userToken) return Alert.alert("Error", "Authentication token not found");
    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${orderData.poNumber}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update order.");
      Alert.alert("Success", "Order updated successfully.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusBadge, { backgroundColor: statusColors[formData.status?.toLowerCase()] }]}>
          {formData.status || "Unknown"}
        </Text>
      </View>

      {/* Sections */}
      <Section title="Tracking Information">
        <EditableRow label="Tracking Token" value={formData.token} editable={isEditing} />
        <EditableRow label="Created Date" value={new Date(formData.createdDate).toLocaleString("en-IN")} />
      </Section>

      <Section title="Core Order Information">
        <EditableRow label="Company Name" value={formData.companyName} editable={isEditing} />
        <EditableRow label="PO Number" value={formData.poNumber} editable={isEditing} />
        <EditableRow
          label="PO Date"
          value={new Date(formData.poDate).toLocaleDateString("en-IN")}
          editable={isEditing}
        />
        <EditableRow label="PO Image" value={formData.poImage} editable={isEditing} isImage />
        <EditableRow
          label="Dispatch Date"
          value={formData.dispatchDate ? new Date(formData.dispatchDate).toLocaleDateString("en-IN") : "-"}
          editable={isEditing}
        />
      </Section>

      <Section title="Product Details">
        <EditableRow label="Button Image" value={formData.buttonImage} editable={isEditing} isImage />
        <EditableRow label="Casting" value={formData.casting} editable={isEditing} />
        <EditableRow label="Thickness" value={formData.thickness} editable={isEditing} />
        <EditableRow label="Linings" value={formData.linings} editable={isEditing} />
        <EditableRow label="Holes" value={formData.holes} editable={isEditing} />
        <EditableRow label="Laser Cutting" value={formData.laser} editable={isEditing} />
        <EditableRow label="Polish Type" value={formData.polishType} editable={isEditing} />
        <EditableRow label="Box Type" value={formData.boxType} editable={isEditing} />
        <EditableRow label="Tool Number" value={formData.toolNumber} editable={isEditing} />
        <EditableRow label="Rate" value={`₹${formData.rate}`} editable={isEditing} />
        <EditableRow label="Quantity" value={formData.quantity?.toString()} editable={isEditing} />
        <EditableRow label="Packing Option" value={formData.packingOption} editable={isEditing} />
      </Section>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            {isSaving ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() =>
                router.push({
                  pathname: "/admin/editorder",
                  params: { order: JSON.stringify(orderData) },
                })
              }
            >
              <Text style={styles.editBtnText}>Edit Order</Text>
            </TouchableOpacity>
            {isDeleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Delete Order</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

/* Components */
const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const EditableRow = ({ label, value, editable, onChangeText, valueStyle, isImage }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    {isImage && value ? (
      <Image source={{ uri: value }} style={styles.image} />
    ) : editable && onChangeText ? (
      <TextInput style={styles.input} value={value?.toString()} onChangeText={onChangeText} />
    ) : (
      <Text style={[styles.detailValue, valueStyle]}>{value || "-"}</Text>
    )}
  </View>
);

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 10,
    paddingBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#000" },

  statusContainer: { alignItems: "center", marginBottom: 10 },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    overflow: "hidden",
  },

  section: { marginVertical: 10, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#374151" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
    }),
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  detailLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 14, color: "#111827", fontWeight: "500", maxWidth: "60%", textAlign: "right" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 6,
    minWidth: 120,
    textAlign: "right",
  },
  image: { width: 80, height: 80, borderRadius: 8 },

  actions: { margin: 20, gap: 12 },
  editBtn: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  editBtnText: { color: "#000", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#6B7280",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: { color: "#6B7280", fontWeight: "600" },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteBtnText: { color: "#DC2626", fontWeight: "600" },
});
