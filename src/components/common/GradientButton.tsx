import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { theme } from '../../constants/theme';
import { Text } from '../primitives/Text';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'gradient';

interface GradientButtonProps {
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

/**
 * GradientButton - Button component with optional gradient background
 * Extends the base Button with gradient capabilities
 * 
 * @example
 * <GradientButton 
 *   title="Save" 
 *   onPress={handleSave} 
 *   variant="gradient" 
 * />
 */
const GradientButton: React.FC<GradientButtonProps> = ({ 
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

  // Styles derived from the theme object
  const variantStyles = {
    primary: {
      button: { backgroundColor: theme.colors.primary },
      text: { color: '#FFFFFF' },
    },
    secondary: {
      button: { backgroundColor: theme.colors.secondary },
      text: { color: '#FFFFFF' },
    },
    tertiary: {
      button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.colors.primary },
      text: { color: theme.colors.primary },
    },
    gradient: {
      button: {},
      text: { color: '#FFFFFF' },
      gradient: theme.gradients.BRAND_PRIMARY,
    },
  };

  const { button, text, gradient } = variantStyles[variant];

  // Try to translate the title, but fall back to the raw title if no translation exists
  const displayTitle = title.includes('.') || title.includes('_') ? t(title, { defaultValue: title }) : title;

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator 
          color={variant === 'tertiary' ? theme.colors.primary : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text weight="bold" size="body" style={[text, textStyle]}>
          {displayTitle}
        </Text>
      )}
    </>
  );

  if (variant === 'gradient' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, style, disabled && styles.disabledButton]}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradient || theme.gradients.BRAND_PRIMARY}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContent}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, button, style, disabled && styles.disabledButton]}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      activeOpacity={0.8}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radii.standard,
    overflow: 'hidden',
    minHeight: 44,
    ...theme.shadows.level1,
  },
  gradientContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default GradientButton;
