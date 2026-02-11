/**
 * Color Theme
 * Color palette for the application
 */

export const COLORS = {
  // Primary Colors
  primary: '#2196F3',
  primaryLight: '#E3F2FD',
  primaryDark: '#1565C0',

  // Secondary Colors
  secondary: '#FF6F00',
  secondaryLight: '#FFE0B2',
  secondaryDark: '#E65100',

  // Success (Health)
  success: '#4CAF50',
  successLight: '#E8F5E9',
  successDark: '#2E7D32',

  // Warning (Late/Missed)
  warning: '#FFC107',
  warningLight: '#FFF8E1',
  warningDark: '#F57F17',

  // Error (Critical)
  error: '#F44336',
  errorLight: '#FFEBEE',
  errorDark: '#C62828',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Semantic
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEEEEE',
  border: '#E0E0E0',
  divider: '#EEEEEE',

  // Health Score Spectrum
  healthExcellent: '#4CAF50', // Green
  healthGood: '#8BC34A', // Light Green
  healthFair: '#FFC107', // Amber
  healthPoor: '#FF5722', // Deep Orange
  healthCritical: '#F44336', // Red
} as const;

// Status Color Mapping
export const STATUS_COLORS = {
  taken: COLORS.success,
  missed: COLORS.error,
  late: COLORS.warning,
  skipped: COLORS.gray400,
  pending: COLORS.primary,
} as const;

// Health Score Color Mapping
export const HEALTH_COLORS = {
  0: COLORS.healthCritical,
  20: COLORS.healthPoor,
  40: COLORS.healthFair,
  60: COLORS.healthGood,
  80: COLORS.healthExcellent,
  100: COLORS.healthExcellent,
} as const;

export function getHealthColor(score: number): string {
  if (score === 0) return HEALTH_COLORS[0];
  if (score < 20) return HEALTH_COLORS[20];
  if (score < 40) return HEALTH_COLORS[40];
  if (score < 60) return HEALTH_COLORS[60];
  return HEALTH_COLORS[100];
}
