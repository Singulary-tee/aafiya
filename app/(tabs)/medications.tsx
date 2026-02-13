
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useMedications } from '@/src/hooks/useMedications';
import { Medication } from '@/src/database/models/Medication';
import { COLORS } from '@/src/constants/colors';
import { useProfile } from '@/src/hooks/useProfile';

export default function MedicationsScreen() {
  const { activeProfile } = useProfile();
  const { medications } = useMedications(activeProfile?.id || '');
  const router = useRouter();

  const renderMedication = ({ item }: { item: Medication }) => (
    <TouchableOpacity style={styles.medicationItem} onPress={() => router.push(`/medications/${item.id}`)}>
      <View>
        <Text style={styles.medicationName}>{item.name}</Text>
        <Text style={styles.medicationStrength}>{item.strength}</Text>
      </View>
      <Text style={styles.medicationCount}>{item.current_count}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <Button
        title="Add New Medication"
        onPress={() => router.push('/medications/add')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  list: {
    flex: 1,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  medicationStrength: {
    fontSize: 14,
    color: '#666',
  },
  medicationCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
