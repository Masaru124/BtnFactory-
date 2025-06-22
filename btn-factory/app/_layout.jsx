import { Slot } from 'expo-router';
import AuthProvider from './contexts/AuthContext';
import { StatusBar } from "expo-status-bar";
import SafeScreen from "../components/SafeScreen";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeScreen>
        <Slot />
      </SafeScreen>
      <StatusBar style="dark" />
    </AuthProvider>
  );
}


