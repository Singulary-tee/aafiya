
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { useProfile } from '@/src/hooks/useProfile';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { ScheduleRepository } from '@/src/database/repositories/ScheduleRepository';
import { Medication } from '@/src/database/models/Medication';
import { Schedule } from '@/src/database/models/Schedule';
import { logger } from '@/src/utils/logger';
import { useTranslation } from 'react-i18next';

export default function AddMedicationScreen() {
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [initialCount, setInitialCount] = useState('');
  const [time, setTime] = useState('09:00'); // Simplified to one time

  const { db, isLoading: isDbLoading } = useDatabase();
  const router = useRouter();
  const { activeProfile } = useProfile();
  const { t } = useTranslation(['medications']);

  const handleAddMedication = async () => {
    logger.log('Attempting to add medication...');
    if (!db || !activeProfile || !name.trim() || !initialCount.trim() || !time.trim()) {
      logger.error('Validation failed', { hasDb: !!db, hasProfile: !!activeProfile, name, initialCount, time });
      return;
    }

    try {
      const medicationRepo = new MedicationRepository(db);
      const scheduleRepo = new ScheduleRepository(db);

      const newMedication: Omit<Medication, 'id' | 'created_at' | 'updated_at'> = {
        profile_id: activeProfile.id,
        name,
        strength,
        initial_count: parseInt(initialCount, 10),
        current_count: parseInt(initialCount, 10),
        is_active: 1,
        rxcui: null,
        generic_name: null,
        brand_name: null,
        dosage_form: null,
        image_url: null,
        notes: null,
      };

      logger.log('Creating medication:', newMedication);
      const createdMedication = await medicationRepo.create(newMedication);
      logger.log('Created medication:', createdMedication);


      if (!createdMedication || !createdMedication.id) {
        logger.error('Medication creation failed, returned medication is invalid.', createdMedication);
        return;
      }


      const newSchedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'> = {
        medication_id: createdMedication.id,
        times: [time],
        days_of_week: null, // For simplicity, daily
        grace_period_minutes: 15,
        is_active: 1,
        notification_sound: null,
      };

      logger.log('Creating schedule:', newSchedule);
      await scheduleRepo.create(newSchedule as Schedule);
      logger.log('Schedule created');

      router.replace('/(tabs)/medications');
    } catch (error) {
      logger.error('Error adding medication:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('add_medication_title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('medication_name_placeholder')}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder={t('strength_placeholder')}
        value={strength}
        onChangeText={setStrength}
      />
      <TextInput
        style={styles.input}
        placeholder={t('initial_count_placeholder')}
        value={initialCount}
        onChangeText={setInitialCount}
        keyboardType="numeric"
      />
       <TextInput
        style={styles.input}
        placeholder={t('time_placeholder')}
        value={time}
        onChangeText={setTime}
      />
      <Button title={t('add_medication')} onPress={handleAddMedication} disabled={isDbLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
