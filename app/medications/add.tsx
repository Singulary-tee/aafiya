
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { useProfile } from '@/src/hooks/useProfile';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { ScheduleRepository } from '@/src/database/repositories/ScheduleRepository';
import { Medication } from '@/src/database/models/Medication';
import { Schedule } from '@/src/database/models/Schedule';

export default function AddMedicationScreen() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [initialCount, setInitialCount] = useState('');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);

  const db = useDatabase();
  const router = useRouter();
  const { activeProfile } = useProfile();

  const handleNextStep = () => {
    if (name.trim() !== '' && initialCount.trim() !== '') {
      setStep(2);
    }
  };

  const handleAddMedication = async () => {
    if (!db || !activeProfile || times.length === 0) {
      return;
    }

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

    const createdMedication = await medicationRepo.create(newMedication);

    const newSchedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at'> = {
      medication_id: createdMedication.id,
      times,
      days_of_week: daysOfWeek.length > 0 ? daysOfWeek : null,
      grace_period_minutes: 15,
      is_active: 1,
      notification_sound: null,
    };

    await scheduleRepo.create(newSchedule as Schedule);

    router.replace('/(tabs)/medications');
  };

  return (
    <View style={styles.container}>
      {step === 1 && (
        <>
          <Text style={styles.title}>Add Medication</Text>
          <TextInput
            style={styles.input}
            placeholder="Medication Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Strength (e.g., 500mg)"
            value={strength}
            onChangeText={setStrength}
          />
          <TextInput
            style={styles.input}
            placeholder="Initial Count"
            value={initialCount}
            onChangeText={setInitialCount}
            keyboardType="numeric"
          />
          <Button title="Next" onPress={handleNextStep} />
        </>
      )}

      {step === 2 && (
        <>
          <Text style={styles.title}>Set Schedule</Text>
          {/* A simple time and day picker would go here */}
          <Text>Times per day: {times.length}</Text>
          <Text>Days of week: {daysOfWeek.join(', ')}</Text>

          <Button title="Add Medication" onPress={handleAddMedication} />
          <Button title="Back" onPress={() => setStep(1)} />
        </>
      )}
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
