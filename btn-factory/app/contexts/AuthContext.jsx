import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext(undefined);

const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userRoles, setUserRoles] = useState(null);
  const [userDepartments, setUserDepartments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const rolesString = await AsyncStorage.getItem('userRoles');
        const departmentsString = await AsyncStorage.getItem('userDepartments');
        setUserToken(token);
        setUserRoles(rolesString ? JSON.parse(rolesString) : null);
        setUserDepartments(departmentsString ? JSON.parse(departmentsString) : null);
      } catch (e) {
        // Restoring token failed
      }
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const signIn = async ({ username, password }) => {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    // Log the processed roles array instead of raw data.roles
    const rolesArray = data.roles || (data.role ? [data.role] : []);
    console.log('Processed login roles array:', rolesArray);
    if (response.ok) {
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userRoles', JSON.stringify(rolesArray));
      await AsyncStorage.setItem('userDepartments', JSON.stringify(data.departments));
      setUserToken(data.token);
      setUserRoles(rolesArray);
      setUserDepartments(data.departments);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRoles');
    await AsyncStorage.removeItem('userDepartments');
    setUserToken(null);
    setUserRoles(null);
    setUserDepartments(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userRoles, userDepartments, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
