
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDatabase } from '@/src/hooks/useDatabase';
import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { Medication } from '@/src/database/models/Medication';
import { COLORS } from '@/src/constants/colors';

export default function EditMedicationScreen() {
  const { id } = useLocalSearchParams();
  const [medication, setMedication] = useState<Medication | null>(null);
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [currentCount, setCurrentCount] = useState('');
  const db = useDatabase();
  const router = useRouter();

  useEffect(() => {
    if (db && id) {
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
  }, [db, id]);

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

  if (!medication) {
    return <ActivityIndicator style={styles.centered} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Medication Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.label}>Strength</Text>
      <TextInput
        style={styles.input}
        value={strength}
        onChangeText={setStrength}
      />
      <Text style={styles.label}>Current Count</Text>
      <TextInput
        style={styles.input}
        value={currentCount}
        onChangeText={setCurrentCount}
        keyboardType="numeric"
      />
      <Button title="Update Medication" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
