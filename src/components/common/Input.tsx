
import React from 'react';
import { StyleSheet, View, TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { Text } from '../primitives/Text';
import { TextInput } from '../primitives/TextInput';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {label && <Text size="body" style={styles.label}>{t(label)}</Text>}
      <TextInput
        size="body"
        style={[styles.input, !!error && styles.inputError]}
        placeholderTextColor={COLORS.textSecondary}
        {...props}
      />
      {error && <Text size="caption" style={styles.errorText}>{t(error)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  inputError: {
    borderColor: COLORS.critical,
  },
  errorText: {
    marginTop: SPACING.sm,
    color: COLORS.critical,
  },
});

export default Input;
