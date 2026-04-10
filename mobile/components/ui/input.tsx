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
    <View style={{ gap: Spacing.xs }}>
      {label && (
        <Text
          style={{
            fontSize: FontSize.sm,
            fontWeight: FontWeight.medium,
            color: Colors.textSecondary,
            letterSpacing: -0.1,
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
            height: 48,
            paddingHorizontal: Spacing.lg,
            backgroundColor: Colors.white,
            borderRadius: Radius.md,
            borderCurve: 'continuous' as const,
            borderWidth: 1.5,
            borderColor: error
              ? Colors.error
              : isFocused
                ? Colors.navy
                : Colors.grayLight,
            fontSize: FontSize.md,
            color: Colors.textPrimary,
            letterSpacing: -0.1,
          },
          style,
        ] as any}
        {...props}
      />
      {error && (
        <Text style={{ fontSize: FontSize.xs, color: Colors.error }}>
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
