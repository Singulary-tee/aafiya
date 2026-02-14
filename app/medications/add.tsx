import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '@/src/hooks/useProfile';
import { logger } from '@/src/utils/logger';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

// Hook Import
import { useMedications } from '@/src/hooks/useMedications';

// API Imports
import { RxNormService } from '@/src/services/api/RxNormService';
import { ApiCacheRepository } from '@/src/database/repositories/ApiCacheRepository';
import { DrugConcept, RxNormConceptGroup } from '@/src/types/api';
import { useDatabase } from '@/src/hooks/useDatabase';
import { theme } from '@/src/constants/theme';
import { Text } from '@/src/components/primitives/Text';
import Button from '@/src/components/common/Button';
import { TextInput } from '@/src/components/primitives/TextInput';

export default function AddMedicationScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DrugConcept[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<DrugConcept | null>(null);

  // Form states
  const [strength, setStrength] = useState('');
  const [initialCount, setInitialCount] = useState('');
  const [time, setTime] = useState('09:00');

  const router = useRouter();
  const { activeProfile } = useProfile();
  const { db, isLoading: isDbLoading } = useDatabase();
  const { t } = useTranslation(['medications']);

  const { addMedication, isLoading: isAddingMedication } = useMedications(activeProfile?.id || null);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3 || !db) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const apiCacheRepo = new ApiCacheRepository(db);
        const rxNormService = new RxNormService(apiCacheRepo);
        const results = await rxNormService.findDrugsByName(query);
        // Directly use the concepts from the API without any faulty grouping
        const concepts = results?.drugGroup.conceptGroup?.flatMap((cg: RxNormConceptGroup) => cg.conceptProperties).filter((c): c is DrugConcept => !!c) || [];
        setSearchResults(concepts);

      } catch (error) {
        logger.error('Failed to search for medications:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [db]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSelectDrug = (drug: DrugConcept) => {
    setSelectedDrug(drug);
    setSearchQuery(drug.name);
    setSearchResults([]);
  };

  const handleAddMedication = async () => {
    if (!selectedDrug) return;

    const medicationData = { strength, initialCount, time };
    
    const result = await addMedication(selectedDrug, medicationData);

    if (result) {
      router.replace('/(tabs)/medications');
    }
  };

  const renderSearchResult = ({ item }: { item: DrugConcept }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectDrug(item)}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!selectedDrug ? (
        <>
          <Text style={styles.title}>{t('add_medication_title')}</Text>
          <TextInput
            placeholder={t('medication_name_placeholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching && <ActivityIndicator />}
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.rxcui}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>{t('confirm_medication', 'Confirm Medication')}</Text>
          <Text style={styles.selectedDrugName}>{selectedDrug.name}</Text>
          <TextInput
            placeholder={t('strength_placeholder')}
            value={strength}
            onChangeText={setStrength}
          />
          <TextInput
            placeholder={t('initial_count_placeholder')}
            value={initialCount}
            onChangeText={setInitialCount}
            keyboardType="numeric"
          />
          <TextInput
            placeholder={t('time_placeholder')}
            value={time}
            onChangeText={setTime}
          />
          <Button title={t('add_medication')} onPress={handleAddMedication} disabled={isDbLoading || isAddingMedication} />
          <Button title={t('search_again', 'Search Again')} onPress={() => {
              setSelectedDrug(null);
              setSearchQuery('');
          }} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 24,
    },
    resultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedDrugName: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    }
  });
