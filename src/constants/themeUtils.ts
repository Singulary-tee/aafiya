import { ViewStyle, TextStyle } from 'react-native';
import { theme } from './theme';

/**
 * Theme Utilities - Helper functions for working with the theme
 */

/**
 * Get spacing value by key
 */
export const getSpacing = (key: keyof typeof theme.spacing): number => {
  return theme.spacing[key];
};

/**
 * Get color by key with optional opacity
 */
export const getColor = (key: keyof typeof theme.colors, opacity?: number): string => {
  const color = theme.colors[key];
  if (opacity !== undefined && !color.includes('rgba')) {
    // Convert hex to rgba if opacity is provided
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

/**
 * Create a glass effect style
 */
export const glassEffect = (variant: 'light' | 'medium' | 'dark' = 'light'): ViewStyle => {
  const opacities = {
    light: 0.7,
    medium: 0.85,
    dark: 0.95,
  };

  return {
    backgroundColor: getColor('surface', opacities[variant]),
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    ...theme.shadows.glass,
  };
};

/**
 * Create a gradient text style (for future use with react-native-linear-gradient Text)
 */
export const gradientTextColors = (gradient: keyof typeof theme.gradients): string[] => {
  return theme.gradients[gradient];
};

/**
 * Create responsive spacing based on screen size
 * TODO: Implement actual responsive logic with Dimensions API
 * Currently returns medium spacing for all screen sizes
 */
export const responsiveSpacing = (
  small: keyof typeof theme.spacing,
  medium: keyof typeof theme.spacing,
  large: keyof typeof theme.spacing
) => {
  // Placeholder - implement with Dimensions.get('window').width
  return theme.spacing[medium];
};

/**
 * Mix two colors
 * TODO: Implement proper color mixing with a color manipulation library
 * This is a placeholder implementation
 */
export const mixColors = (color1: string, color2: string, ratio: number = 0.5): string => {
  // Placeholder - use a library like tinycolor2 or chroma-js for proper color mixing
  console.warn('mixColors is a placeholder and does not actually mix colors');
  return ratio > 0.5 ? color2 : color1;
};
export const cardStyle = (variant: 'default' | 'glass' | 'elevated' = 'default'): ViewStyle => {
  const variants = {
    default: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      ...theme.shadows.subtle,
    },
    glass: {
      ...glassEffect('light'),
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      ...theme.shadows.strong,
    },
  };

  return variants[variant];
};

/**
 * Create text style with theme values
 */
export const textStyle = (
  size: keyof typeof theme.fontSizes,
  weight: keyof typeof theme.fontWeights,
  color: keyof typeof theme.colors = 'textPrimary'
): TextStyle => {
  return {
    fontSize: theme.fontSizes[size],
    fontWeight: theme.fontWeights[weight] as TextStyle['fontWeight'],
    color: theme.colors[color],
  };
};
