import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

const BackButton = ({ label = "Back" }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.button}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="chevron-back" size={20} color="#000" />
      {/* <Text style={styles.label}>{label}</Text> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e7e7e7ff", // light gray bg (like shadcn secondary)
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9999, // full pill
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    marginLeft: 4,
  },
});

export default BackButton;
