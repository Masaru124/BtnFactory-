import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import BackButton from "../../components/BackButton";
import { API_URL } from "../../constants/api";
import { useAuth } from "../contexts/AuthContext";

export default function OrderDetailsScreen() {
  const { order } = useLocalSearchParams();
  const orderData = JSON.parse(order);

  const { userToken } = useAuth();
  const [formData, setFormData] = useState(orderData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({});

  const handleChange = (key, value) => {
    const keys = key.split(".");
    if (keys.length === 1) {
      setFormData((prev) => ({ ...prev, [key]: value }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev };
        let temp = updated;
        for (let i = 0; i < keys.length - 1; i++) {
          temp[keys[i]] = temp[keys[i]] || {};
          temp = temp[keys[i]];
        }
        temp[keys[keys.length - 1]] = value;
        return updated;
      });
    }
  };

  const pickImage = async (key) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission required", "Please allow gallery access.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) return;
    handleChange(key, result.assets[0].uri);
  };

  const handleDateChange = (key, _, selectedDate) => {
    setShowDatePicker((prev) => ({ ...prev, [key]: false }));
    if (selectedDate) handleChange(key, selectedDate.toISOString());
  };

  const saveChanges = async () => {
    if (!userToken) return Alert.alert("Error", "Authentication token not found");
    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/orders/${formData.poNumber}`, {
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
      const response = await fetch(`${API_URL}/api/admin/orders/${formData.poNumber}`, {
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

  const renderDatePicker = (key, value) =>
    showDatePicker[key] && (
      <DateTimePicker
        value={value ? new Date(value) : new Date()}
        mode="date"
        display="default"
        onChange={(e, date) => handleDateChange(key, e, date)}
      />
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Core Order Info */}
      <Section title="Core Order Information">
        <EditableRow label="Company Name" value={formData.companyName} editable={isEditing} onChangeText={(v) => handleChange("companyName", v)} />
        <EditableRow label="PO Number" value={formData.poNumber} editable={false} />
        <EditableRow
          label="PO Date"
          value={formData.poDate ? new Date(formData.poDate).toLocaleDateString() : "-"}
          editable={isEditing}
          onPress={() => setShowDatePicker({ poDate: true })}
        />
        {renderDatePicker("poDate", formData.poDate)}
        <EditableRow label="PO Image" value={formData.poImage} isImage editable={isEditing} onPress={() => pickImage("poImage")} />
        <EditableRow label="Button Image" value={formData.buttonImage} isImage editable={isEditing} onPress={() => pickImage("buttonImage")} />
        <EditableRow label="Casting" value={formData.casting} editable={isEditing} onChangeText={(v) => handleChange("casting", v)} />
        <EditableRow label="Thickness" value={formData.thickness} editable={isEditing} onChangeText={(v) => handleChange("thickness", v)} />
        <EditableRow label="Linings" value={formData.linings} editable={isEditing} onChangeText={(v) => handleChange("linings", v)} />
        <EditableRow label="Holes" value={formData.holes} editable={isEditing} onChangeText={(v) => handleChange("holes", v)} />
        <EditableRow label="Laser" value={formData.laser} editable={isEditing} onChangeText={(v) => handleChange("laser", v)} />
        <EditableRow label="Polish Type" value={formData.polishType} editable={isEditing} onChangeText={(v) => handleChange("polishType", v)} />
        <EditableRow label="Box Type" value={formData.boxType} editable={isEditing} onChangeText={(v) => handleChange("boxType", v)} />
        <EditableRow label="Tool Number" value={formData.toolNumber?.toString()} editable={isEditing} onChangeText={(v) => handleChange("toolNumber", Number(v))} />
        <EditableRow label="Rate" value={`₹${formData.rate}`} editable={isEditing} onChangeText={(v) => handleChange("rate", Number(v))} />
        <EditableRow label="Quantity" value={formData.quantity?.toString()} editable={isEditing} onChangeText={(v) => handleChange("quantity", Number(v))} />
        <EditableRow label="Packing Option" value={formData.packingOption} editable={isEditing} onChangeText={(v) => handleChange("packingOption", v)} />
        <EditableRow
          label="Dispatch Date"
          value={formData.dispatchDate ? new Date(formData.dispatchDate).toLocaleDateString() : "-"}
          editable={isEditing}
          onPress={() => setShowDatePicker({ dispatchDate: true })}
        />
        {renderDatePicker("dispatchDate", formData.dispatchDate)}
        <EditableRow label="Destination" value={formData.destination} editable={isEditing} onChangeText={(v) => handleChange("destination", v)} />
        <EditableRow label="Status" value={formData.status} editable={isEditing} onChangeText={(v) => handleChange("status", v)} />
        <EditableRow label="Token" value={formData.token} editable={false} />
        <EditableRow label="Created Date" value={new Date(formData.createdDate).toLocaleString()} editable={false} />
      </Section>

      {/* Raw Materials */}
      <Section title="Raw Materials">
        {formData.rawMaterials?.length ? formData.rawMaterials.map((rm, idx) => (
          <EditableRow
            key={idx}
            label={rm.materialName}
            value={`${rm.quantity} (₹${rm.totalPrice})`}
            editable={isEditing}
            onChangeText={(v) => {
              const newMaterials = [...formData.rawMaterials];
              newMaterials[idx].quantity = Number(v);
              handleChange("rawMaterials", newMaterials);
            }}
          />
        )) : <Text style={styles.emptyText}>No raw materials</Text>}
      </Section>

      {/* Casting Department */}
      <Section title="Casting Department">
        {["blankThickness", "preparedQuantity", "operator", "employeeId", "startDate", "endDate"].map((key) => (
          <EditableRow
            key={key}
            label={key}
            value={key.includes("Date") && formData.castingProcess?.[key] ? new Date(formData.castingProcess[key]).toLocaleDateString() : formData.castingProcess?.[key]}
            editable={isEditing}
            onChangeText={key.includes("Date") ? undefined : (v) => handleChange(`castingProcess.${key}`, isNaN(Number(v)) ? v : Number(v))}
            onPress={key.includes("Date") ? () => setShowDatePicker({ [`castingProcess.${key}`]: true }) : undefined}
          />
        ))}
        {Object.keys(formData.castingProcess || {}).map((k) => renderDatePicker(`castingProcess.${k}`, formData.castingProcess[k]))}
      </Section>

      {/* Turning Department */}
      <Section title="Turning Department">
        {["mcNo", "operator", "employeeId", "remark", "receivedDate", "startTime", "endTime", "grossWeight", "wtInKg", "finishThickness"].map((key) => (
          <EditableRow
            key={key}
            label={key}
            value={["receivedDate", "startTime", "endTime"].includes(key) && formData.turningProcess?.[key] ? new Date(formData.turningProcess[key]).toLocaleString() : formData.turningProcess?.[key]}
            editable={isEditing}
            onChangeText={["receivedDate", "startTime", "endTime"].includes(key) ? undefined : (v) => handleChange(`turningProcess.${key}`, isNaN(Number(v)) ? v : Number(v))}
            onPress={["receivedDate", "startTime", "endTime"].includes(key) ? () => setShowDatePicker({ [`turningProcess.${key}`]: true }) : undefined}
          />
        ))}
        {Object.keys(formData.turningProcess || {}).map((k) => renderDatePicker(`turningProcess.${k}`, formData.turningProcess[k]))}
      </Section>

      {/* Polishing Department */}
      <Section title="Polishing Department">
        {["readyThickness", "weightInGram", "weightInKg", "gross", "grossWeightInGram", "polishDate", "receivedDate", "startTime", "endTime", "operator", "employeeId"].map((key) => (
          <EditableRow
            key={key}
            label={key}
            value={["polishDate", "receivedDate", "startTime", "endTime"].includes(key) && formData.polishProcess?.[key] ? new Date(formData.polishProcess[key]).toLocaleString() : formData.polishProcess?.[key]}
            editable={isEditing}
            onChangeText={["polishDate", "receivedDate", "startTime", "endTime"].includes(key) ? undefined : (v) => handleChange(`polishProcess.${key}`, isNaN(Number(v)) ? v : Number(v))}
            onPress={["polishDate", "receivedDate", "startTime", "endTime"].includes(key) ? () => setShowDatePicker({ [`polishProcess.${key}`]: true }) : undefined}
          />
        ))}
        {Object.keys(formData.polishProcess || {}).map((k) => renderDatePicker(`polishProcess.${k}`, formData.polishProcess[k]))}
      </Section>

      {/* Actions */}
      <View style={styles.actions}>
        {isEditing ? (
          <>
            {isSaving ? <ActivityIndicator size="small" color="#000" /> :
              <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsEditing(false)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}><Text style={styles.editBtnText}>Edit Order</Text></TouchableOpacity>
            {isDeleting ? <ActivityIndicator size="small" color="#DC2626" /> :
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}><Text style={styles.deleteBtnText}>Delete Order</Text></TouchableOpacity>}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const EditableRow = ({ label, value, editable, onChangeText, isImage, onPress }) => (
  <TouchableOpacity disabled={!editable || !isImage} onPress={onPress}>
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {isImage ? (value ? <Image source={{ uri: value }} style={styles.image} /> : <Text style={styles.detailValue}>No image</Text>)
        : editable && onChangeText ? <TextInput style={styles.input} value={value?.toString()} onChangeText={onChangeText} />
          : <Text style={styles.detailValue}>{value ?? "-"}</Text>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: Platform.OS === "ios" ? 60 : 20, paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: "#000" },
  section: { marginVertical: 10, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6, color: "#111" },
  card: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 8, borderWidth: 0.5, borderColor: "#E5E7EB" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  detailLabel: { fontSize: 14, color: "#6B7280", fontWeight: "500" },
  detailValue: { fontSize: 14, color: "#111827", fontWeight: "500", maxWidth: "60%", textAlign: "right" },
  input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 6, padding: 6, minWidth: 120, textAlign: "right" },
  image: { width: 80, height: 80, borderRadius: 8 },
  actions: { margin: 20, gap: 12 },
  editBtn: { borderWidth: 1, borderColor: "#000", padding: 14, borderRadius: 8, alignItems: "center" },
  editBtnText: { color: "#000", fontWeight: "600" },
  saveBtn: { backgroundColor: "#000", padding: 14, borderRadius: 8, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "600" },
  cancelBtn: { borderWidth: 1, borderColor: "#6B7280", padding: 14, borderRadius: 8, alignItems: "center" },
  cancelBtnText: { color: "#6B7280", fontWeight: "600" },
  deleteBtn: { borderWidth: 1, borderColor: "#DC2626", padding: 14, borderRadius: 8, alignItems: "center" },
  deleteBtnText: { color: "#DC2626", fontWeight: "600" },
  emptyText: { fontSize: 14, color: "#9CA3AF", padding: 12 },
});
