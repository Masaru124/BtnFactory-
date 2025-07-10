import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "../../constants/api";
import { AuthContext } from "../contexts/AuthContext";

export default function CreateOrderScreen() {
  const { token, user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    companyName: "",
    poNumber: "",
    poDate: new Date(),
    poImage: null,
    casting: "Rod",
    otherCasting: "",
    thickness: "",
    holes: "",
    boxType: "DD",
    rate: "",
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });
      if (result.type === "success") {
        handleChange("poImage", result);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select document");
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        handleChange("poImage", {
          uri: result.assets[0].uri,
          name: `po_image_${Date.now()}.jpg`,
          type: "image/jpeg",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("poDate", selectedDate);
    }
  };

  const handleSubmit = async () => {
    const { companyName, poNumber, poDate, casting, thickness, holes, boxType, rate } = formData;

    if (!companyName || !poNumber || !poDate || !casting || !thickness || !holes || !boxType || !rate) {
      Alert.alert("Required Fields", "Please fill all required fields");
      return;
    }

    if (!user || !user._id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "poDate") {
          data.append(key, value.toISOString().split("T")[0]);
        } else if (key === "poImage" && value) {
          data.append(key, {
            uri: value.uri,
            name: value.name,
            type: value.type || "application/octet-stream",
          });
        } else if (key === "casting" && value === "Other") {
          data.append("casting", formData.otherCasting);
        } else if (value && key !== "otherCasting") {
          data.append(key, value);
        }
      });

      data.append("userId", user._id);

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const responseData = await response.json();

      if (response.ok) {
        setCreatedToken(responseData.token);
        resetForm();
      } else {
        throw new Error(responseData.message || "Failed to create order");
      }
    } catch (error) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: "",
      poNumber: "",
      poDate: new Date(),
      poImage: null,
      casting: "Rod",
      otherCasting: "",
      thickness: "",
      holes: "",
      boxType: "DD",
      rate: "",
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Create New Order</Text>

      {createdToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenTitle}>Order Created Successfully</Text>
          <Text style={styles.tokenText}>Token: {createdToken}</Text>
        </View>
      )}

      {/* Company Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Details</Text>

        <FormField
          label="Company/Customer Name *"
          value={formData.companyName}
          onChangeText={(text) => handleChange("companyName", text)}
          placeholder="Enter company name"
        />

        <FormField
          label="P.O. Number *"
          value={formData.poNumber}
          onChangeText={(text) => handleChange("poNumber", text)}
          placeholder="Enter PO number"
        />

        <View>
          <Text style={styles.label}>P.O. Date *</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{formData.poDate.toLocaleDateString("en-IN")}</Text>
            <MaterialIcons name="date-range" size={20} color="#555" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.poDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.uploadContainer}>
          <Text style={styles.label}>P.O. Document/Image</Text>
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={[styles.uploadButton, styles.uploadButtonLeft]} onPress={pickDocument}>
              <MaterialIcons name="insert-drive-file" size={18} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.uploadButton, styles.uploadButtonRight]} onPress={pickImage}>
              <MaterialIcons name="image" size={18} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
          {formData.poImage && <Text style={styles.fileName}>{formData.poImage.name || "Selected file"}</Text>}
        </View>
      </View>

      {/* Product Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Product Details</Text>

        <Text style={styles.label}>Casting Type *</Text>
        <View style={styles.radioGroup}>
          {["Rod", "Sheet", "Other"].map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.radioOption}
              onPress={() => handleChange("casting", option)}
            >
              <View style={styles.radioCircle}>
                {formData.casting === option && <View style={styles.selectedRb} />}
              </View>
              <Text style={styles.radioText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {formData.casting === "Other" && (
          <FormField
            label="Specify Casting Type *"
            value={formData.otherCasting}
            onChangeText={(text) => handleChange("otherCasting", text)}
            placeholder="Enter casting type"
          />
        )}

        <FormField
          label="Thickness (mm) *"
          value={formData.thickness}
          onChangeText={(text) => handleChange("thickness", text)}
          placeholder="Enter thickness"
          keyboardType="numeric"
        />

        <FormField
          label="Holes *"
          value={formData.holes}
          onChangeText={(text) => handleChange("holes", text)}
          placeholder="Enter number of holes"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Box Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.boxType}
            onValueChange={(value) => handleChange("boxType", value)}
            style={styles.picker}
            dropdownIconColor="#555"
          >
            <Picker.Item label="DD" value="DD" />
            <Picker.Item label="SD" value="SD" />
          </Picker>
        </View>

        <FormField
          label="Rate (₹) *"
          value={formData.rate}
          onChangeText={(text) => handleChange("rate", text)}
          placeholder="Enter rate per unit"
          keyboardType="decimal-pad"
          prefix="₹"
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Create Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const FormField = ({ label, value, onChangeText, placeholder, keyboardType, prefix }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      {prefix && <Text style={styles.prefix}>{prefix}</Text>}
      <TextInput
        style={[styles.input, prefix && { paddingLeft: 0 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 80 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 4 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 8, paddingHorizontal: 8 },
  prefix: { marginRight: 4, fontSize: 16, color: "#333" },
  input: { flex: 1, height: 40 },
  dateInput: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 8, paddingHorizontal: 12, height: 40 },
  dateText: { color: "#333" },
  uploadContainer: { marginTop: 12 },
  uploadButtons: { flexDirection: "row", marginTop: 4 },
  uploadButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 10, backgroundColor: "#4a90e2" },
  uploadButtonLeft: { borderTopLeftRadius: 8, borderBottomLeftRadius: 8, marginRight: 1 },
  uploadButtonRight: { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  uploadButtonText: { color: "#fff", marginLeft: 6 },
  fileName: { marginTop: 6, fontSize: 12, color: "#444" },
  radioGroup: { flexDirection: "row", marginBottom: 8 },
  radioOption: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  radioCircle: { height: 18, width: 18, borderRadius: 9, borderWidth: 2, borderColor: "#444", alignItems: "center", justifyContent: "center", marginRight: 6 },
  selectedRb: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#444" },
  radioText: { fontSize: 14 },
  pickerContainer: { backgroundColor: "#f0f0f0", borderRadius: 8 },
  picker: { height: 40, width: "100%" },
  submitButton: { marginTop: 16, backgroundColor: "#1e88e5", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  tokenContainer: { backgroundColor: "#e0f7fa", padding: 12, borderRadius: 8, marginBottom: 16 },
  tokenTitle: { fontWeight: "bold", fontSize: 16, color: "#00796b" },
  tokenText: { fontSize: 14, color: "#004d40", marginTop: 4 },
});
