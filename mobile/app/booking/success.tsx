import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

const PAGE_BG = '#F8FAFF';
const SUCCESS_SOFT = '#EAF8F2';
const CONFETTI_COLORS = ['#F59E0B', '#315BE8', '#10B981', '#EF4444', '#38BDF8', '#EC4899', '#FCD34D'];

function ConfettiParticle({
  x,
  color,
  delay,
  size,
}: {
  x: number;
  color: string;
  delay: number;
  size: number;
}) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 60;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, { toValue: 200, duration: 1600, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.timing(translateX, { toValue: drift, duration: 1600, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 400, delay: 900, useNativeDriver: true }),
        ]),
        Animated.timing(rotate, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '540deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? size / 2 : 2,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
        opacity,
      }}
    />
  );
}

function ConfettiBurst({ width = 300 }: { width?: number }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 600,
    size: 6 + Math.random() * 8,
  }));

  return (
    <View style={{ width, height: 200, position: 'absolute', top: 0, overflow: 'hidden' }} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} x={p.x} color={p.color} delay={p.delay} size={p.size} />
      ))}
    </View>
  );
}

export default function BookingSuccessScreen() {
  const { hiringId } = useLocalSearchParams<{ hiringId: string }>();
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleDone = () => {
    router.replace('/(client)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAGE_BG }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>
        <View style={{ position: 'absolute', top: '15%', alignSelf: 'center' }}>
          <ConfettiBurst width={320} />
        </View>

        <Animated.View
          style={{
            width: '100%',
            backgroundColor: Colors.white,
            borderRadius: Radius.xl * 1.5,
            padding: Spacing.xl,
            alignItems: 'center',
            gap: Spacing.lg,
            borderWidth: 1,
            borderColor: '#E4EAFF',
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            shadowColor: Colors.navy,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: SUCCESS_SOFT,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="checkmark-circle-outline" size={58} color={Colors.success} />
          </View>

          <Text style={{
            fontSize: FontSize.xl,
            fontWeight: FontWeight.bold,
            color: Colors.textPrimary,
            textAlign: 'center',
            lineHeight: 28,
          }}>
            Selamat! Proses rekrut penyedia jasa Anda telah berhasil.
          </Text>

          <Text style={{
            fontSize: FontSize.sm,
            color: Colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Terima kasih telah mempercayakan kebutuhan layanan Anda kepada GaweIn. Kami berharap dapat membantu Anda dalam rekrutmen selanjutnya.
          </Text>

          {hiringId ? (
            <View style={{
              backgroundColor: Colors.navyLight,
              borderRadius: Radius.pill,
              paddingHorizontal: Spacing.md,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: '#C9D6FF',
            }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.navy, fontWeight: FontWeight.semibold }}>
                ID Pesanan #{hiringId}
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={handleDone}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: Colors.gold,
              borderRadius: Radius.xl,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              marginTop: Spacing.sm,
              borderWidth: 1,
              borderColor: '#E5B82F',
            })}
          >
            <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#1a1a1a' }}>
              Selesai
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace('/(client)/history')}>
            <Text style={{ fontSize: FontSize.sm, color: Colors.navy, fontWeight: FontWeight.medium }}>
              Lihat Riwayat Pesanan {'->'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
