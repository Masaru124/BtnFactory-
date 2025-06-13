import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  userToken: string | null;
  userRole: string | null;
  isLoading: boolean;
  signIn: (data: { username: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        setUserToken(token);
        setUserRole(role);
      } catch (e) {
        // Restoring token failed
      }
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  const signIn = async ({ username, password }: { username: string; password: string }) => {
    console.log('signIn called with:', { username, password });
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userRole', data.role);
      setUserToken(data.token);
      setUserRole(data.role);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userRole');
    setUserToken(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
