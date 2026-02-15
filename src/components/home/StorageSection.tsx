
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/primitives/Text';
import HealthCircle from '@/src/components/health/HealthCircle';
import StorageCircle from '@/src/components/health/StorageCircle';
import { GlassCard } from '@/src/components/common/GlassCard';
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
    <Animated.View entering={FadeIn.duration(300)}>
      <GlassCard intensity={20} padding="md" elevation="level1" style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.healthCircleContainer}>
            <HealthCircle score={healthScore ?? 0} size={120} />
          </View>
          <View style={styles.storageSection}>
            <Text size="medium" weight="bold" style={styles.subHeader}>{t('storage_levels')}</Text>
            {medications.slice(0, 3).map(med => (
              <View key={med.id} style={styles.storageItem}>
                <Text size="medium" numberOfLines={1} style={styles.medicationName}>{med.name}</Text>
                <StorageCircle daysRemaining={storageInfo[med.id] ?? 0} size="small" />
              </View>
            ))}
            {medications.length > 3 && (
              <Text size="small" style={styles.moreText}>
                {t('and_more', { count: medications.length - 3 })}
              </Text>
            )}
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthCircleContainer: {
    marginRight: theme.spacing.md,
  },
  storageSection: {
    flex: 1,
  },
  subHeader: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    paddingVertical: 4,
  },
  medicationName: {
    flex: 1,
    marginRight: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  moreText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
});
