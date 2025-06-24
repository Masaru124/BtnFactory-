import { View, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminTabs() {
  const router = useRouter();

  return (
    <View style={{ gap: 10 }}>
      <Button title="Add User" onPress={() => router.push('/admin/add-user')} />
      <Button title="Manage Users" onPress={() => router.push('/admin/manage-users')} />
    </View>
  );
}
