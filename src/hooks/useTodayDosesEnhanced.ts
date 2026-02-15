import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDatabase } from './useDatabase';
import { useMedications } from './useMedications';
import { ScheduleRepository } from '../database/repositories/ScheduleRepository';
import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { MedicationRepository } from '../database/repositories/MedicationRepository';
import { Medication } from '../database/models/Medication';
import { logDoseAndDecrementCount } from '../utils/transaction';
import { generateUUID } from '../utils/uuid';
import { logger } from '../utils/logger';

export type Dose = {
  medication: Medication;
  scheduledTime: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  schedule_id: string;
};

/**
 * Hook for managing today's doses with optimistic updates and atomic operations.
 * Implements:
 * - Optimistic UI updates (update UI immediately, revert on error)
 * - Atomic dose logging and pill count decrement (transaction-based)
 * - Pill count validation (prevent taking dose if count is zero)
 */
export const useTodayDosesEnhanced = (profileId: string | null, onDosesChange?: () => void) => {
  const { t } = useTranslation('home');
  const { db } = useDatabase();
  const { medications, refresh: refreshMedications } = useMedications(profileId);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Store previous state for reversion on error
  const previousDosesRef = useRef<Dose[]>([]);

  const loadDoses = useCallback(async () => {
    if (!db || !medications.length || !profileId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
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
      previousDosesRef.current = allDoses;
      setIsLoading(false);

      if (needsScoreRefresh && onDosesChange) {
        onDosesChange();
      }
    } catch (err) {
      logger.error('Failed to load doses:', err);
      setError('Failed to load doses. Please try again.');
      setIsLoading(false);
    }
  }, [db, medications, profileId, t, onDosesChange]);

  useEffect(() => {
    loadDoses();
  }, [loadDoses]);

  /**
   * Logs a dose with optimistic UI updates and atomic operations.
   * 1. Check pill count (prevent if zero)
   * 2. Immediately update UI (optimistic)
   * 3. Save to database in transaction (dose log + decrement count)
   * 4. If save succeeds: keep UI updated, refresh medications
   * 5. If save fails: revert UI to previous state, show error
   */
  const logDose = async (dose: Dose, status: 'taken' | 'skipped'): Promise<boolean> => {
    if (!db || !profileId) return false;
    
    // Check pill count before proceeding
    if (status === 'taken' && dose.medication.current_count <= 0) {
      setError('No pills remaining. Please refill medication.');
      return false;
    }
    
    // Store previous state for potential reversion
    previousDosesRef.current = [...doses];
    
    // Optimistic update: immediately update UI
    const updatedDoses = doses.map(d => 
      d.medication.id === dose.medication.id && d.scheduledTime === dose.scheduledTime
        ? { ...d, status }
        : d
    );
    setDoses(updatedDoses);
    setError(null);

    try {
      const today = new Date();
      const [hour, minute] = dose.scheduledTime.split(':').map(Number);
      const scheduledDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
      const doseLogId = generateUUID();

      if (status === 'taken') {
        // Use atomic transaction for dose logging + pill count decrement
        const result = await logDoseAndDecrementCount(
          db,
          doseLogId,
          {
            profile_id: profileId,
            medication_id: dose.medication.id,
            schedule_id: dose.schedule_id,
            scheduled_time: scheduledDateTime.getTime(),
            actual_time: new Date().getTime(),
            status: status,
            notes: null,
          },
          dose.medication.id
        );

        if (!result.success) {
          throw new Error(result.error || 'Failed to log dose');
        }
        
        logger.info(`Dose logged successfully. New pill count: ${result.data?.newCount}`);
      } else {
        // For skipped doses, just log without decrementing
        const doseLogRepo = new DoseLogRepository(db);
        await doseLogRepo.create({
          profile_id: profileId,
          medication_id: dose.medication.id,
          schedule_id: dose.schedule_id,
          scheduled_time: scheduledDateTime.getTime(),
          actual_time: new Date().getTime(),
          status: status,
          notes: null,
        });
      }

      // Success: refresh medications and trigger callback
      await refreshMedications();
      if (onDosesChange) {
        onDosesChange();
      }
      
      return true;
    } catch (err) {
      // Failure: revert UI to previous state
      logger.error('Failed to log dose:', err);
      setDoses(previousDosesRef.current);
      setError('Failed to record dose. Please try again.');
      return false;
    }
  };

  const canTakeDose = (dose: Dose): { canTake: boolean; reason?: string } => {
    if (dose.medication.current_count <= 0) {
      return { canTake: false, reason: 'Refill needed' };
    }
    return { canTake: true };
  };

  return { 
    doses, 
    isLoading, 
    error,
    logDose, 
    refresh: loadDoses,
    canTakeDose
  };
};
