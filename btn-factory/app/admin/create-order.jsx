// imports
import React, { useState, useContext, ImagePicker } from "react";
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
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
// import * as ImagePicker from "expo-image-picker";
// import * as DocumentPicker from "expo-document-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../constants/api";
import BackButton from "../../components/BackButton";

export default function CreateOrderScreen() {
  const { userToken } = useContext(AuthContext);
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
    linings: "",
    laser: "",
    polishType: "",
    quantity: "",
    packingOption: "",
    buttonImage: null,
    dispatchDate: null,
  });

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDispatchPicker, setShowDispatchPicker] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("poDate", selectedDate);
    }
  };

  const handleDispatchDateChange = (event, selectedDate) => {
    setShowDispatchPicker(Platform.OS === "ios");
    if (selectedDate) {
      handleChange("dispatchDate", selectedDate);
    }
  };

  const pickImage = async (field) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera roll permission is required to pick images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.Images],
      allowsEditing: true,
      quality: 1,
    });

if (!result.canceled && result.assets?.length > 0) {
  const asset = result.assets[0];
  handleChange(field, {
    uri: asset.uri,
    name: asset.fileName || `${field}.jpg`,
    type: asset.type || "image/jpeg",
  });
}
  };

  const handleSubmit = async () => {
    const {
      companyName,
      poNumber,
      poDate,
      casting,
      thickness,
      holes,
      boxType,
      rate,
    } = formData;

    if (
      !companyName ||
      !poNumber ||
      !poDate ||
      !casting ||
      !thickness ||
      !holes ||
      !boxType ||
      !rate
    ) {
      Alert.alert("Required Fields", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (!value || key === "otherCasting") return;

        if (key === "poDate" || key === "dispatchDate") {
          data.append(key, value.toISOString().split("T")[0]);
        } else if ((key === "poImage" || key === "buttonImage") && value?.uri) {
          data.append(key, {
            uri: value.uri,
            name: value.name,
            type: value.type || "application/octet-stream",
          });
        } else if (key === "casting" && value === "Other") {
          data.append(key, formData.otherCasting);
        } else {
          data.append(key, value);
        }
      });

      // ✅ Log FormData content (for debugging)
      for (let pair of data.entries()) {
        console.log(pair[0], pair[1]);
      }

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`, // ✅ Don't set 'Content-Type' manually
        },
        body: data,
      });

      if (response.ok) {
        const responseData = await response.json();
        setCreatedToken(responseData.token);
        resetForm();
      } else {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error("Failed to create order. Server returned error.");
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
      linings: "",
      laser: "",
      polishType: "",
      quantity: "",
      packingOption: "",
      buttonImage: null,
      dispatchDate: null,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
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
      </View>

      {/* File Upload Section */}
      <View style={styles.uploadContainer}>
       <Text style={styles.label}>Upload PO Image</Text>
       <TouchableOpacity
       style={styles.uploadButton}
       onPress={() => pickImage("poImage")}>
       <Feather name="upload" size={18} color="#fff" style={styles.uploadButtonLeft} />
       <Text style={styles.uploadButtonText}>Choose File</Text>
      </TouchableOpacity>
      {formData.poImage?.uri && <Text style={styles.fileName}>{formData.poImage.name}</Text>}
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
                {formData.casting === option && (
                  <View style={styles.selectedRb} />
                )}
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

        {/* Button Image Upload */}

        <View style={styles.uploadContainer}>
          <Text style={styles.label}>Upload Button Image</Text>
          <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage("buttonImage")}
          >
          <Feather name="upload" size={18} color="#fff" style={styles.uploadButtonLeft} />
          <Text style={styles.uploadButtonText}>Choose File</Text>
          </TouchableOpacity>
          {formData.buttonImage?.uri && <Text style={styles.fileName}>{formData.buttonImage.name}</Text>}
          </View>
          
        {/* Dispatch Date */}
        <View>
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

const FormField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  prefix,
}) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      {prefix && <Text style={styles.prefix}>{prefix}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#aaa"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffffff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  section: {
    backgroundColor: "#fff",
    padding: 1,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
  inputWrapper: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 1,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 14,
    color: "#111827",
  },
  prefix: {
    marginRight: 6,
    fontSize: 14,
    color: "#6B7280",
  },
  pickerContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 1,
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
    borderRadius: 1,
    marginBottom: 12,
  },
  dateText: {
    color: "#1F2937",
    fontSize: 14,
  },
  uploadContainer: {
    marginVertical: 12,
  },
  uploadButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB", // blue
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  uploadButtonLeft: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
  fileName: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 1,
    alignItems: "center",
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  tokenContainer: {
    backgroundColor: "#DBEAFE", // light blue
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
});
