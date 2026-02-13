
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Medication } from '../../database/models/Medication';
import { NEUTRAL_COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONT_SIZES, FONT_WEIGHTS } from '../../constants/typography';
import Card from '../common/Card';
import PillImage from './PillImage';
import { useTranslation } from 'react-i18next';

interface MedicationCardProps {
  medication: Medication;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication }) => {
  const { t } = useTranslation('medications');

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <PillImage imageUrl={medication.image_url || ''} size={80} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{medication.name}</Text>
          <Text style={styles.strength}>{medication.strength}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
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
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    ) : null
)

const styles = StyleSheet.create({
  card: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerText: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: NEUTRAL_COLORS.TEXT_PRIMARY,
  },
  strength: {
    fontSize: FONT_SIZES.body,
    color: NEUTRAL_COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
  },
  infoSection: {
    // styles for the info section
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL_COLORS.DIVIDER,
  },
  infoLabel: {
    fontSize: FONT_SIZES.body,
    color: NEUTRAL_COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZES.body,
    color: NEUTRAL_COLORS.TEXT_PRIMARY,
    fontWeight: FONT_WEIGHTS.medium as any,
    flex: 2,
    textAlign: 'right',
  },
});

export default MedicationCard;
