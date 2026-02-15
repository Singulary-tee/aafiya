
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Text } from '@/src/components/primitives/Text';
import { LanguageSwitcher } from '@/src/components/settings/LanguageSwitcher';
import { FontSwitcher } from '@/src/components/settings/FontSwitcher';
import Button from '@/src/components/common/Button';
import { theme } from '@/src/constants/theme';

export default function SettingsScreen() {
  const { t } = useTranslation(['settings']);
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <Text size="headline" weight="bold" style={styles.title}>{t('settings')}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <LanguageSwitcher />
        <FontSwitcher />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Helper Mode</Text>
        <Text style={styles.sectionDescription}>
          Allow family members or caregivers to receive notifications when you miss a dose
        </Text>
        <Button 
          title="Add Helper" 
          onPress={() => router.push('/helper/generate')}
          style={styles.button}
        />
        <Button 
          title="Manage Helpers" 
          onPress={() => router.push('/helper')}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </ScrollView>
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.subheading,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
});
