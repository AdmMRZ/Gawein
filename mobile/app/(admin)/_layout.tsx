import { Stack } from 'expo-router';
import { Colors, FontWeight } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.cream },
        headerTitleStyle: { fontWeight: FontWeight.semibold, color: Colors.textPrimary },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin Panel' }} />
    </Stack>
  );
}
