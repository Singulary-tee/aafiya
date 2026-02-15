import { ViewStyle, TextStyle, Dimensions } from 'react-native';
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
    ...theme.shadows.level1,
  };
};

/**
 * Create a gradient text style
 */
export const gradientTextColors = (gradient: keyof typeof theme.gradients): string[] => {
  return theme.gradients[gradient];
};

/**
 * Create responsive spacing based on screen size
 */
export const responsiveSpacing = (
  small: keyof typeof theme.spacing,
  medium: keyof typeof theme.spacing,
  large: keyof typeof theme.spacing
): number => {
  const screenWidth = Dimensions.get('window').width;
  
  // Breakpoints: small < 375, medium < 768, large >= 768
  if (screenWidth < 375) {
    return theme.spacing[small];
  } else if (screenWidth < 768) {
    return theme.spacing[medium];
  } else {
    return theme.spacing[large];
  }
};

/**
 * Create a card style with optional variant
 */
export const cardStyle = (variant: 'default' | 'glass' | 'elevated' = 'default'): ViewStyle => {
  const variants = {
    default: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.standard,
      padding: theme.spacing.md,
      ...theme.shadows.level1,
    },
    glass: {
      ...glassEffect('light'),
      borderRadius: theme.radii.standard,
      padding: theme.spacing.md,
    },
    elevated: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.standard,
      padding: theme.spacing.md,
      ...theme.shadows.level2,
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
