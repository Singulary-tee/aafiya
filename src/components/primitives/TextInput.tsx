import React from 'react';
import { TextInput as RNTextInput, StyleSheet } from 'react-native';
import { useCustomFonts, FONT_SIZES, FONT_WEIGHTS } from '@/src/constants/typography';

type TextInputProps = RNTextInput['props'] & {
  size?: keyof typeof FONT_SIZES;
  weight?: keyof typeof FONT_WEIGHTS;
};

export const TextInput: React.FC<TextInputProps> = ({
  style,
  size = 'body',
  weight = 'regular',
  ...props
}) => {
  const { getFontFamily } = useCustomFonts();
  const fontFamily = getFontFamily(weight);
  const fontSize = FONT_SIZES[size];

  return (
    <RNTextInput
      style={[{ fontFamily, fontSize }, styles.input, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
});
