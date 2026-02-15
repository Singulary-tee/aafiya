
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/primitives/Text';
import DoseCard from '@/src/components/medication/DoseCard';
import EmptyState from '@/src/components/common/EmptyState';
import { GlassCard } from '@/src/components/common/GlassCard';
import { Dose } from '@/src/hooks/useTodayDoses';
import { theme } from '@/src/constants/theme';

interface DoseListProps {
  doses: Dose[];
  onLogDose: (dose: Dose, status: 'taken' | 'skipped') => void;
}

export const DoseList: React.FC<DoseListProps> = ({ doses, onLogDose }) => {
  const { t } = useTranslation('home');

  return (
    <View>
      <Text size="large" weight="bold" style={styles.subHeader}>{t('todays_doses')}</Text>
      {doses.length === 0 ? (
        <GlassCard intensity={20} padding="md" elevation="level1">
          <EmptyState
            icon="checkmark-circle-outline"
            title={t('all_caught_up')}
            description={t('no_doses_today')}
            style={styles.emptyState}
          />
        </GlassCard>
      ) : (
        <View style={styles.doseList}>
          {doses.map((dose) => (
            <DoseCard
              key={`${dose.medication.id}-${dose.scheduledTime}`}
              {...dose}
              onTake={() => onLogDose(dose, 'taken')}
              onSkip={() => onLogDose(dose, 'skipped')}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textPrimary,
  },
  doseList: {
    gap: theme.spacing.sm,
  },
  emptyState: {
    minHeight: 150,
  },
});
