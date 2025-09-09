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
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this order?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteOrder },
      ]
    );
  };

  const deleteOrder = async () => {
    if (!userToken) {
      Alert.alert("Error", "Authentication token not found");
      return;
    }
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderData.poNumber}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
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
    if (!userToken) {
      Alert.alert("Error", "Authentication token not found");
      return;
    }
    setIsSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderData.poNumber}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

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

      {/* Tracking Info */}
      <Section title="Tracking Information">
        <EditableRow
          label="Tracking Token"
          value={formData.token}
          editable={isEditing}
        />
        <EditableRow
          label="Status"
          value={formData.status}
          editable={isEditing}
          valueStyle={{ color: statusColors[formData.status?.toLowerCase()] }}
        />
        <EditableRow
          label="Created Date"
          value={new Date(formData.createdDate).toLocaleString("en-IN")}
        />
      </Section>

      {/* Core Order Info */}
      <Section title="Core Order Information">
        <EditableRow
          label="Company Name"
          value={formData.companyName}
          editable={isEditing}
        />
        <EditableRow
          label="PO Number"
          value={formData.poNumber}
          editable={isEditing}
        />
        <EditableRow
          label="PO Date"
          value={new Date(formData.poDate).toLocaleDateString("en-IN")}
          editable={isEditing}
        />
        <EditableRow
          label="PO Image"
          value={formData.poImage}
          editable={isEditing}
          isImage
        />
        <EditableRow
          label="Dispatch Date"
          value={
            formData.dispatchDate
              ? new Date(formData.dispatchDate).toLocaleDateString("en-IN")
              : "-"
          }
          editable={isEditing}
        />
      </Section>

      {/* Product Details */}
      <Section title="Product Details">
        <EditableRow
          label="Button Image"
          value={formData.buttonImage}
          editable={isEditing}
          isImage
        />
        <EditableRow
          label="Casting"
          value={formData.casting}
          editable={isEditing}
        />
        <EditableRow
          label="Thickness"
          value={formData.thickness}
          editable={isEditing}
        />
        <EditableRow
          label="Linings"
          value={formData.linings}
          editable={isEditing}
        />
        <EditableRow
          label="Holes"
          value={formData.holes}
          editable={isEditing}
        />
        <EditableRow
          label="Laser Cutting"
          value={formData.laser}
          editable={isEditing}
        />
        <EditableRow
          label="Polish Type"
          value={formData.polishType}
          editable={isEditing}
        />
        <EditableRow
          label="Box Type"
          value={formData.boxType}
          editable={isEditing}
        />
        <EditableRow
          label="Tool Number"
          value={formData.toolNumber}
          editable={isEditing}
        />
        <EditableRow
          label="Rate"
          value={`₹${formData.rate}`}
          editable={isEditing}
        />
        <EditableRow
          label="Quantity"
          value={formData.quantity?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Packing Option"
          value={formData.packingOption}
          editable={isEditing}
        />
      </Section>

      {/* Raw Materials */}
      <Section title="Raw Materials">
        {formData.rawMaterials?.length > 0 ? (
          formData.rawMaterials.map((mat, idx) => (
            <View key={idx} style={styles.subCard}>
              <Text style={styles.subTitle}>Material {idx + 1}</Text>
              <EditableRow
                label="Name"
                value={mat.materialName}
                editable={isEditing}
              />
              <EditableRow
                label="Quantity"
                value={mat.quantity?.toString()}
                editable={isEditing}
              />
              <EditableRow
                label="Total Price"
                value={`₹${mat.totalPrice}`}
                editable={isEditing}
              />
              <EditableRow
                label="Updated At"
                value={new Date(mat.updatedAt).toLocaleString("en-IN")}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No raw materials added</Text>
        )}
      </Section>

      {/* Casting Process */}
      <Section title="Casting Process">
        <EditableRow
          label="Raw Materials Used"
          value={formData.castingProcess?.rawMaterialsUsed}
          editable={isEditing}
        />
        <EditableRow
          label="Sheets Made"
          value={formData.castingProcess?.sheetsMade?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Sheets Wasted"
          value={formData.castingProcess?.sheetsWasted?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Start Time"
          value={
            formData.castingProcess?.startTime
              ? new Date(formData.castingProcess.startTime).toLocaleString(
                  "en-IN"
                )
              : "-"
          }
          editable={isEditing}
        />
        <EditableRow
          label="End Time"
          value={
            formData.castingProcess?.endTime
              ? new Date(formData.castingProcess.endTime).toLocaleString(
                  "en-IN"
                )
              : "-"
          }
          editable={isEditing}
        />
      </Section>

      {/* Polishing Process */}
      <Section title="Polishing Process">
        <EditableRow
          label="Total Sheets"
          value={formData.polishProcess?.totalSheets?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Polish Date"
          value={
            formData.polishProcess?.polishDate
              ? new Date(formData.polishProcess.polishDate).toLocaleDateString(
                  "en-IN"
                )
              : "-"
          }
          editable={isEditing}
        />
        <EditableRow
          label="Received Date"
          value={
            formData.polishProcess?.receivedDate
              ? new Date(
                  formData.polishProcess.receivedDate
                ).toLocaleDateString("en-IN")
              : "-"
          }
          editable={isEditing}
        />
        <EditableRow
          label="Gross Weight"
          value={formData.polishProcess?.GrossWeight?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Wt in Kg"
          value={formData.polishProcess?.WtinKg?.toString()}
          editable={isEditing}
        />
      </Section>

      {/* Turning Process */}
      <Section title="Turning Process">
        <EditableRow
          label="Total Sheets"
          value={formData.turningProcess?.totalSheets?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Turning Date"
          value={
            formData.turningProcess?.turningDate
              ? new Date(
                  formData.turningProcess.turningDate
                ).toLocaleDateString("en-IN")
              : "-"
          }
          editable={isEditing}
        />
        <EditableRow
          label="Received Date"
          value={
            formData.turningProcess?.receivedDate
              ? new Date(
                  formData.turningProcess.receivedDate
                ).toLocaleDateString("en-IN")
              : "-"
          }
          editable={isEditing}
        />
        <EditableRow
          label="Gross Weight"
          value={formData.turningProcess?.GrossWeight?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Wt in Kg"
          value={formData.turningProcess?.WtinKg?.toString()}
          editable={isEditing}
        />
        <EditableRow
          label="Finish Thickness"
          value={formData.turningProcess?.FinishThickness?.toString()}
          editable={isEditing}
        />
      </Section>

      {/* Action Buttons */}
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
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
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
    {children}
  </View>
);

const EditableRow = ({
  label,
  value,
  editable,
  onChangeText,
  valueStyle,
  isImage,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    {isImage && value ? (
      <Image source={{ uri: value }} style={styles.image} />
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

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700" },
  section: {
    marginVertical: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#374151",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    maxWidth: "60%",
    textAlign: "right",
  },
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
    borderColor: "#2563EB",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  editBtnText: { color: "#2563EB", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#6B7280",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelBtnText: { color: "#6B7280", fontWeight: "600" },
  deleteBtn: {
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteBtnText: { color: "#DC2626", fontWeight: "600" },
  subCard: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  subTitle: { fontWeight: "600", marginBottom: 8, color: "#111827" },
  emptyText: { textAlign: "center", padding: 12, color: "#9CA3AF" },
});
