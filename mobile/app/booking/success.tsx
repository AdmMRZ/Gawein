import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Platform, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, Radius } from '@/constants/theme';

// ── Confetti Particle ──────────────────────────────────────
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

// ── Confetti Burst ─────────────────────────────────────────
const CONFETTI_COLORS = ['#F59E0B', '#6366F1', '#10B981', '#EF4444', '#38BDF8', '#EC4899', '#FCD34D'];

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

// ── Main Screen ────────────────────────────────────────────
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
    <View style={{ flex: 1, backgroundColor: Colors.cream }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Content */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl }}>

        {/* Confetti Effect */}
        <View style={{ position: 'absolute', top: '15%', alignSelf: 'center' }}>
          <ConfettiBurst width={320} />
        </View>

        {/* Animated Card */}
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: Colors.slate900,
            borderRadius: Radius.xl * 1.5,
            padding: Spacing.xl,
            alignItems: 'center',
            gap: Spacing.lg,
            borderWidth: 1, borderColor: Colors.grayLight,
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Icon */}
          <View style={{
            width: 100, height: 100,
            borderRadius: 50,
            backgroundColor: Colors.successSoft,
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 52 }}>🎉</Text>
          </View>

          {/* Title */}
          <Text style={{
            fontSize: FontSize.xl,
            fontWeight: FontWeight.bold,
            color: Colors.textPrimary,
            textAlign: 'center',
            lineHeight: 28,
          }}>
            Selamat! Proses rekrut penyedia jasa Anda telah berhasil.
          </Text>

          {/* Description */}
          <Text style={{
            fontSize: FontSize.sm,
            color: Colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            Terima kasih telah mempercayakan kebutuhan layanan Anda kepada Gawein. Kami berharap dapat membantu Anda dalam rekrutmen selanjutnya.
          </Text>

          {/* Hiring ID chip */}
          {hiringId && (
            <View style={{
              backgroundColor: Colors.primary + '20',
              borderRadius: Radius.pill,
              paddingHorizontal: Spacing.md,
              paddingVertical: 6,
              borderWidth: 1, borderColor: Colors.primary + '40',
            }}>
              <Text style={{ fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold }}>
                ID Pesanan #{hiringId}
              </Text>
            </View>
          )}

          {/* CTA Button */}
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: Colors.warning,
              borderRadius: Radius.xl,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              marginTop: Spacing.sm,
            })}
          >
            <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#1a1a1a' }}>
              Selesai
            </Text>
          </Pressable>

          {/* View History Link */}
          <Pressable onPress={() => router.replace('/(client)/history')}>
            <Text style={{ fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium }}>
              Lihat Riwayat Pesanan →
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
