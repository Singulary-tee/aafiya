
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '@/src/components/primitives/Text';
import DoseCard from '@/src/components/medication/DoseCard';
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
      <Text size="title" weight="bold" style={styles.subHeader}>{t('todays_doses')}</Text>
      {doses.map((dose) => (
        <DoseCard
          key={`${dose.medication.id}-${dose.scheduledTime}`}
          {...dose}
          onTake={() => onLogDose(dose, 'taken')}
          onSkip={() => onLogDose(dose, 'skipped')}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  subHeader: {
    marginBottom: theme.spacing.sm,
  },
});
