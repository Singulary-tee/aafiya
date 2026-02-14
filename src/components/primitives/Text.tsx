import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import { useCustomFonts, FONT_SIZES, FONT_WEIGHTS } from '@/src/constants/typography';

type TextProps = RNText['props'] & {
  size?: keyof typeof FONT_SIZES;
  weight?: keyof typeof FONT_WEIGHTS;
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
  const fontSize = FONT_SIZES[size];

  return (
    <RNText style={[{ fontFamily, fontSize }, style]} {...props}>
      {children}
    </RNText>
  );
};
