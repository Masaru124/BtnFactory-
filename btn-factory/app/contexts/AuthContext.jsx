import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";
const router = useRouter();
export const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [userDepartments, setUserDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const roles = await AsyncStorage.getItem("userRoles");
        const departments = await AsyncStorage.getItem("userDepartments");

        setUserToken(token);
        setUserRoles(roles ? JSON.parse(roles) : []);
        setUserDepartments(departments ? JSON.parse(departments) : []);
      } catch (e) {
        console.error("❌ Failed to restore user session:", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Sign in
  const signIn = async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error("Unexpected server response format");
      }

      const data = await response.json();

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Login failed");
      }

      const rolesArray = data.roles || (data.role ? [data.role] : []);
      const departmentsArray = data.departments || [];

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userRoles", JSON.stringify(rolesArray));
      await AsyncStorage.setItem(
        "userDepartments",
        JSON.stringify(departmentsArray)
      );

      setUserToken(data.token);
      setUserRoles(rolesArray);
      setUserDepartments(departmentsArray);

      return rolesArray;
    } catch (err) {
      console.error("❌ Login error:", err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userToken",
        "userRoles",
        "userDepartments",
      ]);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUserToken(null);
      setUserRoles([]);
      setUserDepartments([]);
      router.replace("/"); // 👈 or wherever your login screen is
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        userRoles,
        userDepartments,
        isLoading,
        signIn,
        signOut,
        isAdmin: userRoles.includes("admin"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
