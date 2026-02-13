
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FONT_SIZES, FONT_WEIGHTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { COLORS, NEUTRAL_COLORS } from '../../constants/colors';

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

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: styles.primaryButton,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          button: styles.secondaryButton,
          text: styles.secondaryText,
        };
      case 'tertiary':
        return {
          button: styles.tertiaryButton,
          text: styles.tertiaryText,
        };
      default:
        return {};
    }
  };

  const { button, text } = getButtonStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, button, style, disabled && styles.disabledButton]}
      disabled={disabled}
    >
      <Text style={[styles.text, text, textStyle]}>{t(title)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: FONT_SIZES.small,
    fontWeight: FONT_WEIGHTS.bold as any,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: NEUTRAL_COLORS.SURFACE,
  },
  secondaryButton: {
    backgroundColor: COLORS.accent,
  },
  secondaryText: {
    color: COLORS.primary,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  tertiaryText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
