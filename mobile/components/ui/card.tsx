import React from 'react';
import { View, Pressable, type ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
}

export function Card({ children, onPress, style, padding = Spacing.lg }: CardProps) {
  const inner = (
    <View
      style={[
        {
          backgroundColor: Colors.white,
          borderRadius: Radius.lg,
          borderCurve: 'continuous' as const,
          padding,
          ...Shadow.card,
        } as any,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}
