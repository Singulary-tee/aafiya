import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/src/constants/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  padding?: keyof typeof theme.spacing;
  elevation?: 'level1' | 'level2';
}

/**
 * GlassCard - Glass morphism card component using expo-blur
 * 
 * Implements glass effect with:
 * - BlurView as background layer
 * - Semi-transparent white background (70-80% opacity)
 * - Subtle border (1px white with 20% opacity)
 * - Soft shadow for depth
 * - 12dp border radius
 * 
 * @example
 * <GlassCard intensity={20} padding="md" elevation="level1">
 *   <Text>Content</Text>
 * </GlassCard>
 */
export const GlassCard: React.FC<GlassCardProps> = ({ 
  children,
  intensity = 20,
  padding = 'md',
  elevation = 'level1',
  style,
  ...props 
}) => {
  return (
    <View 
      style={[
        styles.container,
        theme.shadows[elevation],
        style,
      ]}
      {...props}
    >
      <BlurView intensity={intensity} style={styles.blurView}>
        <View style={[
          styles.content,
          { padding: theme.spacing[padding] }
        ]}>
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
  },
  blurView: {
    borderRadius: theme.radii.standard,
  },
  content: {
    backgroundColor: theme.colors.glassSurface,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.radii.standard,
  },
});

