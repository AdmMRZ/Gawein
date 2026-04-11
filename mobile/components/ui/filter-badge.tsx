import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, FontSize, FontWeight } from '@/constants/theme';

interface FilterBadgeProps {
  label?: string;
  value?: string;
  onRemove?: () => void;
  variant?: 'default' | 'pill';
  style?: any;
}

export function FilterBadge({ label, value, onRemove, variant = 'default', style }: FilterBadgeProps) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.slate900,
          borderWidth: 1,
          borderColor: Colors.grayMed,
          borderRadius: variant === 'pill' ? Radius.pill : Radius.sm,
          paddingVertical: 6,
          paddingLeft: 12,
          paddingRight: onRemove ? 6 : 12,
          gap: 8,
        },
        style
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {label && (
          <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium }}>
            {label}
          </Text>
        )}
        {label && value && (
          <View style={{ width: 1, height: 12, backgroundColor: Colors.grayMed }} />
        )}
        {value && (
          <Text style={{ fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.semibold }}>
            {value}
          </Text>
        )}
      </View>
      
      {onRemove && (
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.grayMed : 'transparent',
            borderRadius: Radius.pill,
            padding: 2,
            marginLeft: 2,
          })}
        >
          <Ionicons name="close" size={14} color={Colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}
