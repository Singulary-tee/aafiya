
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Medication } from '../../database/models/Medication';
import { theme } from '../../constants/theme';
import Card from '../common/Card';
import PillImage from './PillImage';
import { useTranslation } from 'react-i18next';
import { Text } from '../primitives/Text';

interface MedicationCardProps {
  medication: Medication;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  const { t } = useTranslation('medications');

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <PillImage imageUrl={medication.image_url} size={80} />
        <View style={styles.headerText}>
          <Text size="title" weight="bold">{medication.name}</Text>
          <Text size="body" style={styles.strength}>{medication.strength}</Text>
        </View>
      </View>

      <View>
        <InfoRow label={t('details.form')} value={medication.dosage_form} />
        <InfoRow label={t('details.quantity')} value={medication.current_count?.toString()} />
        <InfoRow label={t('details.notes')} value={medication.notes} />
      </View>
    </Card>
  );
};

interface InfoRowProps {
    label: string;
    value?: string | null;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
    value ? (
        <View style={styles.infoRow}>
            <Text size="body" style={styles.infoLabel}>{label}</Text>
            <Text size="body" weight="medium">{value}</Text>
        </View>
    ) : null
)

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  strength: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
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
