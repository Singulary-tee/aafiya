
import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONT_SIZES } from '../../constants/typography';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{t(label)}</Text>}
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholderTextColor={COLORS.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{t(error)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.body,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  inputError: {
    borderColor: COLORS.critical,
  },
  errorText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.caption,
    color: COLORS.critical,
  },
});

export default Input;
