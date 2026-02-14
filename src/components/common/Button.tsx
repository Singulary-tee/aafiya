
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
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
}

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', style, textStyle, disabled }) => {
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
      text: { color: theme.colors.primary, textDecorationLine: 'underline' },
    },
  };

  const { button, text } = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, button, style, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <Text weight="bold" size="small" style={[text, textStyle]}>{t(title)}</Text>
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
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
