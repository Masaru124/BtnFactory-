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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";

export default function OrderDetailsScreen() {
  const { order } = useLocalSearchParams();
  const orderData = JSON.parse(order);

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

  // 🔹 Delete order
  const handleDelete = () => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this order?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: deleteOrder },
    ]);
  };

  const deleteOrder = async () => {
    setIsDeleting(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${API_URL}/api/admin/orders/${orderData.poNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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

  // 🔹 Save edits
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(`${API_URL}/api/admin/orders/${orderData.poNumber}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
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
      <View style={styles.header}>
        <BackButton />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Order Details</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {formData.token && (
        <>
          <SectionTitle title="Tracking Information" />
          <EditableRow
            editable={isEditing}
            label="Tracking Token"
            value={formData.token}
            onChangeText={(text) => setFormData({ ...formData, token: text })}
          />
        </>
      )}

      <View style={styles.card}>
        <SectionTitle title="Order Information" />

        <EditableRow
          editable={isEditing}
          label="PO Number"
          value={formData.poNumber}
          onChangeText={(text) => setFormData({ ...formData, poNumber: text })}
        />

        <EditableRow
          editable={isEditing}
          label="PO Date"
          value={new Date(formData.poDate).toLocaleDateString("en-IN")}
          onChangeText={(text) => setFormData({ ...formData, poDate: text })}
        />

        <EditableRow
          editable={isEditing}
          label="Created On"
          value={new Date(formData.createdDate).toLocaleString("en-IN")}
        />

        <EditableRow
          editable={isEditing}
          label="Status"
          value={formData.status}
          onChangeText={(text) => setFormData({ ...formData, status: text })}
          valueStyle={{
            color: statusColors[formData.status?.toLowerCase()] || "#1E293B",
          }}
        />

        <EditableRow
          editable={isEditing}
          label="PO Image"
          value={formData.poImage}
          onChangeText={(text) => setFormData({ ...formData, poImage: text })}
        />

        <SectionTitle title="Product Details" />

        <EditableRow
          editable={isEditing}
          label="Button Image"
          value={formData.buttonImage}
          onChangeText={(text) => setFormData({ ...formData, buttonImage: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Casting"
          value={formData.casting}
          onChangeText={(text) => setFormData({ ...formData, casting: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Thickness"
          value={formData.thickness}
          onChangeText={(text) => setFormData({ ...formData, thickness: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Holes"
          value={formData.holes}
          onChangeText={(text) => setFormData({ ...formData, holes: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Box Type"
          value={formData.boxType}
          onChangeText={(text) => setFormData({ ...formData, boxType: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Tool Number"
          value={formData.toolNumber}
          onChangeText={(text) => setFormData({ ...formData, toolNumber: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Rate"
          value={`₹${formData.rate}`}
          onChangeText={(text) => setFormData({ ...formData, rate: Number(text) })}
        />
        <EditableRow
          editable={isEditing}
          label="Lining"
          value={formData.linings}
          onChangeText={(text) => setFormData({ ...formData, linings: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Laser Cutting"
          value={formData.laser}
          onChangeText={(text) => setFormData({ ...formData, laser: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Polish Type"
          value={formData.polishType}
          onChangeText={(text) => setFormData({ ...formData, polishType: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Quantity"
          value={formData.quantity?.toString()}
          onChangeText={(text) => setFormData({ ...formData, quantity: Number(text) })}
        />
        <EditableRow
          editable={isEditing}
          label="Packing Option"
          value={formData.packingOption}
          onChangeText={(text) => setFormData({ ...formData, packingOption: text })}
        />
        <EditableRow
          editable={isEditing}
          label="Dispatch Date"
          value={
            formData.dispatchDate
              ? new Date(formData.dispatchDate).toLocaleDateString("en-IN")
              : "-"
          }
          onChangeText={(text) => setFormData({ ...formData, dispatchDate: text })}
        />

      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <>
            {isSaving ? (
              <ActivityIndicator size="small" color="#2563EB" />
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
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
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

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const EditableRow = ({ editable, label, value, onChangeText, valueStyle }) => {
  const isImage =
    typeof value === "string" && (value.startsWith("http") || value.startsWith("file:"));

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>

      {isImage ? (
        <Image
          source={{ uri: value }}
          style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: "#F1F5F9" }}
          resizeMode="cover"
        />
      ) : editable && onChangeText ? (
        <TextInput
          style={styles.input}
          value={value?.toString()}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={[styles.detailValue, valueStyle]}>{value || "-"}</Text>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", marginTop: 15 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 10, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  titleContainer: { justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "600" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 1 },
  sectionTitle: {
    fontSize: 16, fontWeight: "600", color: "#334155",
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
    backgroundColor: "#F8FAFC", borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  detailRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  detailLabel: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  detailValue: {
    fontSize: 14, color: "#1E293B", fontWeight: "500",
    textAlign: "right", maxWidth: "60%",
  },
  input: {
    borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, fontSize: 14,
    color: "#1E293B", minWidth: 120, textAlign: "right",
  },

  imageContainer: { padding: 20 },
  imageLabel: {
    fontSize: 14, color: "#64748B", marginBottom: 12, fontWeight: "500",
  },
  image: { width: "100%", height: 240, borderRadius: 8, backgroundColor: "#F1F5F9" },

  actions: { margin: 20, gap: 12 },
  editBtn: {
    borderColor: "#2563EB", borderWidth: 1, paddingVertical: 12,
    borderRadius: 6, alignItems: "center",
  },
  editBtnText: { color: "#2563EB", fontSize: 16, fontWeight: "600" },

  saveBtn: {
    backgroundColor: "#2563EB", paddingVertical: 12,
    borderRadius: 6, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  cancelBtn: {
    borderColor: "#6B7280", borderWidth: 1, paddingVertical: 12,
    borderRadius: 6, alignItems: "center",
  },
  cancelBtnText: { color: "#6B7280", fontSize: 16, fontWeight: "600" },

  deleteBtn: {
    borderColor: "#DC2626", borderWidth: 1, paddingVertical: 12,
    borderRadius: 6, alignItems: "center",
  },
  deleteBtnText: { color: "#DC2626", fontSize: 16, fontWeight: "600" },
});