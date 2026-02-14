
import React from 'react';
import { StyleSheet, View, TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../constants/theme';
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
        placeholderTextColor={theme.colors.textSecondary} // Updated from theme
        {...props}
      />
      {error && <Text size="caption" style={styles.errorText}>{t(error)}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.divider, // Updated from theme
  },
  inputError: {
    borderColor: theme.colors.critical,
  },
  errorText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.critical,
  },
});

export default Input;
