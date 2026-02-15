
import React from 'react';
import { StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { theme } from '../../constants/theme';
import { Text } from '../primitives/Text';
import { triggerHapticFeedback, buttonPressAnimation } from '../../utils/animations';

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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(buttonPressAnimation.pressed, buttonPressAnimation.config);
    triggerHapticFeedback('light');
  };

  const handlePressOut = () => {
    scale.value = withSpring(buttonPressAnimation.released, buttonPressAnimation.config);
  };

  const handlePress = () => {
    onPress();
  };

  // Styles derived from theme
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
  };

  const { button, text } = variantStyles[variant];

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <Animated.View style={[styles.button, button, animatedStyle, style, disabled && styles.disabledButton]}>
        {loading ? (
          <ActivityIndicator 
            color={variant === 'tertiary' ? theme.colors.primary : '#FFFFFF'}
            size="small"
          />
        ) : (
          <Text weight="bold" size="medium" style={[text, textStyle]}>
            {t(title)}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.standard,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
    ...theme.shadows.level1,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default Button;
