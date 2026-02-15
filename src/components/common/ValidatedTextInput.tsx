import React from 'react';
import { View, StyleSheet, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';
import { Text } from '../primitives/Text';
import { theme } from '@/src/constants/theme';

interface ValidatedTextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
}

/**
 * Text input component with inline validation error display.
 * Shows red border and error message below input when validation fails.
 */
export const ValidatedTextInput: React.FC<ValidatedTextInputProps> = ({
  label,
  error,
  touched = false,
  required = false,
  style,
  ...props
}) => {
  const hasError = touched && error;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <RNTextInput
        style={[
          styles.input,
          hasError && styles.inputError,
          style,
        ]}
        placeholderTextColor={theme.colors.textSecondary}
        {...props}
      />
      {hasError && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.body,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    fontSize: theme.fontSizes.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    minHeight: 44, // Minimum touch target size
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.small,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
