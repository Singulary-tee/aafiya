import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { openDatabase } from '../../database';
import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { ScheduleRepository } from '../../database/repositories/ScheduleRepository';
import { logger } from '../../utils/logger';
import { MissedDoseDetector } from './MissedDoseDetector';

const MISSED_DOSE_TASK = 'missed-dose-detection';

TaskManager.defineTask(MISSED_DOSE_TASK, async () => {
  try {
    const db = await openDatabase();
    const detector = new MissedDoseDetector(
      new DoseLogRepository(db),
      new ScheduleRepository(db)
    );

    await detector.detect();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    logger.error('Missed dose background task failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerMissedDoseBackgroundTask = async (): Promise<void> => {
  const status = await BackgroundFetch.getStatusAsync();
  if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
    logger.warn('Background fetch is unavailable. Skipping missed dose task registration.');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(MISSED_DOSE_TASK);
  if (isRegistered) {
    return;
  }

  await BackgroundFetch.registerTaskAsync(MISSED_DOSE_TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
};
