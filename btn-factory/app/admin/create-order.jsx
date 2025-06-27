import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/api";

export default function CreateOrderScreen() {
  const [companyName, setCompanyName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [poImage, setPoImage] = useState(null);
  const [casting, setCasting] = useState("Rod");
  const [otherCasting, setOtherCasting] = useState("");
  const [thickness, setThickness] = useState("");
  const [holes, setHoles] = useState("");
  const [boxType, setBoxType] = useState("DD");
  const [rate, setRate] = useState("");
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });
    if (result.type === "success") {
      setPoImage(result);
    }
  };

  const handleSubmit = async () => {
    if (!companyName || !poNumber || !poDate || !casting || !thickness || !holes || !boxType || !rate) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("poNumber", poNumber);
      formData.append("poDate", poDate);
      if (poImage) {
        formData.append("poImage", {
          uri: poImage.uri,
          name: poImage.name || "poImage",
          type: "application/octet-stream",
        });
      }
      formData.append("casting", casting === "Other" ? otherCasting : casting);
      formData.append("thickness", thickness);
      formData.append("holes", holes);
      formData.append("boxType", boxType);
      formData.append("rate", rate);

      const response = await fetch(`${API_URL}/api/admin/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Order created successfully");
        // Reset form
        setCompanyName("");
        setPoNumber("");
        setPoDate("");
        setPoImage(null);
        setCasting("Rod");
        setOtherCasting("");
        setThickness("");
        setHoles("");
        setBoxType("DD");
        setRate("");
      } else {
        Alert.alert("Error", data.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Create order error:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create New Order</Text>
      <Text style={styles.subHeader}>Company details</Text>

      <Text style={styles.label}>COMPANY/CUSTOMER NAME</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={companyName}
        onChangeText={setCompanyName}
      />

      <Text style={styles.label}>P.O. NUMBER :</Text>
      <TextInput
        style={styles.input}
        placeholder="PO Number"
        value={poNumber}
        onChangeText={setPoNumber}
      />

      <Text style={styles.label}>P.O. DATE :</Text>
      <TextInput
        style={styles.input}
        placeholder="PO Date (YYYY-MM-DD)"
        value={poDate}
        onChangeText={setPoDate}
      />

      <Text style={styles.label}>P.O. IMAGE :</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.uploadButtonText}>
          {poImage ? poImage.name : "Upload file"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.subHeader}>CASTING</Text>
      <View style={styles.radioGroup}>
        {["Rod", "Sheet", "Other"].map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.radioButton}
            onPress={() => setCasting(option)}
          >
            <View style={styles.radioCircle}>
              {casting === option && <View style={styles.selectedRb} />}
            </View>
            <Text style={styles.radioText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {casting === "Other" && (
        <TextInput
          style={styles.input}
          placeholder="Other"
          value={otherCasting}
          onChangeText={setOtherCasting}
        />
      )}

      <Text style={styles.label}>THICKNESS:</Text>
      <TextInput
        style={styles.input}
        placeholder="Thickness"
        value={thickness}
        onChangeText={setThickness}
      />

      <Text style={styles.label}>HOLES :</Text>
      <TextInput
        style={styles.input}
        placeholder="Holes"
        value={holes}
        onChangeText={setHoles}
      />

      <Text style={styles.label}>BOX TYPE:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={boxType}
          onValueChange={(itemValue) => setBoxType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="DD" value="DD" />
          <Picker.Item label="SD" value="SD" />
        </Picker>
      </View>

      <Text style={styles.label}>RATE:</Text>
      <TextInput
        style={styles.input}
        placeholder="Rate"
        value={rate}
        onChangeText={setRate}
        keyboardType="numeric"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#4B46F6" />
      ) : (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Order</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6B6BDB",
    textAlign: "center",
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#555",
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#6B6BDB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#6B6BDB",
  },
  radioText: {
    fontSize: 14,
    color: "#444",
  },
  pickerContainer: {
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginBottom: 15,
  },
  picker: {
    height: 40,
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#6B6BDB",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
