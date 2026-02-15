import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/src/constants/theme';

interface GlassSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

/**
 * GlassSurface - Glass morphism component using expo-blur
 * 
 * Implements glass effect with:
 * - BlurView as background layer
 * - Semi-transparent white background (70-80% opacity)
 * - Subtle border (1px white with 20% opacity)
 * - Soft shadow for depth (Level 1)
 * - 12dp border radius
 */
export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  style,
  intensity = 20,
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={intensity} style={styles.blurView}>
        <View style={styles.glassContent}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radii.standard,
    overflow: 'hidden',
    ...theme.shadows.level1,
  },
  blurView: {
    flex: 1,
    borderRadius: theme.radii.standard,
  },
  glassContent: {
    flex: 1,
    backgroundColor: theme.colors.glassSurface,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.radii.standard,
  },
});
