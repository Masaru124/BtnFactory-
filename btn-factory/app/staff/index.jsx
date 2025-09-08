import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import RawMaterialDepartment from "./RawMaterialDepartment";
import CastingDepartment from "./CastingDepartment";
import  PolishDepartment  from "./PolishDepartment";
import { API_URL } from "../../constants/api";
const StaffScreen = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { user } = authContext;
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("👤 User object:", user);
    if (user) {
      console.log("✅ Roles:", user.roles);
      console.log("✅ Departments:", user.departments);
    }
  }, [user]);

  const handleRawMaterialSubmit = async (data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/raw-material/${data.token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.userToken}`,
          },
          body: JSON.stringify({
            materials: [{
              materialName: data.materialName,
              quantity: Number(data.quantity),
              totalPrice: Number(data.totalPrice),
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API response error:", errorText);
        throw new Error("Failed to update raw material details");
      }

      setMessage("Raw material details updated successfully");
    } catch (error) {
      setMessage(error.message);
      console.error("❌ Raw Material Submit Error:", error);
    }
  };

  const handleCastingSubmit = async (data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/casting-process/${data.token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.userToken}`, // ✅ ADD THIS LINE
          },
          body: JSON.stringify({
            rawMaterialsUsed: data.rawMaterialsUsed,
            sheetsMade: data.sheetsMade,
            sheetsWasted: data.sheetsWasted,
            startTime: data.startTime,
            endTime: data.endTime,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update casting process data");
      }
      setMessage("Casting process data updated successfully");
    } catch (error) {
      setMessage(error.message);
      console.error("❌ Casting Submit Error:", error);
    }
  };

  const handlePolishingSubmit = async (data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/polish-process/${data.token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.userToken}`,
          },
          body: JSON.stringify({
            totalSheets: data.totalSheets,
            polishDate: data.polishDate,
            receivedDate: data.receivedDate,
            startTime: data.startTime,
            endTime: data.endTime,
            GrossWeight: data.GrossWeight,
            WtinKg: data.WtinKg,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update polish process data");
      }
      setMessage("Polishing process data updated successfully");
    } catch (error) {
      setMessage(error.message);
      console.error("❌ Polishing Submit Error:", error);
    }
  };

  const renderDepartmentInterface = () => {
    const department = user?.departments?.[0];
    console.log("🔍 First department:", department);

    switch (department) {
      case "Raw Material":
        console.log("✅ Rendering Raw Material Interface");
        return <RawMaterialDepartment onSubmit={handleRawMaterialSubmit} />;

      case "Casting":
        console.log("✅ Rendering Casting Interface");
        return <CastingDepartment onSubmit={handleCastingSubmit} />;

      case "Polish":
        console.log("Polishing Casting Interface");
        return <PolishDepartment onSubmit={handlePolishingSubmit} />;

      default:
        console.warn("⚠️ No matching department found:", department);
        return <Text>No interface available for your department.</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderDepartmentInterface()}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  message: {
    marginVertical: 10,
    color: "green",
    textAlign: "center",
  },
});

export default StaffScreen;
