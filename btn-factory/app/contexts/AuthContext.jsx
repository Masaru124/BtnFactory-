import React, { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null); // 👈 NEW
  const [userToken, setUserToken] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [userDepartments, setUserDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await SecureStore.getItemAsync("userToken");
        const roles = await SecureStore.getItemAsync("userRoles");
        const departments = await SecureStore.getItemAsync("userDepartments");
        const storedUser = await SecureStore.getItemAsync("user");

        setUserToken(token);
        setUserRoles(roles ? JSON.parse(roles) : []);
        setUserDepartments(departments ? JSON.parse(departments) : []);
        setUser(storedUser ? JSON.parse(storedUser) : null); // 👈 Load full user
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
      console.log("🔐 Login response:", data);

      if (!response.ok || !data.token) {
        throw new Error(data.message || "Login failed");
      }

      const rolesArray = data.roles || (data.role ? [data.role] : []);
      const departmentsArray = data.departments || [];

      const userObject = {
        username,
        token: data.token,
        roles: rolesArray,
        departments: departmentsArray,
      };

      console.log("✅ Roles:", rolesArray);
      console.log("✅ Departments:", departmentsArray);

      // Store everything
      await SecureStore.setItemAsync("userToken", data.token);
      await SecureStore.setItemAsync("userRoles", JSON.stringify(rolesArray));
      await SecureStore.setItemAsync("userDepartments", JSON.stringify(departmentsArray));
      await SecureStore.setItemAsync("user", JSON.stringify(userObject)); // 👈 Store full user

      // Set state
      setUserToken(data.token);
      setUserRoles(rolesArray);
      setUserDepartments(departmentsArray);
      setUser(userObject); // 👈 Set full user

      // Redirect
      if (rolesArray.includes("admin")) {
        router.replace("/admin");
      } else if (rolesArray.includes("staff")) {
        router.replace("/staff");
      } else {
        router.replace("/user");
      }

      return rolesArray;
    } catch (err) {
      console.error("❌ Login error:", err.message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userRoles");
      await SecureStore.deleteItemAsync("userDepartments");
      await SecureStore.deleteItemAsync("user"); // 👈 clear stored user
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

export default AuthProvider;
