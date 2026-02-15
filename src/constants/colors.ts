// Brand Colors - Glass Morphism Blue-Purple Gradient Theme
export const BRAND_COLORS = {
  PRIMARY_BLUE: '#6B8DD6',
  PRIMARY_PURPLE: '#8B7EC8',
  SECONDARY_BLUE_LIGHT: '#8FA4DC',
  SECONDARY_PURPLE_LIGHT: '#A093D1',
};

// Gradient definitions for brand identity
export const GRADIENTS = {
  BRAND_PRIMARY: ['#6B8DD6', '#8B7EC8'], // Soft blue to muted purple
  BRAND_SECONDARY: ['#8FA4DC', '#A093D1'], // Lighter tints
  BRAND_SUBTLE: ['#E8EDF7', '#EDE9F4'], // Very light for backgrounds
  SPLASH: ['#E8EDF7', '#EDE9F4'], // Splash screen gradient
};

export const PRIMARY_COLORS = {
  PRIMARY: '#6B8DD6',
  SECONDARY: '#8B7EC8',
  ACCENT: '#8FA4DC',
};

// Semantic colors - Soft tones
export const SEMANTIC_COLORS = {
  SUCCESS: '#4CAF50', // Soft green
  WARNING: '#FFA726', // Soft amber
  ERROR: '#EF5350', // Soft coral
  INFO: '#6B8DD6', // Primary blue
};

export const HEALTH_CIRCLE_COLORS = {
  HEALTHY: '#4CAF50',
  ATTENTION: '#FFA726',
  RISK: '#FF9800',
  CRITICAL: '#EF5350',
};

export const NEUTRAL_COLORS = {
  BACKGROUND: '#F5F7FA',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#212121', // Dark gray
  TEXT_SECONDARY: '#757575', // Medium gray
  TEXT_TERTIARY: '#9E9E9E',
  DIVIDER: '#E0E0E0',
  BORDER: '#EEEEEE',
};

// Glass Morphism colors - Using expo-blur with opacity
export const GLASS_COLORS = {
  BACKGROUND: 'rgba(255, 255, 255, 0.75)', // 75% opacity for glass background
  SURFACE: 'rgba(255, 255, 255, 0.8)', // 80% opacity for glass surface
  OVERLAY: 'rgba(255, 255, 255, 0.7)', // 70% opacity for overlays
  BORDER: 'rgba(255, 255, 255, 0.2)', // 20% opacity for borders
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