
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useMedications } from '@/src/hooks/useMedications';
import { useProfile } from '@/src/hooks/useProfile';
import { useTranslation } from 'react-i18next';
import { Medication } from '@/src/database/models/Medication';
import MedicationListItem from '@/src/components/medication/MedicationListItem';
import Button from '@/src/components/common/Button';
import EmptyState from '@/src/components/common/EmptyState';
import { theme } from '@/src/constants/theme';

export default function MedicationsScreen() {
  const { activeProfile } = useProfile();
  const { medications } = useMedications(activeProfile?.id || '');
  const router = useRouter();
  const { t } = useTranslation('medications');

  const handleItemPress = (item: Medication) => {
    router.push(`/medications/${item.id}`);
  };

  const handleAddMedication = () => {
    router.push('/medications/add');
  };

  if (medications.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="medkit-outline"
          title={t('empty_title')}
          description={t('empty_description')}
          tip={t('empty_tip')}
          actionLabel={t('add_medication')}
          onAction={handleAddMedication}
        />
      </View>
    );
  }

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
        onPress={handleAddMedication}
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
