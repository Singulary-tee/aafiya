// Brand Colors - Blue-ish, Purple-ish theme
export const BRAND_COLORS = {
  PRIMARY_BLUE: '#21AFF7',
  PRIMARY_PURPLE: '#7B68EE',
  SECONDARY_BLUE: '#2196F3',
  SECONDARY_PURPLE: '#9D7CFF',
  ACCENT_ORANGE: '#FF9800',
  ACCENT_PURPLE: '#C084FC',
};

// Gradient definitions for brand identity
export const GRADIENTS = {
  BRAND_PRIMARY: ['#21AFF7', '#7B68EE'], // Blue to Purple
  BRAND_SECONDARY: ['#2196F3', '#9D7CFF'], // Lighter Blue to Purple
  BRAND_SUBTLE: ['#E6F4FE', '#F0E8FF'], // Very light blue to purple (for backgrounds)
  SPLASH: ['#E6F4FE', '#F0E8FF'], // Splash screen gradient
  GLASS_OVERLAY: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)'], // For glassy effect
};

export const PRIMARY_COLORS = {
  PRIMARY: '#21AFF7',
  SECONDARY: '#7B68EE',
  ACCENT: '#FF9800',
};

export const HEALTH_CIRCLE_COLORS = {
  HEALTHY: '#4CAF50',
  ATTENTION: '#FFC107',
  RISK: '#FF9800',
  CRITICAL: '#F44336',
};

export const NEUTRAL_COLORS = {
  BACKGROUND: '#F5F7FA',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#212121',
  TEXT_SECONDARY: '#757575',
  TEXT_TERTIARY: '#9E9E9E',
  DIVIDER: '#E0E0E0',
  BORDER: '#EEEEEE',
};

export const GLASS_COLORS = {
  BACKGROUND: 'rgba(245, 247, 250, 0.95)', // Light glass background
  SURFACE: 'rgba(255, 255, 255, 0.9)', // White glass surface
  OVERLAY: 'rgba(255, 255, 255, 0.7)', // Lighter overlay
  BORDER: 'rgba(255, 255, 255, 0.3)', // Glass border
};

// Semantic color mappings
export const SEMANTIC_COLORS = {
  SUCCESS: '#4CAF50',
  WARNING: '#FFC107',
  ERROR: '#F44336',
  INFO: '#2196F3',
};

// Consolidating all colors for easier import
export const COLORS = {
  ...BRAND_COLORS,
  ...PRIMARY_COLORS,
  ...HEALTH_CIRCLE_COLORS,
  ...NEUTRAL_COLORS,
  ...GLASS_COLORS,
  ...SEMANTIC_COLORS,
  // Direct mappings for convenience
  primary: PRIMARY_COLORS.PRIMARY,
  secondary: PRIMARY_COLORS.SECONDARY,
  accent: PRIMARY_COLORS.ACCENT,
  healthy: HEALTH_CIRCLE_COLORS.HEALTHY,
  attention: HEALTH_CIRCLE_COLORS.ATTENTION,
  risk: HEALTH_CIRCLE_COLORS.RISK,
  critical: HEALTH_CIRCLE_COLORS.CRITICAL,
  background: NEUTRAL_COLORS.BACKGROUND,
  surface: NEUTRAL_COLORS.SURFACE,
  textPrimary: NEUTRAL_COLORS.TEXT_PRIMARY,
  textSecondary: NEUTRAL_COLORS.TEXT_SECONDARY,
  textTertiary: NEUTRAL_COLORS.TEXT_TERTIARY,
  text: NEUTRAL_COLORS.TEXT_PRIMARY, // Alias for backward compatibility
  border: NEUTRAL_COLORS.BORDER,
  divider: NEUTRAL_COLORS.DIVIDER,
  danger: HEALTH_CIRCLE_COLORS.CRITICAL,
  success: SEMANTIC_COLORS.SUCCESS,
  warning: SEMANTIC_COLORS.WARNING,
  error: SEMANTIC_COLORS.ERROR,
  info: SEMANTIC_COLORS.INFO,
  glassBackground: GLASS_COLORS.BACKGROUND,
  glassSurface: GLASS_COLORS.SURFACE,
  glassOverlay: GLASS_COLORS.OVERLAY,
  glassBorder: GLASS_COLORS.BORDER,
};