/**
 * GaweIn High-End Design System (21st.dev Inspired)
 * Premium Matte Dark Aesthetic
 * Clean, Elegant, Minimalist, Abyssal Contrasts
 */

export const Colors = {
  // ── Primary Brand (Blue 400) ────────────────────────
  navy: '#60A5FA',       // Primary Blue, comfortable, techy
  navyLight: '#93C5FD',
  navyDark: '#3B82F6',

  // ── Accents & Soft Brand (Muted Indigos) ────────────
  red: '#818CF8',        
  redLight: '#A5B4FC',
  redSoft: '#E0E7FF',

  // ── Secondary Soft (Soft Cyan/Sky) ──────────────────
  gold: '#7DD3FC',       
  goldLight: '#BAE6FD',
  goldSoft: '#E0F2FE',

  // ── Background / Neutral (Dark Mode Base) ───────────
  cream: '#0B1426',      // Background utama (Midnight Slate)
  // Core / Brand
  primary: '#6366F1',     // Indigo 500
  secondary: '#38BDF8',   // Light Blue Accent
  navy: '#6366F1',        // Aliased for legacy references
  
  // Neutral / Background
  slate900: '#1E293B',    // Surface Dark (Replacing Cards)
  white: '#1E293B',       // Component Background (Surface in Dark Mode)
  cream: '#0F172A',       // Base Main Background
  grayLight: '#334155',   // Borders / Shadows
  grayMed: '#475569',
  grayDark: '#94A3B8',

  // Typography
  textPrimary: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  
  // Status / Feedback
  success: '#10B981',
  successSoft: '#064E3B', 
  warning: '#F59E0B',
  warningSoft: '#78350F',
  error: '#EF4444',
  errorSoft: '#7F1D1D',
  info: '#3B82F6',
  infoSoft: '#1E3A8A', 
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
  pill: 999, // Super rounded items
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

// Adapted to matte dark mode
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    shadowColor: '#000', // Harder shadow for dark mode
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};
