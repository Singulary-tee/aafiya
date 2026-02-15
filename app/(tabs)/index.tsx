
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { useProfile } from '@/src/hooks/useProfile';
import { useMedications } from '@/src/hooks/useMedications';
import { useHealthScore } from '@/src/hooks/useHealthScore';
import { useTodayDoses } from '@/src/hooks/useTodayDoses';
import { useStorageLevels } from '@/src/hooks/useStorageLevels';

import { GradientBackground } from '@/src/components/primitives/GradientBackground';
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
    return (
      <GradientBackground gradient="BRAND_SUBTLE">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </GradientBackground>
    );
  }

  if (!activeProfile) {
    return (
      <GradientBackground gradient="BRAND_SUBTLE">
        <View style={styles.centered}>
          <Text>{t('no_active_profile')}</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground gradient="BRAND_SUBTLE">
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  },
});
