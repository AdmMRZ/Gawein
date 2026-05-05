import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback } from 'react';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Colors } from '@/constants/theme';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  DMSans_700Bold_Italic,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

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
      if (user?.role === 'provider') {
        router.replace('/(provider)');
      } else {
        router.replace('/(client)');
      }
    } else if (isAuthenticated && segments[0] === '(provider)' && user?.role !== 'provider') {
      router.replace('/(client)');
    } else if (isAuthenticated && segments[0] === '(client)' && user?.role === 'provider') {
      router.replace('/(provider)');
    }
  }, [isAuthenticated, isLoading, router, segments, user]);

  if (isLoading) {
    return <LoadingScreen message="Menyiapkan GaweIn..." />;
  }

  const inAuth = segments[0] === '(auth)';
  if (!isAuthenticated && !inAuth) {
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
          name="messages/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
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
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'DMSans-BoldItalic': DMSans_700Bold_Italic,
  });

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
