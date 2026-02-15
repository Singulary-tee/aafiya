
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/primitives/Text';
import { LanguageSwitcher } from '@/src/components/settings/LanguageSwitcher';
import { FontSwitcher } from '@/src/components/settings/FontSwitcher';
import { theme } from '@/src/constants/theme';
import { APP_CONFIG } from '@/src/constants/config';
import { useDatabase } from '@/src/hooks/useDatabase';
import { exportAllData } from '@/src/utils/dataExport';
import { useOnboarding } from '@/src/hooks/useOnboarding';

export default function SettingsScreen() {
  const { t } = useTranslation(['settings']);
  const router = useRouter();
  const { db } = useDatabase();
  const { resetOnboarding } = useOnboarding();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoRefillEnabled, setAutoRefillEnabled] = useState(false);

  const handleExportData = async () => {
    if (!db) return;

    try {
      const filePath = await exportAllData(db);
      if (filePath) {
        Alert.alert(
          'Success',
          `${t('data_exported')}\n\nFile saved to:\n${filePath}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleImportData = () => {
    Alert.alert(
      t('import_data'),
      'Import functionality coming soon',
      [{ text: t('cancel') }]
    );
  };

  const handleClearCache = async () => {
    if (!db) return;

    Alert.alert(
      t('clear_cache'),
      'Are you sure you want to clear the cache?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('clear_cache'),
          onPress: async () => {
            try {
              await db.runAsync('DELETE FROM api_cache');
              Alert.alert('Success', t('cache_cleared'));
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text size="headline" weight="bold" style={styles.title}>{t('settings')}</Text>
      
      {/* General */}
      <SettingsSection title={t('general')}>
        <LanguageSwitcher />
        <FontSwitcher />
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title={t('notifications')}>
        <SettingsItem 
          label={t('enable_notifications')}
          onPress={() => setNotificationsEnabled(!notificationsEnabled)}
          rightElement={
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled} 
            />
          }
        />
        <SettingsItem 
          label={t('default_grace_period')}
          value="30 minutes"
          onPress={() => {}}
        />
        <SettingsItem 
          label={t('vibrate')}
          onPress={() => setVibrationEnabled(!vibrationEnabled)}
          rightElement={
            <Switch 
              value={vibrationEnabled} 
              onValueChange={setVibrationEnabled} 
            />
          }
        />
      </SettingsSection>

      {/* Storage */}
      <SettingsSection title={t('storage')}>
        <SettingsItem 
          label={t('low_stock_alert')}
          value="7 days"
          onPress={() => {}}
        />
        <SettingsItem 
          label={t('auto_refill_reminder')}
          onPress={() => setAutoRefillEnabled(!autoRefillEnabled)}
          rightElement={
            <Switch 
              value={autoRefillEnabled} 
              onValueChange={setAutoRefillEnabled} 
            />
          }
        />
      </SettingsSection>

      {/* Data */}
      <SettingsSection title={t('data')}>
        <SettingsItem 
          label={t('export_data')}
          icon="download-outline"
          onPress={handleExportData}
        />
        <SettingsItem 
          label={t('import_data')}
          icon="cloud-upload-outline"
          onPress={handleImportData}
        />
        <SettingsItem 
          label={t('clear_cache')}
          icon="trash-outline"
          onPress={handleClearCache}
        />
      </SettingsSection>

      {/* Database */}
      <SettingsSection title={t('database')}>
        <SettingsItem 
          label={t('update_medication_database')}
          icon="refresh-outline"
          onPress={() => {}}
        />
        <SettingsItem 
          label={t('last_updated')}
          value={t('never')}
        />
        <SettingsItem 
          label={t('database_size')}
          value="2.4 MB"
        />
      </SettingsSection>

      {/* Privacy */}
      <SettingsSection title={t('privacy')}>
        <SettingsItem 
          label={t('privacy_policy')}
          icon="shield-checkmark-outline"
          onPress={() => router.push('/settings/privacy')}
          showChevron
        />
        <SettingsItem 
          label={t('data_usage')}
          icon="bar-chart-outline"
          onPress={() => router.push('/settings/data-usage')}
          showChevron
        />
      </SettingsSection>

      {/* Helper Mode */}
      <SettingsSection title={t('helper_mode')}>
        <SettingsItem 
          label={t('manage_helpers')}
          icon="people-outline"
          onPress={() => router.push('/helper')}
          showChevron
        />
        <SettingsItem 
          label={t('paired_devices')}
          value="0"
        />
      </SettingsSection>

      {/* About */}
      <SettingsSection title={t('about_section')}>
        <SettingsItem 
          label={t('about_app')}
          icon="information-circle-outline"
          onPress={() => router.push('/settings/about')}
          showChevron
        />
        <SettingsItem 
          label={t('replay_onboarding')}
          icon="play-outline"
          onPress={async () => {
            await resetOnboarding();
            router.push('/onboarding');
          }}
          showChevron
        />
        <SettingsItem 
          label={t('version')}
          value={`${APP_CONFIG.VERSION} (${APP_CONFIG.BUILD_NUMBER})`}
        />
      </SettingsSection>
    </ScrollView>
  );
}

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

interface SettingsItemProps {
  label: string;
  value?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  label, 
  value, 
  icon, 
  onPress, 
  rightElement,
  showChevron 
}) => {
  const content = (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        {icon && <Ionicons name={icon} size={20} color={theme.colors.textSecondary} style={styles.itemIcon} />}
        <Text size="body" style={styles.itemLabel}>{label}</Text>
      </View>
      <View style={styles.itemRight}>
        {value && <Text size="body" style={styles.itemValue}>{value}</Text>}
        {rightElement}
        {showChevron && <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.small,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: theme.spacing.sm,
  },
  itemLabel: {
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemValue: {
    color: theme.colors.textSecondary,
  },
});
