import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors } from '@/constants/theme';

function RootNavigation() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuth) {
      // Route based on role
      if (user?.role === 'provider') {
        router.replace('/(provider)');
      } else if (user?.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(client)');
      }
    }
  }, [isAuthenticated, isLoading, segments, user]);

  if (isLoading) {
    return <LoadingScreen message="Menyiapkan GaweIn..." />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.cream },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(provider)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen
          name="provider/[id]"
          options={{
            headerShown: true,
            title: 'Detail Penyedia',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
        <Stack.Screen
          name="booking/[id]"
          options={{
            headerShown: false,
            title: 'Detail Pesanan',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
        <Stack.Screen
          name="booking/payment"
          options={{
            headerShown: false,
            title: 'Pembayaran',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
        <Stack.Screen
          name="booking/success"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="hiring/[id]"
          options={{
            headerShown: true,
            title: 'Detail Hiring',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
        <Stack.Screen
          name="history/[id]"
          options={{
            headerShown: true,
            title: 'Detail Riwayat',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
        <Stack.Screen
          name="review/[hiringId]"
          options={{
            headerShown: true,
            title: 'Tulis Review',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="service/create"
          options={{
            headerShown: true,
            title: 'Buat Layanan Baru',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
        <Stack.Screen
          name="service/[id]"
          options={{
            headerShown: true,
            title: 'Edit Layanan',
            headerBackButtonDisplayMode: 'minimal',
            headerTintColor: Colors.textPrimary,
            headerStyle: { backgroundColor: Colors.cream },
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
