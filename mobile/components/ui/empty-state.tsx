import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { Button } from './button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'document-text-outline',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.section,
        gap: Spacing.lg,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: Colors.grayLight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={32} color={Colors.grayMed} />
      </View>
      <Text
        style={{
          fontSize: FontSize.lg,
          fontWeight: FontWeight.semibold,
          color: Colors.textPrimary,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{
            fontSize: FontSize.md,
            color: Colors.textMuted,
            textAlign: 'center',
            lineHeight: 22,
            maxWidth: 280,
          }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" size="sm" />
      )}
    </View>
  );
}
