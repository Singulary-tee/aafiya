import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/src/constants/theme';

type GradientType = keyof typeof theme.gradients;

interface GradientBackgroundProps {
  gradient?: GradientType;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
  flex?: number; // Make flex configurable
}

/**
 * GradientBackground - Primitive component for consistent gradient backgrounds
 * 
 * @example
 * <GradientBackground gradient="BRAND_PRIMARY">
 *   <Text>Content</Text>
 * </GradientBackground>
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  gradient = 'BRAND_PRIMARY',
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
  flex = 1,
}) => {
  const gradientColors = colors || theme.gradients[gradient];

  return (
    <LinearGradient
      colors={gradientColors}
      start={start}
      end={end}
      style={[{ flex }, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Removed container style as flex is now configurable via props
});
