import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.navy, text: Colors.textInverse },
  secondary: { bg: Colors.gold, text: Colors.textPrimary },
  outline: { bg: 'transparent', text: Colors.navy, border: Colors.navyLight },
  ghost: { bg: 'transparent', text: Colors.textSecondary },
  danger: { bg: Colors.error, text: Colors.textInverse },
};

const sizeStyles: Record<ButtonSize, { h: number; px: number; fontSize: number }> = {
  sm: { h: 36, px: Spacing.md, fontSize: FontSize.sm },
  md: { h: 48, px: Spacing.xl, fontSize: FontSize.md },
  lg: { h: 56, px: Spacing.xxl, fontSize: FontSize.lg },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
        opacity.value = withSpring(0.8, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 400 });
        opacity.value = withSpring(1, { damping: 20, stiffness: 400 });
      }}
      disabled={disabled || loading}
      style={{ alignSelf: fullWidth ? 'stretch' : 'auto' }}
    >
      <Animated.View
        style={[
          animStyle,
          {
            height: s.h,
            paddingHorizontal: s.px,
            backgroundColor: disabled ? Colors.grayLight : v.bg,
            borderRadius: Radius.xl, // Pill-like curvy buttons
            borderCurve: 'continuous' as const,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            borderWidth: v.border ? 1.5 : 0,
            borderColor: v.border || 'transparent',
            shadowColor: variant === 'primary' && !disabled ? Colors.navy : 'transparent',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4, // Higher opacity for neon glow
            shadowRadius: 16,
            elevation: variant === 'primary' && !disabled ? 8 : 0,
          } as any,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={disabled ? Colors.grayMed : v.text} />
        ) : (
          <>
            {icon}
            <Text
              style={{
                fontSize: s.fontSize,
                fontWeight: FontWeight.bold, // Bolder button text!
                color: disabled ? Colors.grayMed : v.text,
                letterSpacing: 0.2, // Spread out a bit for modern feeling
              }}
            >
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}
