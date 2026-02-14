
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useMedications } from '@/src/hooks/useMedications';
import { useProfile } from '@/src/hooks/useProfile';
import { useTranslation } from 'react-i18next';
import { Medication } from '@/src/database/models/Medication';
import MedicationListItem from '@/src/components/medication/MedicationListItem';
import Button from '@/src/components/common/Button';
import { theme } from '@/src/constants/theme';

export default function MedicationsScreen() {
  const { activeProfile } = useProfile();
  const { medications } = useMedications(activeProfile?.id || '');
  const router = useRouter();
  const { t } = useTranslation('medications');

  const handleItemPress = (item: Medication) => {
    router.push(`/medications/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        renderItem={({ item }) => <MedicationListItem item={item} onPress={() => handleItemPress(item)} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <Button
        title={t('add_medication')}
        onPress={() => router.push('/medications/add')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  list: {
    flex: 1,
  },
});
