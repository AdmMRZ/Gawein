import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

export default function ClientLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.navy,
        tabBarInactiveTintColor: Colors.grayMed,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.grayLight,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: FontSize.xs,
          fontWeight: FontWeight.medium,
        },
        headerStyle: { backgroundColor: Colors.cream },
        headerTitleStyle: {
          fontWeight: FontWeight.semibold,
          color: Colors.textPrimary,
          letterSpacing: -0.3,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Cari',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
