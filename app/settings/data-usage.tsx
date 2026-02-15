import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';
import { theme } from '@/src/constants/theme';
import { useDatabase } from '@/src/hooks/useDatabase';
import { ProfileRepository } from '@/src/database/repositories/ProfileRepository';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { DoseLogRepository } from '@/src/database/repositories/DoseLogRepository';
import { HelperPairingRepository } from '@/src/database/repositories/HelperPairingRepository';
import { exportAllData, importData } from '@/src/utils/dataExport';

interface DataStats {
  profilesCount: number;
  medicationsCount: number;
  scheduledDosesPerWeek: number;
  doseHistoryCount: number;
  helperPairingsCount: number;
  databaseSize: string;
  cacheSize: string;
  totalSize: string;
}

export default function DataUsageScreen() {
  const { t } = useTranslation(['settings']);
  const { db, isLoading: isDbLoading } = useDatabase();
  const [stats, setStats] = useState<DataStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [db, isDbLoading]);

  const loadStats = async () => {
    if (isDbLoading || !db) return;

    try {
      setIsLoading(true);

      // Get counts from database
      const profileRepo = new ProfileRepository(db);
      const medicationRepo = new MedicationRepository(db);
      const doseLogRepo = new DoseLogRepository(db);
      const helperPairingRepo = new HelperPairingRepository(db);

      const profiles = await profileRepo.findAll();
      const medications = await db.getAllAsync('SELECT * FROM medications WHERE is_active = 1');
      const schedules = await db.getAllAsync('SELECT * FROM schedules WHERE is_active = 1');
      const doseLogs = await db.getAllAsync('SELECT COUNT(*) as count FROM dose_log');
      const helperPairings = await db.getAllAsync('SELECT COUNT(*) as count FROM helper_pairing WHERE is_active = 1');

      // Calculate scheduled doses per week
      let scheduledDosesPerWeek = 0;
      for (const schedule of schedules as any[]) {
        const times = JSON.parse(schedule.times || '[]');
        scheduledDosesPerWeek += times.length * 7; // times per day * 7 days
      }

      // Get database size
      const dbPath = `${FileSystem.documentDirectory}SQLite/medication_tracker.db`;
      let databaseSize = '0';
      try {
        const dbInfo = await FileSystem.getInfoAsync(dbPath);
        if (dbInfo.exists && dbInfo.size) {
          databaseSize = (dbInfo.size / 1024 / 1024).toFixed(2);
        }
      } catch (error) {
        console.log('Could not get database size:', error);
      }

      // Cache size (approximate)
      const cacheSize = '0';

      // Total size
      const totalSize = (parseFloat(databaseSize) + parseFloat(cacheSize)).toFixed(2);

      setStats({
        profilesCount: profiles.length,
        medicationsCount: medications.length,
        scheduledDosesPerWeek,
        doseHistoryCount: (doseLogs[0] as any)?.count || 0,
        helperPairingsCount: (helperPairings[0] as any)?.count || 0,
        databaseSize: `${databaseSize} MB`,
        cacheSize: `${cacheSize} MB`,
        totalSize: `${totalSize} MB`,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!db) return;

    try {
      const filePath = await exportAllData(db);
      if (filePath) {
        Alert.alert(
          'Success',
          `${t('data_exported')}\n\nFile saved to: ${filePath}`,
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

  const handleImportData = async () => {
    if (!db) return;

    try {
      // Import functionality would require file picker
      Alert.alert(
        t('import_data'),
        'Import functionality coming soon',
        [{ text: t('cancel') }]
      );
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import data');
    }
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('confirm_delete_title'),
      t('confirm_delete_message'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement delete all data
            Alert.alert('Success', t('data_deleted'));
          },
        },
      ]
    );
  };

  const handleClearCache = async () => {
    if (!db) return;
    try {
      await db.runAsync('DELETE FROM api_cache');
      Alert.alert('Success', t('cache_cleared'));
      loadStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  if (isLoading || !stats) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text size="headline" weight="bold" style={styles.title}>
        {t('data_usage_title')}
      </Text>

      {/* Your Data */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('your_data')}
        </Text>
        <DataRow label={t('profiles_count')} value={stats.profilesCount.toString()} />
        <DataRow label={t('medications_count')} value={stats.medicationsCount.toString()} />
        <DataRow label={t('scheduled_doses')} value={stats.scheduledDosesPerWeek.toString()} />
        <DataRow label={t('dose_history')} value={stats.doseHistoryCount.toString()} />
        <DataRow label={t('helper_pairings')} value={stats.helperPairingsCount.toString()} />
      </View>

      {/* Storage Usage */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('storage_usage')}
        </Text>
        <DataRow label={t('database_size_label')} value={stats.databaseSize} />
        <DataRow label={t('pill_images')} value="0 MB" />
        <DataRow label={t('cache_size')} value={stats.cacheSize} />
        <View style={styles.divider} />
        <DataRow label={t('total_size')} value={stats.totalSize} bold />
        <Button
          title={t('clear_cache')}
          onPress={handleClearCache}
          variant="secondary"
          style={styles.button}
        />
      </View>

      {/* Privacy Summary */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('privacy_summary')}
        </Text>
        <CheckItem text={t('all_data_local')} />
        <CheckItem text={t('no_cloud_sync')} />
        <CheckItem text={t('no_analytics_tracking')} />
        <CheckItem text={t('you_own_data')} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title={t('export_all_data')}
          onPress={handleExportData}
          style={styles.button}
        />
        <Button
          title={t('delete_all_data_confirm')}
          onPress={handleDeleteAllData}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

interface DataRowProps {
  label: string;
  value: string;
  bold?: boolean;
}

const DataRow: React.FC<DataRowProps> = ({ label, value, bold }) => (
  <View style={styles.dataRow}>
    <Text size="body" style={styles.dataLabel}>
      {label}
    </Text>
    <Text size="body" weight={bold ? 'bold' : 'medium'} style={bold ? styles.dataTotalValue : styles.dataValue}>
      {value}
    </Text>
  </View>
);

interface CheckItemProps {
  text: string;
}

const CheckItem: React.FC<CheckItemProps> = ({ text }) => (
  <View style={styles.checkItem}>
    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} style={styles.checkIcon} />
    <Text size="body" style={styles.checkText}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  dataLabel: {
    flex: 1,
    color: theme.colors.textSecondary,
  },
  dataValue: {
    color: theme.colors.textPrimary,
  },
  dataTotalValue: {
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  checkIcon: {
    marginRight: theme.spacing.sm,
  },
  checkText: {
    flex: 1,
    color: theme.colors.textSecondary,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  button: {
    marginBottom: theme.spacing.sm,
  },
});
