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
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";

// 🔹 Reusable Input Component
const FormField = ({ label, value, onChangeText, placeholder, keyboardType }) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType || "default"}
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
    packingOption: "",
    dispatchDate: null,
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDispatchPicker, setShowDispatchPicker] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  // images are managed separately
  const [poImage, setPoImage] = useState(null);
  const [buttonImage, setButtonImage] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange("poDate", selectedDate);
    }
  };

  const handleDispatchDateChange = (event, selectedDate) => {
    setShowDispatchPicker(false);
    if (selectedDate) {
      handleChange("dispatchDate", selectedDate);
    }
  };

  // 🔹 Image Picker
  const pickImage = async (setImageState) => {
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

    if (!result.canceled) {
      setImageState(result.assets[0]);
    }
  };

  // 🔹 Submit Order
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

      // 🔹 Handle Images
      if (poImage) {
        data.append("poImage", {
          uri: Platform.OS === "ios" ? poImage.uri.replace("file://", "") : poImage.uri,
          name: poImage.fileName || `po.${poImage.type?.split("/")[1] || "jpg"}`,
          type: poImage.type || "image/jpeg",
        });
      }

      if (buttonImage) {
        data.append("buttonImage", {
          uri: Platform.OS === "ios" ? buttonImage.uri.replace("file://", "") : buttonImage.uri,
          name: buttonImage.fileName || `button.${buttonImage.type?.split("/")[1] || "jpg"}`,
          type: buttonImage.type || "image/jpeg",
        });
      }

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "POST",
        headers: { Authorization: `Bearer ${userToken}` },
        body: data,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(errorText || "Failed to create order.");
      }

      const responseData = await response.json();
      setCreatedToken(responseData.token);
      resetForm();
    } catch (error) {
      console.error("Create order error:", error);
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
      packingOption: "",
      dispatchDate: null,
    });
    setPoImage(null);
    setButtonImage(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerContainer}>
        <BackButton />
        <Text style={styles.header}>Create New Order</Text>
        <View style={{ width: 24 }} />
      </View>

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
      </View>

      {/* PO Image Upload */}
      <TouchableOpacity style={styles.fileButton} onPress={() => pickImage(setPoImage)}>
        <Text style={styles.fileButtonText}>Choose PO Image</Text>
      </TouchableOpacity>
      {poImage && <Image source={{ uri: poImage.uri }} style={{ width: 100, height: 100 }} />}

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

        <FormField
          label="Linings"
          value={formData.linings}
          onChangeText={(text) => handleChange("linings", text)}
          placeholder="Enter linings"
        />

        <FormField
          label="Laser"
          value={formData.laser}
          onChangeText={(text) => handleChange("laser", text)}
          placeholder="Enter laser details"
        />

        <FormField
          label="Polish Type"
          value={formData.polishType}
          onChangeText={(text) => handleChange("polishType", text)}
          placeholder="Enter polish type"
        />

        <FormField
          label="Quantity"
          value={formData.quantity}
          onChangeText={(text) => handleChange("quantity", text)}
          placeholder="Enter quantity"
          keyboardType="numeric"
        />

        <FormField
          label="Packing Option"
          value={formData.packingOption}
          onChangeText={(text) => handleChange("packingOption", text)}
          placeholder="Enter packing option"
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
            <Picker.Item label="ODS" value="ODS" />
          </Picker>
        </View>

        <FormField
          label="Rate (₹) *"
          value={formData.rate}
          onChangeText={(text) => handleChange("rate", text)}
          placeholder="Enter rate per unit"
          keyboardType="decimal-pad"
        />

        {/* Button Image Upload */}
        <TouchableOpacity style={styles.fileButton} onPress={() => pickImage(setButtonImage)}>
          <Text style={styles.fileButtonText}>Choose Button Image</Text>
        </TouchableOpacity>
        {buttonImage && (
          <Image source={{ uri: buttonImage.uri }} style={{ width: 100, height: 100 }} />
        )}

        {/* Dispatch Date */}
        <View>
          <Text style={styles.label}>Dispatch Date</Text>
          <TouchableOpacity style={styles.dateInput} onPress={() => setShowDispatchPicker(true)}>
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
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Create Order</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginHorizontal: 15,
  },
  section: {
    padding: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1F2937",
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  picker: {
    height: 50,
    color: "#1F2937",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3B82F6",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 12,
  },
  dateText: {
    color: "#1F2937",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 20,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 40,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tokenContainer: {
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  tokenTitle: {
    fontWeight: "bold",
    color: "#2563EB",
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 14,
    color: "#2563EB",
  },
  fileButton: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 10,
  },
  fileButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
