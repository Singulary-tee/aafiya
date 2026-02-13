
import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

import { useProfile } from '@/src/hooks/useProfile';
import { useMedications } from '@/src/hooks/useMedications';
import { useHealthScore } from '@/src/hooks/useHealthScore';
import { useDatabase } from '@/src/hooks/useDatabase';

import HealthCircle from '@/src/components/health/HealthCircle';
import StorageCircle from '@/src/components/health/StorageCircle';
import DoseCard from '@/src/components/medication/DoseCard';
import { DoseLog } from '@/src/database/models/DoseLog';

import { MedicationRepository } from '@/src/database/repositories/MedicationRepository';
import { ScheduleRepository } from '@/src/database/repositories/ScheduleRepository';
import { DoseLogRepository } from '@/src/database/repositories/DoseLogRepository';
import { StorageCalculatorService } from '@/src/services/health/StorageCalculator';
import { COLORS } from '@/src/constants/colors';
import { Medication } from '@/src/database/models/Medication';

type Dose = {
  medication: Medication;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  schedule_id: string;
};

export default function HomeScreen() {
  const { t } = useTranslation('home');
  const { db, isLoading: isDbLoading } = useDatabase();
  const { activeProfile } = useProfile();
  const { medications, isLoading: medsLoading } = useMedications(activeProfile?.id || null);
  const { healthScore, refreshHealthScore } = useHealthScore(activeProfile?.id || null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [todayDoses, setTodayDoses] = useState<Dose[]>([]);

  const refreshScore = useCallback(async () => {
    setScoreLoading(true);
    await refreshHealthScore();
    setScoreLoading(false);
  }, [refreshHealthScore]);

  const loadDoses = useCallback(async () => {
    if (!db || !medications.length || !activeProfile) return;

    const scheduleRepo = new ScheduleRepository(db);
    const doseLogRepo = new DoseLogRepository(db);

    let needsScoreRefresh = false;
    const allDoses: Dose[] = [];
    const today = new Date();
    const dayOfWeek = today.getDay();

    for (const med of medications) {
      const schedules = await scheduleRepo.findByMedicationId(med.id);
      for (const schedule of schedules) {
        const runsToday = !schedule.days_of_week || schedule.days_of_week.includes(dayOfWeek);
        if (runsToday) {
          for (const time of schedule.times) {
            const [hour, minute] = time.split(':').map(Number);
            const scheduledDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

            const existingLog = await doseLogRepo.findByMedicationAndScheduledTime(med.id, scheduledDateTime.getTime());

            let status: Dose['status'] = 'pending';
            if (existingLog) {
              status = existingLog.status as Dose['status'];
            } else if (new Date() > scheduledDateTime) {
              status = 'missed';
              if (activeProfile) { // Added check for activeProfile
                await doseLogRepo.create({
                  profile_id: activeProfile.id,
                  medication_id: med.id,
                  schedule_id: schedule.id,
                  scheduled_time: scheduledDateTime.getTime(),
                  status: 'missed',
                  actual_time: null,
                  notes: t('automatically_logged_as_missed'),
                });
                needsScoreRefresh = true;
              }
            }

            allDoses.push({
              medication: med,
              scheduledTime: time,
              status: status,
              schedule_id: schedule.id,
            });
          }
        }
      }
    }
    allDoses.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    setTodayDoses(allDoses);

    if (needsScoreRefresh) {
      refreshScore();
    }
  }, [medications, db, refreshScore, activeProfile, t]);

  useEffect(() => {
    loadDoses();
  }, [loadDoses]);

  const handleLogDose = async (dose: Dose, status: 'taken' | 'skipped') => {
    if (!db || !activeProfile) return;
    const doseLogRepo = new DoseLogRepository(db);

    const today = new Date();
    const [hour, minute] = dose.scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

    await doseLogRepo.create({
      profile_id: activeProfile.id,
      medication_id: dose.medication.id,
      schedule_id: dose.schedule_id,
      scheduled_time: scheduledDateTime.getTime(),
      actual_time: new Date().getTime(),
      status: status,
      notes: null,
    });

    await loadDoses(); // Refresh doses
    await refreshScore(); // Refresh health score
  };

  const [storageInfo, setStorageInfo] = React.useState<{[medId: string]: number | null}>({});

  React.useEffect(() => {
    if (!db || !medications.length) return;

    const fetchStorageInfo = async () => {
      const medicationRepo = new MedicationRepository(db);
      const scheduleRepo = new ScheduleRepository(db);
      const storageCalculator = new StorageCalculatorService(medicationRepo, scheduleRepo);
      const info: { [medId: string]: number | null } = {};
      for (const med of medications) {
        const storage = await storageCalculator.getStorageInfo(med.id);
        info[med.id] = storage?.daysRemaining ?? null;
      }
      setStorageInfo(info);
    };

    fetchStorageInfo();
  }, [medications, db]);


  if (isDbLoading || medsLoading || scoreLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (!activeProfile) {
    return (
      <View style={styles.centered}>
        <Text>{t('no_active_profile')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>{t('welcome')}, {activeProfile.name}</Text>

      <View style={styles.topSection}>
        <HealthCircle score={healthScore} size={150} />
        <View style={styles.storageSection}>
          <Text style={styles.subHeader}>{t('storage_levels')}</Text>
          {medications.map(med => (
            <View key={med.id} style={styles.storageItem}>
              <Text style={styles.medName}>{med.name}</Text>
              <StorageCircle daysRemaining={storageInfo[med.id] ?? 0} size="small" />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dosesSection}>
        <Text style={styles.subHeader}>{t('todays_doses')}</Text>
        {todayDoses.map((dose) => (
          <DoseCard
            key={`${dose.medication.id}-${dose.scheduledTime}`}
            {...dose}
            onTake={() => handleLogDose(dose, 'taken')}
            onSkip={() => handleLogDose(dose, 'skipped')}
          />
        ))}
      </View>
    </ScrollView>
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
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  storageSection: {
    flex: 1,
    marginLeft: 16,
  },
  storageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medName: {
    fontSize: 16,
  },
  dosesSection: {
    // Add styles if needed
  },
});
