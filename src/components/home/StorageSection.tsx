
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/primitives/Text';
import HealthCircle from '@/src/components/health/HealthCircle';
import StorageCircle from '@/src/components/health/StorageCircle';
import { theme } from '@/src/constants/theme';
import { Medication } from '@/src/database/models/Medication';
import { StorageInfo } from '@/src/hooks/useStorageLevels';

interface StorageSectionProps {
  healthScore: number | null;
  medications: Medication[];
  storageInfo: StorageInfo;
}

export const StorageSection: React.FC<StorageSectionProps> = ({ healthScore, medications, storageInfo }) => {
  const { t } = useTranslation('home');

  return (
    <View style={styles.topSection}>
      <HealthCircle score={healthScore ?? 0} size={150} />
      <View style={styles.storageSection}>
        <Text size="title" weight="bold" style={styles.subHeader}>{t('storage_levels')}</Text>
        {medications.map(med => (
          <View key={med.id} style={styles.storageItem}>
            <Text size="body">{med.name}</Text>
            <StorageCircle daysRemaining={storageInfo[med.id] ?? 0} size="small" />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  storageSection: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  subHeader: {
    marginBottom: theme.spacing.sm,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
});
