
import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme'; // Updated path
import { useCustomFonts } from '../../constants/typography';

type TextInputProps = RNTextInput['props'] & {
  size?: keyof typeof theme.fontSizes;
  weight?: keyof typeof theme.fontWeights;
};

export const TextInput: React.FC<TextInputProps> = ({
  style,
  size = 'body',
  weight = 'regular',
  ...props
}) => {
  const { getFontFamily } = useCustomFonts();
  const fontFamily = getFontFamily(weight);

  return (
    <RNTextInput
      style={[styles.input, { fontFamily, fontSize: theme.fontSizes[size] }, style]}
      placeholderTextColor={theme.colors.textSecondary}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
    input: {
      color: theme.colors.textPrimary,
      padding: theme.spacing.md,
    },
  });
