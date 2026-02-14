
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatabase } from './useDatabase';
import { useMedications } from './useMedications';
import { ScheduleRepository } from '../database/repositories/ScheduleRepository';
import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { Medication } from '../database/models/Medication';

export type Dose = {
  medication: Medication;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  schedule_id: string;
};

export const useTodayDoses = (profileId: string | null, onDosesChange?: () => void) => {
  const { t } = useTranslation('home');
  const { db } = useDatabase();
  const { medications } = useMedications(profileId);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDoses = useCallback(async () => {
    if (!db || !medications.length || !profileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
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
              await doseLogRepo.create({
                profile_id: profileId,
                medication_id: med.id,
                schedule_id: schedule.id,
                scheduled_time: scheduledDateTime.getTime(),
                status: 'missed',
                actual_time: null,
                notes: t('automatically_logged_as_missed'),
              });
              needsScoreRefresh = true;
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
    setDoses(allDoses);
    setIsLoading(false);

    if (needsScoreRefresh && onDosesChange) {
      onDosesChange();
    }
  }, [db, medications, profileId, t, onDosesChange]);

  useEffect(() => {
    loadDoses();
  }, [loadDoses]);

  const logDose = async (dose: Dose, status: 'taken' | 'skipped') => {
    if (!db || !profileId) return;
    const doseLogRepo = new DoseLogRepository(db);

    const today = new Date();
    const [hour, minute] = dose.scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);

    await doseLogRepo.create({
      profile_id: profileId,
      medication_id: dose.medication.id,
      schedule_id: dose.schedule_id,
      scheduled_time: scheduledDateTime.getTime(),
      actual_time: new Date().getTime(),
      status: status,
      notes: null,
    });

    await loadDoses();
    if (onDosesChange) {
      onDosesChange();
    }
  };

  return { doses, isLoading, logDose, refresh: loadDoses };
};
