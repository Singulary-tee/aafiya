
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { theme } from '../../constants/theme';
import Card from '../common/Card';
import { Text } from '../primitives/Text';

interface HealthStatsProps {
  adherence: number;
  streak: number;
  missedDoses: number;
}

const HealthStats: React.FC<HealthStatsProps> = ({ adherence, streak, missedDoses }) => {
  const { t } = useTranslation('home');

  return (
    <Card>
      <View style={styles.container}>
        <View style={styles.statItem}>
          <Text size="title" weight="bold" style={styles.statValue}>{`${Math.round(adherence)}%`}</Text>
          <Text size="caption" style={styles.statLabel}>{t('statistics.adherence')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text size="title" weight="bold" style={styles.statValue}>{streak}</Text>
          <Text size="caption" style={styles.statLabel}>{t('statistics.streak')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text size="title" weight="bold" style={styles.statValue}>{missedDoses}</Text>
          <Text size="caption" style={styles.statLabel}>{t('statistics.missedDoses')}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.textPrimary,
  },
  statLabel: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});

export default HealthStats;
