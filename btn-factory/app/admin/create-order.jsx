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
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";

// 🔹 Reusable Input Component
const FormField = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType || "default"}
      placeholderTextColor="#9CA3AF"
    />
  </View>
);

export default function CreateOrderScreen() {
  const { userToken } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    companyName: "",
    poNumber: "",
    poDate: new Date(),
    casting: "Rod",
    otherCasting: "",
    thickness: "",
    holes: "",
    boxType: "DD",
    rate: "",
    linings: "",
    laser: "",
    polishType: "",
    quantity: "",
    toolNumber: "",
    packingOption: "",
    dispatchDate: null,
    destination: "",
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDispatchPicker, setShowDispatchPicker] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  const [poImage, setPoImage] = useState(null);
  const [buttonImage, setButtonImage] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) handleChange("poDate", selectedDate);
  };

  const handleDispatchDateChange = (_, selectedDate) => {
    setShowDispatchPicker(false);
    if (selectedDate) handleChange("dispatchDate", selectedDate);
  };

  const pickImage = async (setImageState) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please grant permission to access gallery");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImageState(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Could not pick image: " + err.message);
    }
  };

  const handleSubmit = async () => {
    const {
      companyName,
      poNumber,
      poDate,
      casting,
      otherCasting,
      thickness,
      holes,
      boxType,
      rate,
      quantity,
      packingOption,
    } = formData;

    const newPoNumber =
      poNumber?.trim() || `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    handleChange("poNumber", newPoNumber);

    if (
      !companyName?.trim() ||
      !poNumber?.trim() ||
      !poDate ||
      !casting?.trim() ||
      (casting === "Other" && !otherCasting?.trim()) ||
      !thickness?.trim() ||
      !holes?.trim() ||
      !boxType?.trim() ||
      !rate?.trim() ||
      !quantity?.trim() ||
      !packingOption?.trim()
    ) {
      Alert.alert("Required Fields", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (!value) return;
        if (key === "poDate" || key === "dispatchDate") {
          data.append(key, new Date(value).toISOString().split("T")[0]);
        } else if (key === "casting" && value === "Other") {
          data.append("casting", formData.otherCasting?.trim() || "Other");
        } else {
          data.append(key, value);
        }
      });

      // Append images safely
      const appendImage = (image, fieldName) => {
        if (!image) return;
        const uri = Platform.OS === "ios" ? image.uri.replace("file://", "") : image.uri;
        const type = image.type || "image/jpeg";
        const name = image.fileName || `${fieldName}.jpg`;
        data.append(fieldName, { uri, name, type });
      };

      appendImage(poImage, "poImage");
      appendImage(buttonImage, "buttonImage");

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` }, // no 'Content-Type'
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create order.");
      }

      const responseData = await response.json();
      setCreatedToken(responseData.token);
      resetForm();
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
      casting: "Rod",
      otherCasting: "",
      thickness: "",
      holes: "",
      boxType: "DD",
      rate: "",
      linings: "",
      laser: "",
      polishType: "",
      quantity: "",
      toolNumber: "",
      packingOption: "",
      dispatchDate: null,
      destination: "",
    });
    setPoImage(null);
    setButtonImage(null);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Create Order</Text>
        <View style={{ width: 28 }} />
      </View>

      {createdToken && (
        <View style={styles.tokenCard}>
          <Ionicons name="checkmark-circle" size={22} color="#2563EB" />
          <View>
            <Text style={styles.tokenTitle}>Order Created</Text>
            <Text style={styles.tokenText}>Token: {createdToken}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company Details</Text>
        <FormField
          label="Company/Customer Name *"
          value={formData.companyName}
          onChangeText={(t) => handleChange("companyName", t)}
          placeholder="Enter company name"
        />
        <FormField
          label="P.O. Number *"
          value={formData.poNumber}
          onChangeText={(t) => handleChange("poNumber", t)}
          placeholder="Enter PO number"
        />
        <Text style={styles.label}>P.O. Date *</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {formData.poDate.toLocaleDateString("en-IN")}
          </Text>
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

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => pickImage(setPoImage)}
      >
        <Ionicons name="image-outline" size={18} color="#fff" />
        <Text style={styles.uploadText}>Upload PO Image</Text>
      </TouchableOpacity>
      {poImage && <Image source={{ uri: poImage.uri }} style={styles.previewImage} />}

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
            onChangeText={(t) => handleChange("otherCasting", t)}
            placeholder="Enter casting type"
          />
        )}

        <FormField
          label="Thickness (mm) *"
          value={formData.thickness}
          onChangeText={(t) => handleChange("thickness", t)}
          keyboardType="numeric"
          placeholder="Enter thickness"
        />
        <FormField
          label="Holes *"
          value={formData.holes}
          onChangeText={(t) => handleChange("holes", t)}
          keyboardType="numeric"
          placeholder="Enter number of holes"
        />
        <FormField
          label="Linings"
          value={formData.linings}
          onChangeText={(t) => handleChange("linings", t)}
          placeholder="Enter linings"
        />
        <FormField
          label="Laser"
          value={formData.laser}
          onChangeText={(t) => handleChange("laser", t)}
          placeholder="Enter laser details"
        />
        <FormField
          label="Polish Type"
          value={formData.polishType}
          onChangeText={(t) => handleChange("polishType", t)}
          placeholder="Enter polish type"
        />
        <FormField
          label="Quantity"
          value={formData.quantity}
          onChangeText={(t) => handleChange("quantity", t)}
          keyboardType="numeric"
          placeholder="Enter quantity"
        />
        <FormField
          label="Tool Number"
          value={formData.toolNumber}
          onChangeText={(t) => handleChange("toolNumber", t)}
          keyboardType="numeric"
          placeholder="Enter tool number"
        />
        <FormField
          label="Packing Option"
          value={formData.packingOption}
          onChangeText={(t) => handleChange("packingOption", t)}
          placeholder="Enter packing option"
        />

        <Text style={styles.label}>Box Type *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.boxType}
            onValueChange={(v) => handleChange("boxType", v)}
            style={styles.picker}
            dropdownIconColor="#555"
          >
            <Picker.Item label="DD" value="DD" />
            <Picker.Item label="SD" value="SD" />
            <Picker.Item label="ODS" value="ODS" />
          </Picker>
        </View>

        <FormField
          label="Rate (₹) *"
          value={formData.rate}
          onChangeText={(t) => handleChange("rate", t)}
          keyboardType="decimal-pad"
          placeholder="Enter rate per unit"
        />

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage(setButtonImage)}
        >
          <Ionicons name="image-outline" size={18} color="#fff" />
          <Text style={styles.uploadText}>Upload Button Image</Text>
        </TouchableOpacity>
        {buttonImage && (
          <Image source={{ uri: buttonImage.uri }} style={styles.previewImage} />
        )}

        <Text style={styles.label}>Dispatch Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDispatchPicker(true)}
        >
          <Text style={styles.dateText}>
            {formData.dispatchDate
              ? formData.dispatchDate.toLocaleDateString("en-IN")
              : "Select date"}
          </Text>
          <MaterialIcons name="date-range" size={20} color="#555" />
        </TouchableOpacity>
        {showDispatchPicker && (
          <DateTimePicker
            value={formData.dispatchDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDispatchDateChange}
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Create Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles remain the same as your previous code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111111" },

  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12, color: "#111111" },

  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#111111", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111111",
    backgroundColor: "#FFFFFF",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },

  radioGroup: { flexDirection: "row", gap: 20, marginBottom: 16 },
  radioOption: { flexDirection: "row", alignItems: "center" },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#111111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  selectedRb: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#111111" },
  radioText: { fontSize: 14, color: "#111111" },

  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  dateText: { fontSize: 14, color: "#111111" },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
    gap: 8,
    backgroundColor: "#FFFFFF",
  },
  uploadText: { color: "#111111", fontWeight: "600", fontSize: 14 },

  previewImage: { width: 100, height: 100, borderRadius: 6, marginVertical: 8 },

  submitButton: {
    marginHorizontal: 16,
    marginVertical: 20,
    backgroundColor: "#111111",
    borderRadius: 6,
    alignItems: "center",
    paddingVertical: 14,
  },
  submitText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  tokenCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 14,
  },
  tokenTitle: { fontWeight: "700", color: "#111111", fontSize: 15 },
  tokenText: { fontSize: 14, color: "#111111" },
});

