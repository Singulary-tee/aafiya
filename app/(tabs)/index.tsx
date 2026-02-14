
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { useProfile } from '@/src/hooks/useProfile';
import { useMedications } from '@/src/hooks/useMedications';
import { useHealthScore } from '@/src/hooks/useHealthScore';
import { useTodayDoses } from '@/src/hooks/useTodayDoses';
import { useStorageLevels } from '@/src/hooks/useStorageLevels';

import { StorageSection } from '@/src/components/home/StorageSection';
import { DoseList } from '@/src/components/home/DoseList';
import { Text } from '@/src/components/primitives/Text';
import { theme } from '@/src/constants/theme';

export default function HomeScreen() {
  const { t } = useTranslation('home');
  const { activeProfile } = useProfile();
  const { medications, isLoading: medsLoading } = useMedications(activeProfile?.id || null);
  const { healthScore, refreshHealthScore, isLoading: scoreLoading } = useHealthScore(activeProfile?.id || null);
  const { doses, isLoading: dosesLoading, logDose } = useTodayDoses(activeProfile?.id || null, refreshHealthScore);
  const { storageInfo, isLoading: storageLoading } = useStorageLevels(medications);

  const isLoading = medsLoading || scoreLoading || dosesLoading || storageLoading;

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (!activeProfile) {
    return (
      <View style={styles.centered}>
        <Text>{t('no_active_profile')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text size="headline" weight="bold" style={styles.header}>
        {t('welcome')}, {activeProfile.name}
      </Text>

      <StorageSection 
        healthScore={healthScore}
        medications={medications}
        storageInfo={storageInfo}
      />

      <DoseList 
        doses={doses}
        onLogDose={logDose}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: theme.spacing.md,
  },
});
