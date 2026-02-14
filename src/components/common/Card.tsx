
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../constants/theme';

const Card: React.FC<ViewProps> = ({ style, ...props }) => {
  return <View style={[styles.card, style]} {...props} />;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg, // Cards often have a larger radius
    padding: theme.spacing.md,
    ...theme.shadows.subtle, // Applying a pre-defined shadow style
  },
});

export default Card;
