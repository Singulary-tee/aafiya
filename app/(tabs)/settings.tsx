
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/primitives/Text';
import { LanguageSwitcher } from '@/src/components/settings/LanguageSwitcher';
import { FontSwitcher } from '@/src/components/settings/FontSwitcher';
import { theme } from '@/src/constants/theme';

export default function SettingsScreen() {
  const { t } = useTranslation(['settings']);

  return (
    <View style={styles.container}>
      <Text size="headline" weight="bold" style={styles.title}>{t('settings')}</Text>
      <LanguageSwitcher />
      <FontSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    marginBottom: theme.spacing.lg,
  },
});
