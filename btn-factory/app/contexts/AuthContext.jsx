import React, { createContext, useState, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../../constants/api";
import { useRouter } from "expo-router";

export const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
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

      // Store securely
      await SecureStore.setItemAsync("userToken", data.token);
      await SecureStore.setItemAsync("userRoles", JSON.stringify(rolesArray));
      await SecureStore.setItemAsync(
        "userDepartments",
        JSON.stringify(departmentsArray)
      );
      await SecureStore.setItemAsync("user", JSON.stringify(userObject));

      // Update state
      setUserToken(data.token);
      setUserRoles(rolesArray);
      setUserDepartments(departmentsArray);
      setUser(userObject);

      // Redirect based on role
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
      await SecureStore.deleteItemAsync("user");
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

// ✅ custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;

// import React, { createContext, useState, useEffect, useContext } from "react";
// import { API_URL } from "../../constants/api";
// import { useRouter } from "expo-router";

// export const AuthContext = createContext(undefined);

// const AuthProvider = ({ children }) => {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [userToken, setUserToken] = useState(null);
//   const [userRoles, setUserRoles] = useState([]);
//   const [userDepartments, setUserDepartments] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Helpers for localStorage
//   const storage = {
//     getItem: async (key) => {
//       try {
//         return localStorage.getItem(key);
//       } catch (e) {
//         console.error("Storage getItem error:", e);
//         return null;
//       }
//     },
//     setItem: async (key, value) => {
//       try {
//         localStorage.setItem(key, value);
//       } catch (e) {
//         console.error("Storage setItem error:", e);
//       }
//     },
//     deleteItem: async (key) => {
//       try {
//         localStorage.removeItem(key);
//       } catch (e) {
//         console.error("Storage deleteItem error:", e);
//       }
//     },
//   };

//   useEffect(() => {
//     const restoreSession = async () => {
//       try {
//         const token = await storage.getItem("userToken");
//         const roles = await storage.getItem("userRoles");
//         const departments = await storage.getItem("userDepartments");
//         const storedUser = await storage.getItem("user");

//         setUserToken(token);
//         setUserRoles(roles ? JSON.parse(roles) : []);
//         setUserDepartments(departments ? JSON.parse(departments) : []);
//         setUser(storedUser ? JSON.parse(storedUser) : null);
//       } catch (err) {
//         console.error("❌ Failed to restore session:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     restoreSession();
//   }, []);

//   const signIn = async ({ username, password }) => {
//     try {
//       const response = await fetch(`${API_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();
//       console.log("🔐 Login response:", data);

//       if (!response.ok || !data.token) {
//         throw new Error(data.message || "Login failed");
//       }

//       const rolesArray = data.roles || (data.role ? [data.role] : []);
//       const departmentsArray = data.departments || [];

//       const userObject = {
//         username,
//         token: data.token,
//         roles: rolesArray,
//         departments: departmentsArray,
//       };

//       console.log("✅ Roles:", rolesArray);
//       console.log("✅ Departments:", departmentsArray);

//       // Store everything
//       await storage.setItem("userToken", data.token);
//       await storage.setItem("userRoles", JSON.stringify(rolesArray));
//       await storage.setItem(
//         "userDepartments",
//         JSON.stringify(departmentsArray)
//       );
//       await storage.setItem("user", JSON.stringify(userObject));

//       // Set state
//       setUserToken(data.token);
//       setUserRoles(rolesArray);
//       setUserDepartments(departmentsArray);
//       setUser(userObject);

//       // Redirect
//       if (rolesArray.includes("admin")) {
//         router.replace("/admin");
//       } else if (rolesArray.includes("staff")) {
//         router.replace("/staff");
//       } else {
//         router.replace("/user");
//       }

//       return rolesArray;
//     } catch (err) {
//       console.error("❌ Login error:", err.message);
//       throw err;
//     }
//   };

//   const signOut = async () => {
//     try {
//       await storage.deleteItem("userToken");
//       await storage.deleteItem("userRoles");
//       await storage.deleteItem("userDepartments");
//       await storage.deleteItem("user");
//     } catch (err) {
//       console.error("❌ Logout error:", err);
//     } finally {
//       setUserToken(null);
//       setUserRoles([]);
//       setUserDepartments([]);
//       setUser(null);
//       router.replace("/");
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         userToken,
//         userRoles,
//         userDepartments,
//         isLoading,
//         signIn,
//         signOut,
//         isAdmin: userRoles.includes("admin"),
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// // ✅ custom hook
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };

// export default AuthProvider;
