import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontWeight } from '@/constants/theme';

// ── Constants ──────────────────────────────────────────────
const BLUE = '#315BE8';
const GOLD = '#FFD45A';

// ── Confetti Particle ──────────────────────────────────────
function ConfettiParticle({
  x,
  color,
  delay,
  size,
  shape,
}: {
  x: number;
  color: string;
  delay: number;
  size: number;
  shape: 'circle' | 'rect';
}) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const rotate     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 80;
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 220,
          duration: 1800,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.timing(translateX, { toValue: drift, duration: 1800, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 500, delay: 900, useNativeDriver: true }),
        ]),
        Animated.timing(rotate, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: size,
        height: shape === 'rect' ? size * 0.5 : size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? size / 2 : 2,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
        opacity,
      }}
    />
  );
}

// ── Confetti Burst ─────────────────────────────────────────
const CONFETTI_COLORS = [
  '#FFD45A', '#315BE8', '#10B981', '#EF4444',
  '#38BDF8', '#EC4899', '#F59E0B', '#A78BFA',
];

function ConfettiBurst({ width = 320 }: { width?: number }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 700,
    size: 6 + Math.random() * 9,
    shape: (Math.random() > 0.5 ? 'circle' : 'rect') as 'circle' | 'rect',
  }));

  return (
    <View
      style={{ width, height: 220, position: 'absolute', top: 0, overflow: 'hidden' }}
      pointerEvents="none"
    >
      {particles.map((p) => (
        <ConfettiParticle
          key={p.id}
          x={p.x}
          color={p.color}
          delay={p.delay}
          size={p.size}
          shape={p.shape}
        />
      ))}
    </View>
  );
}

// ── Info Row ───────────────────────────────────────────────
function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
      <Ionicons name={icon as any} size={18} color={BLUE} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontSize: 13, color: '#555', lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────
export default function BookingSuccessScreen() {
  const { hiringId } = useLocalSearchParams<{ hiringId: string }>();
  const router = useRouter();

  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const emojiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 10,
          stiffness: 90,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(emojiAnim, {
        toValue: 1,
        damping: 8,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Blue Header ── */}
      <View style={{
        backgroundColor: BLUE,
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 24,
        paddingHorizontal: 20,
        alignItems: 'center',
      }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: FontWeight.bold }}>
          Rekrut
        </Text>
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>

        {/* Confetti floats above the card */}
        <View style={{ position: 'absolute', top: '5%', alignSelf: 'center' }}>
          <ConfettiBurst width={340} />
        </View>

        {/* Animated Card */}
        <Animated.View
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: 20,
            padding: 28,
            alignItems: 'center',
            gap: 16,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
            shadowColor: BLUE,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Emoji Icon */}
          <Animated.View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: '#EFF6FF',
              justifyContent: 'center',
              alignItems: 'center',
              transform: [{ scale: emojiAnim }],
            }}
          >
            <Text style={{ fontSize: 52 }}>🎉</Text>
          </Animated.View>

          {/* Title */}
          <Text style={{
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: '#111',
            textAlign: 'center',
            lineHeight: 28,
          }}>
            Permintaan Jasa{'\n'}Berhasil Dikirim!
          </Text>

          {/* Divider */}
          <View style={{ width: '100%', height: 1, backgroundColor: '#F0F0F0' }} />

          {/* Info rows */}
          <View style={{ width: '100%', gap: 10 }}>
            <InfoRow
              icon="checkmark-circle-outline"
              text="Terima kasih! Permintaan rekrutmu telah diterima oleh sistem Gawein."
            />
            <InfoRow
              icon="time-outline"
              text="Tunggu konfirmasi dari provider. Mereka akan segera merespons pesananmu."
            />
            <InfoRow
              icon="chatbubble-ellipses-outline"
              text="Pantau status pesanan melalui menu Pesanan atau riwayat di halaman Akun."
            />
          </View>

          {/* Order ID chip */}
          {!!hiringId && (
            <View style={{
              backgroundColor: BLUE + '15',
              borderRadius: 999,
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: BLUE + '30',
            }}>
              <Text style={{ fontSize: 12, color: BLUE, fontWeight: FontWeight.semibold }}>
                ID Pesanan #{hiringId}
              </Text>
            </View>
          )}

          {/* Primary CTA */}
          <Pressable
            onPress={() => router.replace('/(client)')}
            style={({ pressed }) => ({
              width: '100%',
              backgroundColor: GOLD,
              borderRadius: 40,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: FontWeight.bold, color: '#111' }}>
              Kembali ke Beranda
            </Text>
          </Pressable>

          {/* Secondary link */}
          <Pressable onPress={() => router.replace('/(client)/history' as any)}>
            <Text style={{ fontSize: 13, color: BLUE, fontWeight: FontWeight.medium }}>
              Lihat Riwayat Pesanan →
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
