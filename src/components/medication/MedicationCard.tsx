
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { Medication } from '../../database/models/Medication';
import { GlassCard } from '../common/GlassCard';
import { Text } from '../primitives/Text';
import PillImage from './PillImage';

interface MedicationCardProps {
  medication: Medication;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  const { t } = useTranslation('medications');

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <GlassCard intensity={20} padding="md" elevation="level1" style={styles.card}>
        <View style={styles.header}>
          <PillImage imageUrl={medication.image_url ?? undefined} size={80} />
          <View style={styles.headerText}>
            <Text size="medium" weight="bold">{medication.name}</Text>
            <Text size="small" style={styles.strength}>{medication.strength}</Text>
          </View>
        </View>

        <View>
          <InfoRow label={t('details.form')} value={medication.dosage_form} />
          <InfoRow label={t('details.quantity')} value={medication.current_count?.toString()} />
          <InfoRow label={t('details.notes')} value={medication.notes} />
        </View>
      </GlassCard>
    </Animated.View>
  );
};

interface InfoRowProps {
  label: string;
  value?: string | null;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  value ? (
    <View style={styles.infoRow}>
      <Text size="small" style={styles.infoLabel}>{label}</Text>
      <Text size="medium" weight="regular">{value}</Text>
    </View>
  ) : null
);

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  strength: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  infoLabel: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
});

export default MedicationCard;
