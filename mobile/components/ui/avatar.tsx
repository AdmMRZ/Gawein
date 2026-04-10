import React from 'react';
import { View, Text } from 'react-native';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  backgroundColor?: string;
}

export function Avatar({ name, size = 44, backgroundColor = Colors.navyLight }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.38,
          fontWeight: FontWeight.bold,
          color: Colors.textInverse,
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
