import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { API_URL } from "../../constants/api";
import { useAuth } from "../contexts/AuthContext";
import BackButton from "../../components/BackButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

export default function EditOrderScreen() {
  const { order } = useLocalSearchParams();
  const orderData = JSON.parse(order);

  const { userToken } = useAuth();
  const [formData, setFormData] = useState(orderData);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

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

      setTimeout(() => {
        router.back();
      }, 300);
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
        <Text style={styles.title}>Edit Order</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tracking Info */}
      <Section title="Tracking Information">
        <InputField
          label="Tracking Token"
          value={formData.token}
          onChangeText={(t) => handleChange("token", t)}
        />
        <PickerInput
          label="Status"
          value={formData.status}
          options={["Pending", "Shipped", "Completed", "Cancelled"]}
          onChange={(val) => handleChange("status", val)}
        />
        <DateInput
          label="Created Date"
          value={formData.createdDate}
          onChange={(val) => handleChange("createdDate", val)}
        />
      </Section>

      {/* Core Order Info */}
      <Section title="Core Order Information">
        <InputField
          label="Company Name"
          value={formData.companyName}
          onChangeText={(t) => handleChange("companyName", t)}
        />
        <InputField
          label="PO Number"
          value={formData.poNumber}
          onChangeText={(t) => handleChange("poNumber", t)}
        />
        <DateInput
          label="PO Date"
          value={formData.poDate}
          onChange={(val) => handleChange("poDate", val)}
        />
        <InputField
          label="PO Image URL"
          value={formData.poImage}
          onChangeText={(t) => handleChange("poImage", t)}
        />
        <DateInput
          label="Dispatch Date"
          value={formData.dispatchDate}
          onChange={(val) => handleChange("dispatchDate", val)}
        />
      </Section>

      {/* Product Details */}
      <Section title="Product Details">
        <InputField
          label="Button Image URL"
          value={formData.buttonImage}
          onChangeText={(t) => handleChange("buttonImage", t)}
        />
        <InputField
          label="Casting"
          value={formData.casting}
          onChangeText={(t) => handleChange("casting", t)}
        />
        <InputField
          label="Thickness"
          value={formData.thickness}
          onChangeText={(t) => handleChange("thickness", t)}
        />
        <InputField
          label="Linings"
          value={formData.linings}
          onChangeText={(t) => handleChange("linings", t)}
        />
        <InputField
          label="Holes"
          value={formData.holes}
          onChangeText={(t) => handleChange("holes", t)}
        />
        <InputField
          label="Laser Cutting"
          value={formData.laser}
          onChangeText={(t) => handleChange("laser", t)}
        />
        <InputField
          label="Polish Type"
          value={formData.polishType}
          onChangeText={(t) => handleChange("polishType", t)}
        />
        <InputField
          label="Box Type"
          value={formData.boxType}
          onChangeText={(t) => handleChange("boxType", t)}
        />
        <InputField
          label="Tool Number"
          value={String(formData.toolNumber)}
          keyboardType="numeric"
          onChangeText={(t) => handleChange("toolNumber", Number(t))}
        />
        <InputField
          label="Rate"
          value={String(formData.rate)}
          keyboardType="numeric"
          onChangeText={(t) => handleChange("rate", Number(t))}
        />
        <InputField
          label="Quantity"
          value={String(formData.quantity)}
          keyboardType="numeric"
          onChangeText={(t) => handleChange("quantity", Number(t))}
        />
        <PickerInput
          label="Packing Option"
          value={formData.packingOption}
          options={["Box", "Bag", "Bulk"]}
          onChange={(val) => handleChange("packingOption", val)}
        />
      </Section>

      {/* Raw Materials */}
      <Section title="Raw Materials">
        {formData.rawMaterials?.length > 0 ? (
          formData.rawMaterials.map((mat, idx) => (
            <View key={idx} style={styles.subCard}>
              <Text style={styles.subTitle}>Material {idx + 1}</Text>
              <InputField
                label="Name"
                value={mat.materialName}
                onChangeText={(t) => {
                  const updated = [...formData.rawMaterials];
                  updated[idx].materialName = t;
                  handleChange("rawMaterials", updated);
                }}
              />
              <InputField
                label="Quantity"
                value={String(mat.quantity)}
                keyboardType="numeric"
                onChangeText={(t) => {
                  const updated = [...formData.rawMaterials];
                  updated[idx].quantity = Number(t);
                  handleChange("rawMaterials", updated);
                }}
              />
              <InputField
                label="Total Price"
                value={String(mat.totalPrice)}
                keyboardType="numeric"
                onChangeText={(t) => {
                  const updated = [...formData.rawMaterials];
                  updated[idx].totalPrice = Number(t);
                  handleChange("rawMaterials", updated);
                }}
              />
              <DateInput
                label="Updated At"
                value={mat.updatedAt}
                onChange={(t) => {
                  const updated = [...formData.rawMaterials];
                  updated[idx].updatedAt = t;
                  handleChange("rawMaterials", updated);
                }}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No raw materials</Text>
        )}
      </Section>

      {/* Casting Process */}
      <Section title="Casting Process">
        <InputField
          label="Raw Materials Used"
          value={formData.castingProcess?.rawMaterialsUsed}
          onChangeText={(t) =>
            handleNestedChange("castingProcess", "rawMaterialsUsed", t)
          }
        />
        <InputField
          label="Sheets Made"
          value={String(formData.castingProcess?.sheetsMade || "")}
          keyboardType="numeric"
          onChangeText={(t) =>
            handleNestedChange("castingProcess", "sheetsMade", Number(t))
          }
        />
        <InputField
          label="Sheets Wasted"
          value={String(formData.castingProcess?.sheetsWasted || "")}
          keyboardType="numeric"
          onChangeText={(t) =>
            handleNestedChange("castingProcess", "sheetsWasted", Number(t))
          }
        />
        <DateInput
          label="Start Time"
          value={formData.castingProcess?.startTime}
          onChange={(t) => handleNestedChange("castingProcess", "startTime", t)}
          mode="time"
        />
        <DateInput
          label="End Time"
          value={formData.castingProcess?.endTime}
          onChange={(t) => handleNestedChange("castingProcess", "endTime", t)}
          mode="time"
        />
      </Section>

      {/* Save button */}
      <View style={styles.actions}>
        {isSaving ? (
          <ActivityIndicator size="small" color="#2563EB" />
        ) : (
          <TouchableOpacity style={styles.saveBtn} onPress={saveChanges}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
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

const InputField = ({ label, value, onChangeText, keyboardType }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value?.toString() || ""}
      onChangeText={onChangeText}
      keyboardType={keyboardType || "default"}
    />
  </View>
);

const DateInput = ({ label, value, onChange, mode = "date" }) => {
  const [show, setShow] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
        <Text>
          {value
            ? new Date(value).toLocaleString("en-US", {
                dateStyle: mode === "date" ? "medium" : undefined,
                timeStyle: mode === "time" ? "short" : undefined,
              })
            : "Select"}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode={mode}
          display="default"
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate) onChange(selectedDate.toISOString());
          }}
        />
      )}
    </View>
  );
};

const PickerInput = ({ label, value, options, onChange }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
      >
        {options.map((opt) => (
          <Picker.Item key={opt} label={opt} value={opt} />
        ))}
      </Picker>
    </View>
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
  inputGroup: { marginHorizontal: 16, marginVertical: 8 },
  label: { fontSize: 14, color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    overflow: "hidden",
  },
  picker: { height: 40 },
  actions: { margin: 20 },
  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
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
