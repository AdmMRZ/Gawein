import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  secondary: { bg: Colors.red, text: Colors.textInverse },
  outline: { bg: 'transparent', text: Colors.navy, border: Colors.navy },
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
  const v = variantStyles[variant];
  const s = sizeStyles[size];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 300 }); }}
      disabled={disabled || loading}
      style={[
        animStyle,
        {
          height: s.h,
          paddingHorizontal: s.px,
          backgroundColor: disabled ? Colors.grayLight : v.bg,
          borderRadius: Radius.md,
          borderCurve: 'continuous' as const,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          borderWidth: v.border ? 1.5 : 0,
          borderColor: v.border || 'transparent',
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        } as any,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontSize: s.fontSize,
              fontWeight: FontWeight.semibold,
              color: disabled ? Colors.grayMed : v.text,
              letterSpacing: -0.2,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
}
