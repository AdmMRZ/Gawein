import React from 'react';
import { View, ActivityIndicator, Image, Text } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

const BLUE = '#315BE8';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Memuat...' }: LoadingScreenProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
      }}
    >
      <Image
        source={require('../../assets/images/landing_logo.png')}
        style={{ width: 120, height: 120, resizeMode: 'contain' }}
      />
      <ActivityIndicator size="small" color={BLUE} />
      <Text
        style={{
          fontSize: FontSize.sm,
          color: BLUE,
          fontWeight: FontWeight.medium,
        }}
      >
        {message}
      </Text>
    </View>
  );
}

// ── Skeleton Loader ──────────────────────────────────────

export function SkeletonCard() {
  return (
    <View
      style={{
        backgroundColor: Colors.white,
        borderRadius: 16,
        borderCurve: 'continuous' as const,
        padding: Spacing.lg,
        gap: Spacing.md,
        boxShadow: '0 2px 8px rgba(27, 42, 74, 0.06)',
      } as any}
    >
      <View style={{ flexDirection: 'row', gap: Spacing.md, alignItems: 'center' }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.grayLight }} />
        <View style={{ flex: 1, gap: Spacing.xs }}>
          <View style={{ width: '60%', height: 14, borderRadius: 4, backgroundColor: Colors.grayLight }} />
          <View style={{ width: '40%', height: 12, borderRadius: 4, backgroundColor: Colors.grayLight }} />
        </View>
      </View>
      <View style={{ height: 12, borderRadius: 4, backgroundColor: Colors.grayLight }} />
      <View style={{ width: '80%', height: 12, borderRadius: 4, backgroundColor: Colors.grayLight }} />
    </View>
  );
}
