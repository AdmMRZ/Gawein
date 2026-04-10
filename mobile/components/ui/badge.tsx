import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { HiringStatus, BookingStatus } from '@/types';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: Colors.grayLight, text: Colors.grayDark },
  success: { bg: Colors.successSoft, text: Colors.success },
  warning: { bg: Colors.warningSoft, text: Colors.warning },
  error: { bg: Colors.errorSoft, text: Colors.error },
  info: { bg: Colors.infoSoft, text: Colors.info },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const v = variants[variant];
  return (
    <View
      style={{
        backgroundColor: v.bg,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radius.pill,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontSize: FontSize.xs,
          fontWeight: FontWeight.semibold,
          color: v.text,
          textTransform: 'capitalize',
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Status Badge Helper ──────────────────────────────────

const statusVariantMap: Record<string, BadgeVariant> = {
  pending: 'warning',
  confirmed: 'success',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'default',
  rejected: 'error',
};

export function StatusBadge({ status }: { status: HiringStatus | BookingStatus | string }) {
  const variant = statusVariantMap[status] || 'default';
  const label = status.replace(/_/g, ' ');
  return <Badge label={label} variant={variant} />;
}
