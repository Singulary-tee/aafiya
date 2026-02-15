
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { Medication } from '@/src/database/models/Medication';
import { useTranslation } from 'react-i18next';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import { TextInput } from '@/src/components/primitives/TextInput';
import Button from '@/src/components/common/Button';
import PillImage from '@/src/components/medication/PillImage';
import ExpandableSection from '@/src/components/common/ExpandableSection';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [currentCount, setCurrentCount] = useState('');
  const [notes, setNotes] = useState('');
  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();
  const { t } = useTranslation(['medications']);

  useEffect(() => {
    if (!isDbLoading && db && id) {
      const medicationRepo = new MedicationRepository(db);
      medicationRepo.findById(id as string).then((med) => {
        if (med) {
          setMedication(med);
          setName(med.name);
          setStrength(med.strength || '');
          setCurrentCount(med.current_count.toString());
          setNotes(med.notes || '');
        }
      });
    }
  }, [db, id, isDbLoading]);

  const handleDelete = () => {
    Alert.alert(
      t('delete_confirmation_title', { name: medication?.name || '' }),
      t('delete_confirmation_message'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            if (db && id) {
              const medicationRepo = new MedicationRepository(db);
              await medicationRepo.delete(id as string);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (db && medication) {
      const medicationRepo = new MedicationRepository(db);
      await medicationRepo.update(medication.id, {
        name,
        strength,
        current_count: parseInt(currentCount, 10),
        notes,
      });
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
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerButtons}>
          <Button
            title={t('delete')}
            onPress={handleDelete}
            variant="secondary"
            style={styles.deleteButton}
          />
          <Button
            title={t('save')}
            onPress={handleUpdate}
            disabled={isDbLoading}
            style={styles.saveButton}
          />
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContentContainer}>
        {/* Medication Image */}
        <View style={styles.imageContainer}>
          <PillImage imageUrl={medication.image_url ?? undefined} size={100} />
        </View>

        {/* Basic Information Section */}
        <View style={styles.section}>
          <Text size="subheading" weight="bold" style={styles.sectionTitle}>
            {t('basic_information')}
          </Text>

          <Text style={styles.label}>{t('medication_name_label')}</Text>
          <Text size="body" weight="medium" style={styles.readOnlyField}>
            {medication.name}
          </Text>

          {medication.dosage_form && (
            <>
              <Text style={styles.label}>{t('form')}</Text>
              <Text size="body" weight="medium" style={styles.readOnlyField}>
                {medication.dosage_form}
              </Text>
            </>
          )}

          <Text style={styles.label}>{t('strength_label')}</Text>
          <TextInput
            style={styles.input}
            value={strength}
            onChangeText={setStrength}
            placeholder={t('strength_placeholder')}
          />
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text size="subheading" weight="bold" style={styles.sectionTitle}>
            {t('storage')}
          </Text>

          <Text style={styles.label}>{t('current_count_label')}</Text>
          <TextInput
            style={styles.input}
            value={currentCount}
            onChangeText={setCurrentCount}
            keyboardType="numeric"
            placeholder={t('current_count_label')}
          />
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('notes')}</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('notes')}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Medication Information (Read-only expandable sections) */}
        {medication.generic_name && (
          <ExpandableSection title={t('generic_name')}>
            <Text size="body">{medication.generic_name}</Text>
          </ExpandableSection>
        )}

        {medication.brand_name && medication.brand_name !== medication.name && (
          <ExpandableSection title={t('brand_name')}>
            <Text size="body">{medication.brand_name}</Text>
          </ExpandableSection>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickyHeader: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  deleteButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: theme.spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.body,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  readOnlyField: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
