import React, { createContext, useState, useEffect, useContext } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";
import CryptoJS from "crypto-js"; // optional: for encrypted web storage

export const AuthContext = createContext(undefined);

const storage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        const value = localStorage.getItem(key);
        if (!value) return null;
        // decrypt for web
        return CryptoJS.AES.decrypt(value, "secret-key").toString(CryptoJS.enc.Utf8);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (err) {
      console.error("Storage getItem error:", err);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === "web") {
        const encrypted = CryptoJS.AES.encrypt(value, "secret-key").toString();
        localStorage.setItem(key, encrypted);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (err) {
      console.error("Storage setItem error:", err);
    }
  },
  removeItem: async (key) => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (err) {
      console.error("Storage removeItem error:", err);
    }
  },
};

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [userDepartments, setUserDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await storage.getItem("userToken");
        const roles = await storage.getItem("userRoles");
        const departments = await storage.getItem("userDepartments");
        const storedUser = await storage.getItem("user");

        setUserToken(token);
        setUserRoles(roles ? JSON.parse(roles) : []);
        setUserDepartments(departments ? JSON.parse(departments) : []);
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (err) {
        console.error("❌ Failed to restore session:", err);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signIn = async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || "Login failed");
      }

      const rolesArray = data.roles || (data.role ? [data.role] : []);
      const departmentsArray = data.departments || [];
      const userObject = { username, token: data.token, roles: rolesArray, departments: departmentsArray };

      // Store securely
      await storage.setItem("userToken", data.token);
      await storage.setItem("userRoles", JSON.stringify(rolesArray));
      await storage.setItem("userDepartments", JSON.stringify(departmentsArray));
      await storage.setItem("user", JSON.stringify(userObject));

      // Update state
      setUserToken(data.token);
      setUserRoles(rolesArray);
      setUserDepartments(departmentsArray);
      setUser(userObject);

      // Redirect based on role
      if (rolesArray.includes("admin")) router.replace("/admin");
      else if (rolesArray.includes("staff")) router.replace("/staff");
      else router.replace("/user");

      return rolesArray;
    } catch (err) {
      console.error("❌ Login error:", err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await storage.removeItem("userToken");
      await storage.removeItem("userRoles");
      await storage.removeItem("userDepartments");
      await storage.removeItem("user");
    } catch (err) {
      console.error("❌ Logout error:", err);
    } finally {
      setUserToken(null);
      setUserRoles([]);
      setUserDepartments([]);
      setUser(null);
      router.replace("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthProvider;
