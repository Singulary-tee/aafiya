
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Medication } from '../../database/models/Medication';
import { theme } from '../../constants/theme';
import { GlassCard } from '../common/GlassCard';
import Button from '../common/Button';
import { Text } from '../primitives/Text';

type DoseStatus = 'pending' | 'taken' | 'missed' | 'skipped';

interface DoseCardProps {
  medication: Medication;
  scheduledTime: string;
  status: DoseStatus;
  onTake: () => void;
  onSkip: () => void;
}

const DoseCard: React.FC<DoseCardProps> = ({ medication, scheduledTime, status, onTake, onSkip }) => {
  const { t } = useTranslation('common');

  // Status styles are now sourced from the theme
  const statusStyles = {
    taken: {
      bar: { backgroundColor: theme.colors.healthy },
      text: { color: theme.colors.healthy },
    },
    missed: {
      bar: { backgroundColor: theme.colors.critical },
      text: { color: theme.colors.critical },
    },
    skipped: {
      bar: { backgroundColor: theme.colors.attention },
      text: { color: theme.colors.attention },
    },
    pending: { 
      bar: { backgroundColor: theme.colors.primary },
      text: {} 
    },
  };

  const { bar, text } = statusStyles[status];

  return (
    <GlassCard variant="surface" shadow="medium" style={styles.card}>
      <View style={[styles.statusBar, bar]} />
      <View style={styles.content}>
        <View style={styles.details}>
          <Text size="caption" style={styles.time}>{scheduledTime}</Text>
          <Text size="title" weight="bold" style={styles.name}>{medication.name}</Text>
          <Text size="caption" style={styles.strength}>{medication.strength}</Text>
        </View>
        {status === 'pending' ? (
          <View style={styles.actions}>
            <Button title={t('buttons.take')} onPress={onTake} variant="primary" style={styles.button} />
            <Button title={t('buttons.skip')} onPress={onSkip} variant="secondary" style={styles.button} />
          </View>
        ) : (
          <Text size="body" weight="bold" style={text}>{t(`status.${status}`)}</Text>
        )}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  time: {
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.xs / 2,
  },
  name: {
    marginVertical: theme.spacing.xs / 2,
    color: theme.colors.textPrimary,
  },
  strength: {
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  button: {
    minWidth: 80,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
});

export default DoseCard;
