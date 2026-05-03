/**
 * GaweIn High-End Design System
 * Light & Vibrant Aesthetic (Unified with Search Index)
 */

export const Colors = {
  // ── Primary Brand (Vibrant Blue) ────────────────────────
  navy: '#315BE8',       
  primary: '#315BE8',
  navyLight: '#C9D7FF',
  navyDark: '#1E3A8A',

  // ── Accents (Vibrant Yellow) ────────────────────────────
  gold: '#FFD45A',       
  goldLight: '#FFE59E',
  goldSoft: '#FFF9E6',

  // ── Neutral / Background (Light Mode Base) ──────────────
  white: '#FFFFFF',      
  cream: '#F8F9FA',      
  grayLight: '#D9D9D9',  
  grayMed: '#777777',
  grayDark: '#111111',

  // Typography
  textPrimary: '#111111',
  textSecondary: '#444444',
  textMuted: '#777777',
  textInverse: '#FFFFFF',
  
  // Status
  success: '#10B981',
  successSoft: '#D1FAE5',
  warning: '#F59E0B',
  warningSoft: '#FEF3C7',
  error: '#EF4444',
  errorSoft: '#FEE2E2',
  errorLight: '#FCA5A5',
  info: '#315BE8',
  infoSoft: '#DBEAFE',
  slate900: '#0F172A',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  section: 64,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  display: 32,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
};
