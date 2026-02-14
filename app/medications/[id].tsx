import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { Medication } from '@/src/database/models/Medication';
import { useTranslation } from 'react-i18next';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';

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
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{medication.name}</Text>
      <Text style={styles.strength}>{medication.strength}</Text>
      <Text style={styles.count}>{t('current_count')}{medication.current_count}</Text>
      <Text style={styles.count}>{t('initial_count')}{medication.initial_count}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title={t('edit')} onPress={() => router.push(`/medications/edit/${id}`)} />
        <Button title={t('delete')} onPress={handleDelete} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  name: {
    fontSize: theme.fontSizes.title,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  strength: {
    fontSize: theme.fontSizes.subheading,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  count: {
    fontSize: theme.fontSizes.body,
    marginBottom: theme.spacing.sm,
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});