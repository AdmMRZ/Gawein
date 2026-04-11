import React, { useState } from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({ label, error, helper, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={{ gap: Spacing.sm }}>
      {label && (
        <Text
          style={{
            fontSize: FontSize.sm,
            fontWeight: FontWeight.medium,
            color: Colors.textPrimary,
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        placeholderTextColor={Colors.textMuted}
        style={[
          {
            height: 56, // Modern slightly taller inputs
            paddingHorizontal: Spacing.lg,
            backgroundColor: Colors.white, // The dark card color
            borderRadius: Radius.lg, // Match our new design system
            borderCurve: 'continuous' as const,
            borderWidth: 1.5, // Slightly bolder borders
            borderColor: error
              ? Colors.error
              : isFocused
                ? Colors.navy // Neon purple glow!
                : Colors.grayLight,
            fontSize: FontSize.md,
            color: Colors.textPrimary,
            letterSpacing: 0,
            shadowColor: isFocused ? (error ? Colors.error : Colors.navy) : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isFocused ? 0.3 : 0, // Neon input glow
            shadowRadius: 10, // Larger soft blur
            elevation: isFocused ? 4 : 0,
          },
          style,
        ] as any}
        {...props}
      />
      {error && (
        <Text style={{ fontSize: FontSize.xs, color: Colors.errorLight || Colors.error, fontWeight: FontWeight.medium }}>
          {error}
        </Text>
      )}
      {helper && !error && (
        <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted }}>
          {helper}
        </Text>
      )}
    </View>
  );
}
