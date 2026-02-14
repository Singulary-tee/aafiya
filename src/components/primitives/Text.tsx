
import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme'; // Updated path
import { useCustomFonts } from '../../constants/typography';

type TextProps = RNText['props'] & {
  size?: keyof typeof theme.fontSizes;
  weight?: keyof typeof theme.fontWeights;
};

export const Text: React.FC<TextProps> = ({
  children,
  style,
  size = 'body',
  weight = 'regular',
  ...props
}) => {
  const { getFontFamily } = useCustomFonts();
  const fontFamily = getFontFamily(weight);

  return (
    <RNText style={[styles.text, { fontFamily, fontSize: theme.fontSizes[size] }, style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
    text: {
      color: theme.colors.textPrimary, // Added default color
    },
  });
