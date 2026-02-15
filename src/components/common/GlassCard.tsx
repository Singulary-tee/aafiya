import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '@/src/constants/theme';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'surface' | 'overlay';
  shadow?: keyof typeof theme.shadows;
  radius?: keyof typeof theme.radii;
  padding?: keyof typeof theme.spacing;
}

/**
 * GlassCard - A card component with glassy aesthetic
 * Uses semi-transparent backgrounds and subtle shadows for a modern look
 * 
 * @example
 * <GlassCard variant="surface" shadow="glass">
 *   <Text>Content</Text>
 * </GlassCard>
 */
export const GlassCard: React.FC<GlassCardProps> = ({ 
  variant = 'default',
  shadow = 'glass',
  radius = 'lg',
  padding = 'md',
  style,
  children,
  ...props 
}) => {
  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: theme.colors.glassBackground,
      borderColor: theme.colors.glassBorder,
      borderWidth: 1,
    },
    surface: {
      backgroundColor: theme.colors.glassSurface,
      borderColor: theme.colors.glassBorder,
      borderWidth: 1,
    },
    overlay: {
      backgroundColor: theme.colors.glassOverlay,
      borderColor: theme.colors.glassBorder,
      borderWidth: 0.5,
    },
  };

  return (
    <View 
      style={[
        styles.card,
        variantStyles[variant],
        {
          borderRadius: theme.radii[radius],
          padding: theme.spacing[padding],
          ...theme.shadows[shadow],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
