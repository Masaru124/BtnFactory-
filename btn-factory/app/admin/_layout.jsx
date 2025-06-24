// FILE: app/admin/_layout.js
import { Slot } from 'expo-router';
import { View } from 'react-native';
import AdminHeader from './components/AdminHeader';
import AdminTabs from './components/AdminTabs';

export default function AdminLayout() {
  return (
    <View style={{ flex: 1 }}>
      <AdminHeader />
      <Slot />
      <AdminTabs />
    </View>
  );
}
