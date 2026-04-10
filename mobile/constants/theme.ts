/**
 * GaweIn Design System
 * Navy + Warm Red + Mustard Gold palette
 * Clean, modern, mobile-friendly aesthetic
 */

export const Colors = {
  // ── Primary ────────────────────────────────────────────
  navy: '#1B2A4A',
  navyLight: '#2A3F6B',
  navyDark: '#111D33',

  // ── Accent: Warm Red ───────────────────────────────────
  red: '#C44536',
  redLight: '#E85D4A',
  redSoft: '#F8E4E1',

  // ── Accent: Mustard Gold ───────────────────────────────
  gold: '#D4A03C',
  goldLight: '#F0C05A',
  goldSoft: '#FDF3E0',

  // ── Neutral ────────────────────────────────────────────
  cream: '#FAF8F5',
  white: '#FFFFFF',
  grayLight: '#E8E6E3',
  grayMed: '#9B9896',
  grayDark: '#4A4745',

  // ── Text ────────────────────────────────────────────────
  textPrimary: '#1A1816',
  textSecondary: '#6B6764',
  textMuted: '#9B9896',
  textInverse: '#FFFFFF',

  // ── Semantic ────────────────────────────────────────────
  success: '#2D8F5C',
  successSoft: '#E3F5EC',
  warning: '#D4A03C',
  warningSoft: '#FDF3E0',
  error: '#C44536',
  errorSoft: '#F8E4E1',
  info: '#2A3F6B',
  infoSoft: '#E3EAF5',

  // ── Status ──────────────────────────────────────────────
  statusPending: '#D4A03C',
  statusConfirmed: '#2D8F5C',
  statusInProgress: '#2A3F6B',
  statusCompleted: '#2D8F5C',
  statusCancelled: '#9B9896',
  statusRejected: '#C44536',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  display: 28,
  hero: 34,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: '0 1px 3px rgba(27, 42, 74, 0.06)',
  md: '0 4px 12px rgba(27, 42, 74, 0.08)',
  lg: '0 8px 24px rgba(27, 42, 74, 0.10)',
  card: '0 2px 8px rgba(27, 42, 74, 0.06)',
} as const;
