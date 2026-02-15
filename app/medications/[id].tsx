import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { Medication } from '@/src/database/models/Medication';
import { useTranslation } from 'react-i18next';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';
import PillImage from '@/src/components/medication/PillImage';
import ExpandableSection from '@/src/components/common/ExpandableSection';

export default function MedicationDetailScreen() {
  const { id } = useLocalSearchParams();
  const [medication, setMedication] = useState<Medication | null>(null);
  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();
  const { t } = useTranslation(['medications']);

  useEffect(() => {
    if (!isDbLoading && db && id) {
      const medicationRepo = new MedicationRepository(db);
      medicationRepo.findById(id as string).then(setMedication);
    }
  }, [db, id, isDbLoading]);

  const handleDelete = async () => {
    if (db && id) {
      const medicationRepo = new MedicationRepository(db);
      await medicationRepo.delete(id as string);
      router.back();
    }
  };

  if (isDbLoading || !medication) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Large medication image */}
      <View style={styles.imageContainer}>
        <PillImage imageUrl={medication.image_url ?? undefined} size={120} />
      </View>

      {/* Medication name and basic info */}
      <Text style={styles.name} size="title" weight="bold">
        {medication.name}
      </Text>

      {medication.brand_name && medication.brand_name !== medication.name && (
        <View style={styles.infoRow}>
          <Text size="body" style={styles.label}>{t('brand_name')}</Text>
          <Text size="body" weight="medium">{medication.brand_name}</Text>
        </View>
      )}

      {medication.generic_name && (
        <View style={styles.infoRow}>
          <Text size="body" style={styles.label}>{t('generic_name')}</Text>
          <Text size="body" weight="medium">{medication.generic_name}</Text>
        </View>
      )}

      {medication.dosage_form && (
        <View style={styles.infoRow}>
          <Text size="body" style={styles.label}>{t('form')}</Text>
          <Text size="body" weight="medium">{medication.dosage_form}</Text>
        </View>
      )}

      {medication.strength && (
        <View style={styles.infoRow}>
          <Text size="body" style={styles.label}>{t('strength')}</Text>
          <Text size="body" weight="medium">{medication.strength}</Text>
        </View>
      )}

      <View style={styles.divider} />

      {/* Current count and inventory */}
      <View style={styles.section}>
        <Text size="subheading" weight="bold" style={styles.sectionTitle}>
          {t('storage')}
        </Text>
        <View style={styles.infoRow}>
          <Text size="body" style={styles.label}>{t('current_count')}</Text>
          <Text size="body" weight="bold">{medication.current_count}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text size="body" style={styles.label}>{t('initial_count')}</Text>
          <Text size="body" weight="medium">{medication.initial_count}</Text>
        </View>
      </View>

      {/* Expandable sections for additional information */}
      {medication.notes && (
        <ExpandableSection title={t('usage_information')}>
          <Text size="body">{medication.notes}</Text>
        </ExpandableSection>
      )}

      <View style={styles.buttonContainer}>
        <Button 
          title={t('continue_to_schedule')} 
          onPress={() => router.push(`/medications/edit/${id}`)} 
        />
        <Button 
          title={t('delete')} 
          onPress={handleDelete} 
          variant="secondary" 
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  name: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  section: {
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    color: theme.colors.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.md,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
});