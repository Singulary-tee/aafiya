import { useProfile } from '@/src/hooks/useProfile';
import { logger } from '@/src/utils/logger';
import { validateCount, validateMedicationName, validateScheduleTimes } from '@/src/utils/validation';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Hook Import
import { useMedications } from '@/src/hooks/useMedications';
import { useNotifications } from '@/src/hooks/useNotifications';

// API Imports
import Button from '@/src/components/common/Button';
import { Text } from '@/src/components/primitives/Text';
import { TextInput } from '@/src/components/primitives/TextInput';
import { theme } from '@/src/constants/theme';
import { ApiCacheRepository } from '@/src/database/repositories/ApiCacheRepository';
import { useDatabase } from '@/src/hooks/useDatabase';
import { RxNormService } from '@/src/services/api/RxNormService';
import { DrugConcept, RxNormConceptGroup } from '@/src/types/api';
import { MedicationGroup } from '@/src/types/medication';
import { groupMedications } from '@/src/utils/medicationGrouping';

const debounce = <T extends (...args: any[]) => void>(fn: T, delayMs: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
};

export default function AddMedicationScreen() {
  const [entryMode, setEntryMode] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MedicationGroup[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<DrugConcept | null>(null);
  const [manualName, setManualName] = useState('');
  const [isManualConfirmed, setIsManualConfirmed] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [strength, setStrength] = useState('');
  const [initialCount, setInitialCount] = useState('');
  const [scheduleType, setScheduleType] = useState<'times' | 'interval'>('interval');
  const [times, setTimes] = useState<string[]>(['09:00']);
  const [timeInput, setTimeInput] = useState('09:00');
  const [intervalHours, setIntervalHours] = useState('8');
  const [intervalStartTime, setIntervalStartTime] = useState('08:00');

  const router = useRouter();
  const { activeProfile } = useProfile();
  const { db, isLoading: isDbLoading } = useDatabase();
  const { schedule } = useNotifications();
  const { t } = useTranslation(['medications']);

  const { addMedication, isLoading: isAddingMedication } = useMedications(activeProfile?.id || null);

  const hasSelection = useMemo(() => Boolean(selectedDrug || isManualConfirmed), [selectedDrug, isManualConfirmed]);
  const selectedName = useMemo(() => selectedDrug?.name ?? manualName.trim(), [selectedDrug, manualName]);

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
        // Get all concepts from the API
        const concepts = results?.drugGroup.conceptGroup?.flatMap((cg: RxNormConceptGroup) => cg.conceptProperties).filter((c): c is DrugConcept => !!c) || [];
        // Group medications by base name
        const grouped = groupMedications(concepts);
        setSearchResults(grouped);

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
    if (entryMode === 'search') {
      debouncedSearch(searchQuery);
    }
  }, [searchQuery, debouncedSearch, entryMode]);

  const resetSelection = () => {
    setSelectedDrug(null);
    setSearchQuery('');
    setSearchResults([]);
    setManualName('');
    setIsManualConfirmed(false);
    setFormError(null);
  };

  const handleModeChange = (mode: 'search' | 'manual') => {
    if (mode === entryMode) return;
    setEntryMode(mode);
    resetSelection();
  };

  const handleSelectDrug = (drug: DrugConcept) => {
    setSelectedDrug(drug);
    setSearchQuery(drug.name);
    setSearchResults([]);
  };

  const handleSelectMedicationGroup = (group: MedicationGroup) => {
    if (group.variantCount === 1) {
      // Only one variant, select it directly
      handleSelectDrug(group.variants[0]);
    } else {
      // Multiple variants, navigate to variant selection
      router.push({
        pathname: '/medications/variants',
        params: { 
          groupName: group.baseName,
          variants: JSON.stringify(group.variants)
        }
      });
    }
  };

  const handleAddTime = () => {
    const normalized = timeInput.trim();
    if (!validateScheduleTimes([normalized])) {
      setFormError(t('error_invalid_time'));
      return;
    }
    setFormError(null);
    setTimes((prev: string[]) => Array.from(new Set([...prev, normalized])).sort());
  };

  const handleRemoveTime = (time: string) => {
    setTimes((prev: string[]) => prev.filter((t) => t !== time));
  };

  const parseTimeToMinutes = (time: string): number | null => {
    if (!validateScheduleTimes([time])) return null;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatMinutesToTime = (totalMinutes: number) => {
    const normalized = ((totalMinutes % 1440) + 1440) % 1440;
    const hours = Math.floor(normalized / 60);
    const minutes = normalized % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const buildIntervalTimes = (startTime: string, everyHours: number): string[] | null => {
    const startMinutes = parseTimeToMinutes(startTime);
    if (startMinutes === null || !Number.isInteger(everyHours) || everyHours <= 0 || everyHours > 24) {
      return null;
    }

    const stepMinutes = everyHours * 60;
    const generated: string[] = [];
    for (let minutes = startMinutes; minutes < startMinutes + 1440; minutes += stepMinutes) {
      generated.push(formatMinutesToTime(minutes));
    }
    return Array.from(new Set(generated));
  };

  const handleAddMedication = async () => {
    setFormError(null);

    if (!activeProfile?.id) {
      setFormError(t('error_no_profile'));
      return;
    }

    if (!selectedName || !validateMedicationName(selectedName)) {
      setFormError(t('error_invalid_name'));
      return;
    }

    const parsedCount = Number.parseInt(initialCount, 10);
    if (Number.isNaN(parsedCount) || !validateCount(parsedCount)) {
      setFormError(t('error_invalid_count'));
      return;
    }

    let scheduleTimes: string[] | null = null;
    if (scheduleType === 'times') {
      scheduleTimes = times;
    } else {
      const parsedInterval = Number.parseInt(intervalHours, 10);
      scheduleTimes = buildIntervalTimes(intervalStartTime, parsedInterval);
    }

    if (!scheduleTimes || !validateScheduleTimes(scheduleTimes)) {
      setFormError(t('error_invalid_schedule'));
      return;
    }

    const medicationData = { strength, initialCount, scheduleTimes, gracePeriodMinutes: 30 };
    const selectedSeed = { name: selectedName, rxcui: selectedDrug?.rxcui ?? null };

    const result = await addMedication(selectedSeed, medicationData);

    if (result) {
      try {
        await schedule(result.medication, result.schedules, activeProfile.id);
      } catch (error) {
        logger.error('Failed to schedule notifications for medication.', error);
      }
      router.replace('/(tabs)/medications');
    }
  };

  const renderSearchResult = ({ item }: { item: MedicationGroup }) => (
    <TouchableOpacity 
      style={styles.resultItem} 
      onPress={() => handleSelectMedicationGroup(item)}
    >
      <View style={styles.resultContent}>
        <Text size="body" weight="medium">{item.baseName}</Text>
        {item.variantCount > 1 && (
          <View style={styles.variantInfo}>
            <Text size="small" style={styles.variantText}>
              {t('forms_available', { count: item.variantCount })}
            </Text>
            <View style={styles.badge}>
              <Text size="small" weight="bold" style={styles.badgeText}>
                {item.variantCount}
              </Text>
            </View>
          </View>
        )}
      </View>
      {item.variantCount > 1 && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!hasSelection ? (
        <View style={styles.searchContainer}>
          <Text style={styles.title} size="title" weight="bold">{t('add_medication_title')}</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, entryMode === 'search' && styles.modeButtonActive]}
              onPress={() => handleModeChange('search')}
            >
              <Text style={[styles.modeButtonText, entryMode === 'search' && styles.modeButtonTextActive]}>
                {t('search_mode')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, entryMode === 'manual' && styles.modeButtonActive]}
              onPress={() => handleModeChange('manual')}
            >
              <Text style={[styles.modeButtonText, entryMode === 'manual' && styles.modeButtonTextActive]}>
                {t('manual_mode')}
              </Text>
            </TouchableOpacity>
          </View>
          {entryMode === 'search' ? (
            <>
              <TextInput
                placeholder={t('medication_name_placeholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {isSearching && <ActivityIndicator style={styles.loader} />}
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item: MedicationGroup) => item.baseName}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={!isSearching && searchQuery.length >= 3 ? (
                  <Text style={styles.helperText}>{t('no_search_results')}</Text>
                ) : null}
              />
            </>
          ) : (
            <>
              <TextInput
                placeholder={t('manual_name_placeholder')}
                value={manualName}
                onChangeText={setManualName}
              />
              {formError && <Text style={styles.errorText}>{formError}</Text>}
              <Button
                title={t('continue')}
                onPress={() => {
                  if (!validateMedicationName(manualName.trim())) {
                    setFormError(t('error_invalid_name'));
                    return;
                  }
                  setFormError(null);
                  setIsManualConfirmed(true);
                }}
                disabled={!manualName.trim()}
              />
            </>
          )}
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.title} size="title" weight="bold">{t('confirm_medication')}</Text>
          {selectedDrug ? (
            <Text style={styles.selectedDrugName} size="subheading" weight="bold">{selectedDrug.name}</Text>
          ) : (
            <TextInput
              placeholder={t('manual_name_placeholder')}
              value={manualName}
              onChangeText={setManualName}
            />
          )}
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

          <Text style={styles.sectionTitle} size="body" weight="bold">{t('schedule_type_label')}</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, scheduleType === 'times' && styles.modeButtonActive]}
              onPress={() => setScheduleType('times')}
            >
              <Text style={[styles.modeButtonText, scheduleType === 'times' && styles.modeButtonTextActive]}>
                {t('schedule_specific_times')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, scheduleType === 'interval' && styles.modeButtonActive]}
              onPress={() => setScheduleType('interval')}
            >
              <Text style={[styles.modeButtonText, scheduleType === 'interval' && styles.modeButtonTextActive]}>
                {t('schedule_interval')}
              </Text>
            </TouchableOpacity>
          </View>

          {scheduleType === 'times' ? (
            <View style={styles.scheduleBlock}>
              <TextInput
                placeholder={t('time_placeholder')}
                value={timeInput}
                onChangeText={setTimeInput}
              />
              <Button title={t('add_time')} onPress={handleAddTime} />
              <View style={styles.timesList}>
                {times.map((time) => (
                  <View key={time} style={styles.timeRow}>
                    <Text style={styles.timeText}>{time}</Text>
                    <TouchableOpacity onPress={() => handleRemoveTime(time)}>
                      <Text style={styles.removeText}>{t('remove_time')}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.scheduleBlock}>
              <TextInput
                placeholder={t('interval_hours_placeholder')}
                value={intervalHours}
                onChangeText={setIntervalHours}
                keyboardType="numeric"
              />
              <TextInput
                placeholder={t('interval_start_placeholder')}
                value={intervalStartTime}
                onChangeText={setIntervalStartTime}
              />
            </View>
          )}

          {formError && <Text style={styles.errorText}>{formError}</Text>}

          <Button
            title={t('add_medication')}
            onPress={handleAddMedication}
            disabled={isDbLoading || isAddingMedication}
          />
          <Button
            title={t('search_again')}
            onPress={() => {
              resetSelection();
            }}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flex: 1,
  },
  formContainer: {
    paddingBottom: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  resultItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultContent: {
    flex: 1,
  },
  variantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  variantText: {
    color: theme.colors.textSecondary,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: theme.colors.surface,
    fontSize: 12,
  },
  selectedDrugName: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeButtonText: {
    color: theme.colors.textPrimary,
  },
  modeButtonTextActive: {
    color: theme.colors.surface,
  },
  helperText: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  loader: {
    marginVertical: theme.spacing.sm,
  },
  scheduleBlock: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  timesList: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.fontSizes.body,
  },
  removeText: {
    color: theme.colors.accent,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
});
