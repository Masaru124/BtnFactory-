import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
import RawMaterialDepartment from "./RawMaterialDepartment";
import CastingDepartment from "./CastingDepartment";
import PolishDepartment from "./PolishDepartment";
import TurningDepartment from "./TurningDepartment"; // ✅ NEW
import PackingDepartment from "./PackingDepartment"; // ✅ NEW
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

  // ---------- HANDLERS ----------
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
            materials: [
              {
                materialName: data.materialName,
                quantity: Number(data.quantity),
                totalPrice: Number(data.totalPrice),
              },
            ],
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
            Authorization: `Bearer ${authContext.userToken}`,
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

  const handleTurningSubmit = async (data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/turning-process/${data.token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.userToken}`,
          },
          body: JSON.stringify({
            itemsTurned: data.itemsTurned,
            wasteProduced: data.wasteProduced,
            startTime: data.startTime,
            endTime: data.endTime,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update turning process data");
      }
      setMessage("Turning process data updated successfully");
    } catch (error) {
      setMessage(error.message);
      console.error("❌ Turning Submit Error:", error);
    }
  };

  const handlePackingSubmit = async (data) => {
    try {
      const response = await fetch(
        `${API_URL}/api/staff/orders/packing-process/${data.token}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authContext.userToken}`,
          },
          body: JSON.stringify({
            packedItems: data.packedItems,
            packingDate: data.packingDate,
            startTime: data.startTime,
            endTime: data.endTime,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update packing process data");
      }
      setMessage("Packing process data updated successfully");
    } catch (error) {
      setMessage(error.message);
      console.error("❌ Packing Submit Error:", error);
    }
  };

  // ---------- RENDER ----------
  const renderDepartmentInterface = () => {
    const department = user?.departments?.[0];
    console.log("🔍 First department:", department);

    switch (department) {
      case "Raw Material":
        return <RawMaterialDepartment onSubmit={handleRawMaterialSubmit} />;
      case "Casting":
        return <CastingDepartment onSubmit={handleCastingSubmit} />;
      case "Polish":
        return <PolishDepartment onSubmit={handlePolishingSubmit} />;
      case "Turning": // ✅ NEW
        return <TurningDepartment onSubmit={handleTurningSubmit} />;
      case "Packing": // ✅ NEW
        return <PackingDepartment onSubmit={handlePackingSubmit} />;
      default:
        return
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
    // paddingHorizontal: 20,
  },
  message: {
    // marginVertical: 10,
    color: "green",
    textAlign: "center",
  },
});

export default StaffScreen;
