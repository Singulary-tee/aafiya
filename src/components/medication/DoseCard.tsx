
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Medication } from '../../database/models/Medication';
import { theme } from '../../constants/theme';
import { GlassCard } from '../common/GlassCard';
import Button from '../common/Button';
import { Text } from '../primitives/Text';
import { triggerHapticFeedback } from '../../utils/animations';

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

  const handleTake = () => {
    triggerHapticFeedback('success');
    onTake();
  };

  const handleSkip = () => {
    triggerHapticFeedback('medium');
    onSkip();
  };

  // Status styles sourced from theme
  const statusStyles = {
    taken: {
      bar: { backgroundColor: theme.colors.success },
      text: { color: theme.colors.success },
    },
    missed: {
      bar: { backgroundColor: theme.colors.error },
      text: { color: theme.colors.error },
    },
    skipped: {
      bar: { backgroundColor: theme.colors.warning },
      text: { color: theme.colors.warning },
    },
    pending: { 
      bar: { backgroundColor: theme.colors.primary },
      text: {} 
    },
  };

  const { bar, text } = statusStyles[status];

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <GlassCard intensity={20} padding="md" elevation="level1" style={styles.card}>
        <View style={[styles.statusBar, bar]} />
        <View style={styles.content}>
          <View style={styles.details}>
            <Text size="small" style={styles.time}>{scheduledTime}</Text>
            <Text size="medium" weight="bold" style={styles.name}>{medication.name}</Text>
            <Text size="small" style={styles.strength}>{medication.strength}</Text>
          </View>
          {status === 'pending' ? (
            <View style={styles.actions}>
              <Button title={t('buttons.take')} onPress={handleTake} variant="primary" style={styles.button} />
              <Button title={t('buttons.skip')} onPress={handleSkip} variant="secondary" style={styles.button} />
            </View>
          ) : status === 'taken' ? (
            <Animated.View entering={ZoomIn.duration(300)}>
              <Text size="medium" weight="bold" style={text}>{t(`status.${status}`)}</Text>
            </Animated.View>
          ) : (
            <Text size="medium" weight="bold" style={text}>{t(`status.${status}`)}</Text>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
    marginRight: theme.spacing.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  time: {
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  name: {
    marginVertical: 4,
    color: theme.colors.textPrimary,
  },
  strength: {
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  button: {
    minWidth: 80,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
});

export default DoseCard;
