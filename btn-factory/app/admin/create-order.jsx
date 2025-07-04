import React, { useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/api";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

export default function CreateOrderScreen() {
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
      console.error("Document picker error:", error);
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
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
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

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
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
          data.append(key, formData.otherCasting);
        } else if (value && key !== "otherCasting") {
          data.append(key, value);
        }
      });

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const responseData = await response.json();

      if (response.ok) {
        setCreatedToken(responseData.token); // Display token on screen
        resetForm();
      } else {
        throw new Error(responseData.message || "Failed to create order");
      }
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Create New Order</Text>

      {createdToken && (
        <View style={styles.tokenContainer}>
          <Text style={styles.tokenTitle}>Order Created Successfully</Text>
          <Text style={styles.tokenText}>Token: {createdToken}</Text>
        </View>
      )}

      {/* Company Details Section */}
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

        <View style={styles.uploadContainer}>
          <Text style={styles.label}>P.O. Document/Image</Text>
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={[styles.uploadButton, styles.uploadButtonLeft]}
              onPress={pickDocument}
            >
              <MaterialIcons name="insert-drive-file" size={18} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload File</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadButton, styles.uploadButtonRight]}
              onPress={pickImage}
            >
              <MaterialIcons name="image" size={18} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </TouchableOpacity>
          </View>
          {formData.poImage && (
            <Text style={styles.fileName}>
              {formData.poImage.name || "Selected file"}
            </Text>
          )}
        </View>
      </View>

      {/* Product Details Section */}
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
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Create Order</Text>
        )}
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
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  tokenContainer: {
    backgroundColor: "#e8f8f5",
    padding: 16,
    borderRadius: 10,
    borderColor: "#2ecc71",
    borderWidth: 1,
    marginBottom: 20,
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2ecc71",
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 15,
    color: "#1e8449",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#34495e",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  prefix: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#555",
  },
  input: {
    flex: 1,
    padding: Platform.OS === "ios" ? 14 : 12,
    fontSize: 14,
    color: "#333",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 14 : 12,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: "#333",
  },
  uploadContainer: {
    marginBottom: 16,
  },
  uploadButtons: {
    flexDirection: "row",
    marginBottom: 8,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  uploadButtonLeft: {
    backgroundColor: "#3498db",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    marginRight: 1,
  },
  uploadButtonRight: {
    backgroundColor: "#2ecc71",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  fileName: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioCircle: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#3498db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3498db",
  },
  radioText: {
    fontSize: 14,
    color: "#2c3e50",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "ios" ? 140 : 50,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
