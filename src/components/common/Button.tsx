
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../constants/theme';
import { Text } from '../primitives/Text';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle, 
  disabled,
  loading = false,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { t } = useTranslation('common');

  // Styles are now derived from the theme object
  const variantStyles = {
    primary: {
      button: { backgroundColor: theme.colors.primary },
      text: { color: theme.colors.surface },
    },
    secondary: {
      button: { backgroundColor: theme.colors.accent },
      text: { color: theme.colors.primary },
    },
    tertiary: {
      button: { backgroundColor: 'transparent' },
      text: { color: theme.colors.primary, textDecorationLine: 'underline' as const },
    },
  };

  const { button, text } = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, button, style, disabled && styles.disabledButton]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? theme.colors.surface : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text weight="bold" size="small" style={[text, textStyle]}>{t(title)}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44, // Minimum touch target size (accessibility)
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
