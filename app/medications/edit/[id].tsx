
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { Medication } from '@/src/database/models/Medication';
import { useTranslation } from 'react-i18next';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import { TextInput } from '@/src/components/primitives/TextInput';
import Button from '@/src/components/common/Button';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [currentCount, setCurrentCount] = useState('');
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
        }
      });
    }
  }, [db, id, isDbLoading]);

  const handleUpdate = async () => {
    if (db && medication) {
      const medicationRepo = new MedicationRepository(db);
      await medicationRepo.update(medication.id, {
        name,
        strength,
        current_count: parseInt(currentCount, 10),
      });
      router.back();
    }
  };

  if (isDbLoading || !medication) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t('medication_name_label')}</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>{t('strength_label')}</Text>
      <TextInput
        style={styles.input}
        value={strength}
        onChangeText={setStrength}
      />
      <Text style={styles.label}>{t('current_count_label')}</Text>
      <TextInput
        style={styles.input}
        value={currentCount}
        onChangeText={setCurrentCount}
        keyboardType="numeric"
      />
      <Button title={t('update_medication_button')} onPress={handleUpdate} disabled={isDbLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: theme.fontSizes.body,
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
});
