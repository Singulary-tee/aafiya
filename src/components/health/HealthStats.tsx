
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../constants/typography';
import Card from '../common/Card';

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
          <Text style={styles.statValue}>{`${Math.round(adherence)}%`}</Text>
          <Text style={styles.statLabel}>{t('statistics.adherence')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>{t('statistics.streak')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{missedDoses}</Text>
          <Text style={styles.statLabel}>{t('statistics.missedDoses')}</Text>
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
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZES.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default HealthStats;
