// constants/theme.js
//
// Centralised design tokens for the CivicFix mobile app.
// All colours, spacing, radii and typography are defined here.
// No component should hardcode hex values or pixel sizes.

export const COLORS = {
  // ── Brand ─────────────────────────────────────────────
  primary:        '#1A56DB',   // CivicFix blue
  primaryLight:   '#EBF0FD',   // light tint for backgrounds
  primaryDark:    '#1240A8',   // pressed / dark state
  secondary:      '#10B981',   // success green
  accent:         '#F59E0B',   // amber — reward points, warnings

  // ── Status colours ────────────────────────────────────
  statusSubmitted:  '#3B82F6',
  statusVerified:   '#8B5CF6',
  statusAssigned:   '#F59E0B',
  statusInProgress: '#F97316',
  statusCompleted:  '#10B981',
  statusClosed:     '#6B7280',
  statusField:      '#6366F1',

  // ── Semantic ──────────────────────────────────────────
  success: '#10B981',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6',

  // ── Neutrals ──────────────────────────────────────────
  white:    '#FFFFFF',
  black:    '#000000',
  gray50:   '#F9FAFB',
  gray100:  '#F3F4F6',
  gray200:  '#E5E7EB',
  gray300:  '#D1D5DB',
  gray400:  '#9CA3AF',
  gray500:  '#6B7280',
  gray600:  '#4B5563',
  gray700:  '#374151',
  gray800:  '#1F2937',
  gray900:  '#111827',

  // ── Backgrounds ───────────────────────────────────────
  background: '#F5F7FA',
  surface:    '#FFFFFF',
  border:     '#E5E7EB',
};

// ── Spacing scale (multiples of 4px) ──────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  base: 16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

// ── Border radii ───────────────────────────────────────────
export const RADIUS = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 999,
};

// ── Font sizes ─────────────────────────────────────────────
export const FONTS = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 30,
  huge: 36,
};

// ── Shadows (cross-platform) ───────────────────────────────
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};

// ── Status → theme colour lookup ───────────────────────────
export const STATUS_COLORS = {
  Submitted:          COLORS.statusSubmitted,
  Verified:           COLORS.statusVerified,
  Assigned:           COLORS.statusAssigned,
  'In-progress':      COLORS.statusInProgress,
  'Field-verification': COLORS.statusField,
  Completed:          COLORS.statusCompleted,
  Closed:             COLORS.statusClosed,
};
