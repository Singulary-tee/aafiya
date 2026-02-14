
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Medication } from '../../database/models/Medication';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import Card from '../common/Card';
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

  const getStatusStyle = () => {
    switch (status) {
      case 'taken':
        return { bar: styles.takenBar, text: styles.takenText };
      case 'missed':
        return { bar: styles.missedBar, text: styles.missedText };
      case 'skipped':
        return { bar: styles.skippedBar, text: styles.skippedText };
      default:
        return { bar: {}, text: {} };
    }
  };

  const { bar, text } = getStatusStyle();

  return (
    <Card style={styles.card}>
      <View style={[styles.statusBar, bar]} />
      <View style={styles.content}>
        <View style={styles.details}>
          <Text size="body" weight="medium" style={styles.time}>{scheduledTime}</Text>
          <Text size="title" weight="bold" style={styles.name}>{medication.name}</Text>
          <Text size="caption" style={styles.dosage}>{medication.strength}</Text>
        </View>
        {status === 'pending' ? (
          <View style={styles.actions}>
            <Button title={t('buttons.take')} onPress={onTake} variant="primary" style={styles.button} />
            <Button title={t('buttons.skip')} onPress={onSkip} variant="secondary" style={styles.button} />
          </View>
        ) : (
          <Text size="body" weight="bold" style={[styles.statusText, text]}>{t(`status.${status}`)}</Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  statusBar: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  time: {
    color: COLORS.textPrimary,
  },
  name: {
    color: COLORS.textPrimary,
    marginVertical: SPACING.xs,
  },
  dosage: {
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    marginLeft: SPACING.sm,
  },
  statusText: {},
  takenBar: {
    backgroundColor: COLORS.healthy,
  },
  takenText: {
    color: COLORS.healthy,
  },
  missedBar: {
    backgroundColor: COLORS.critical,
  },
  missedText: {
    color: COLORS.critical,
  },
  skippedBar: {
    backgroundColor: COLORS.attention,
  },
  skippedText: {
    color: COLORS.attention,
  },
});

export default DoseCard;
