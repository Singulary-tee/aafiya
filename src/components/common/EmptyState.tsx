import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../primitives/Text';
import Button from './Button';
import { theme } from '../../constants/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  tip?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  tip,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={80} color={theme.colors.textSecondary} />
      </View>
      
      <Text size="title" weight="bold" style={styles.title}>
        {title}
      </Text>
      
      <Text size="body" style={styles.description}>
        {description}
      </Text>
      
      {tip && (
        <View style={styles.tipContainer}>
          <Text size="small" style={styles.tipIcon}>💡</Text>
          <Text size="small" style={styles.tipText}>{tip}</Text>
        </View>
      )}
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.6,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  description: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
    maxWidth: '90%',
  },
  tipIcon: {
    marginRight: theme.spacing.xs,
  },
  tipText: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  actionButton: {
    minWidth: 200,
  },
});

export default EmptyState;
