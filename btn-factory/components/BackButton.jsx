import { TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons"; 

const BackButton = ({ color = "#333", size = 28 }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.button}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Ionicons name="chevron-back" size={size} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#ffffffff",
    margin: 0,
    marginLeft: 0,
    padding: 0,
  },
});

export default BackButton;
