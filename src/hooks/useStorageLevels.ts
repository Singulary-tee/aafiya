
import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from './useDatabase';
import { MedicationRepository } from '../database/repositories/MedicationRepository';
import { ScheduleRepository } from '../database/repositories/ScheduleRepository';
import { StorageCalculatorService } from '../services/health/StorageCalculator';
import { Medication } from '../database/models/Medication';

export type StorageInfo = {
  [medId: string]: number | null;
};

export const useStorageLevels = (medications: Medication[]) => {
  const { db } = useDatabase();
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({});
  const [isLoading, setIsLoading] = useState(true);

  const calculateStorage = useCallback(async () => {
    if (!db || !medications.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const medicationRepo = new MedicationRepository(db);
    const scheduleRepo = new ScheduleRepository(db);
    const storageCalculator = new StorageCalculatorService(medicationRepo, scheduleRepo);
    const info: StorageInfo = {};

    for (const med of medications) {
      const storage = await storageCalculator.getStorageInfo(med.id);
      info[med.id] = storage?.daysRemaining ?? null;
    }

    setStorageInfo(info);
    setIsLoading(false);
  }, [db, medications]);

  useEffect(() => {
    calculateStorage();
  }, [calculateStorage]);

  return { storageInfo, isLoading, refresh: calculateStorage };
};
