import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../primitives/Text';
import Button from './Button';
import { theme } from '../../constants/theme';

export type ErrorType = 
  | 'network'
  | 'database'
  | 'permission'
  | 'validation'
  | 'storage'
  | 'generic';

interface ErrorMessageProps {
  type: ErrorType;
  title: string;
  message: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  inline?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type,
  title,
  message,
  onRetry,
  onSecondaryAction,
  secondaryActionLabel,
  inline = false,
}) => {
  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'network':
        return 'cloud-offline-outline';
      case 'database':
        return 'alert-circle-outline';
      case 'permission':
        return 'lock-closed-outline';
      case 'validation':
        return 'warning-outline';
      case 'storage':
        return 'archive-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'validation':
        return theme.colors.warning;
      case 'network':
        return theme.colors.textSecondary;
      default:
        return theme.colors.error;
    }
  };

  if (inline) {
    return (
      <View style={styles.inlineContainer}>
        <Ionicons name={getIcon()} size={16} color={getColor()} style={styles.inlineIcon} />
        <Text size="small" style={[styles.inlineText, { color: getColor() }]}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: getColor() + '15' }]}>
        <Ionicons name={getIcon()} size={48} color={getColor()} />
      </View>

      <Text size="subheading" weight="bold" style={styles.title}>
        {title}
      </Text>

      <Text size="body" style={styles.message}>
        {message}
      </Text>

      {(onRetry || onSecondaryAction) && (
        <View style={styles.actions}>
          {onRetry && (
            <Button
              title="Retry"
              onPress={onRetry}
              style={styles.button}
            />
          )}
          {onSecondaryAction && secondaryActionLabel && (
            <Button
              title={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="secondary"
              style={styles.button}
            />
          )}
        </View>
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
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  message: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  button: {
    width: '100%',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  inlineIcon: {
    marginRight: theme.spacing.xs,
  },
  inlineText: {
    flex: 1,
  },
});

export default ErrorMessage;
