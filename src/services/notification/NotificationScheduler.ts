import * as Notifications from 'expo-notifications';
import { Schedule } from '../../database/models/Schedule';
import { Medication } from '../../database/models/Medication';

/**
 * NotificationScheduler
 * Schedules medication reminder notifications.
 */
export class NotificationScheduler {

    /**
     * Schedules notifications for a given medication and its schedule.
     * @param medication - The medication to schedule notifications for.
     * @param schedule - The schedule to use for scheduling.
     * @returns A promise that resolves when the notifications have been scheduled.
     */
    async schedule(medication: Medication, schedule: Schedule): Promise<void> {
        // TODO: Implement the actual notification scheduling logic
        // based on the schedule's times and days.
        console.log(`Scheduling notifications for ${medication.name}`);
        return Promise.resolve();
    }

    /**
     * Cancels all scheduled notifications for a given medication.
     * @param medicationId - The ID of the medication to cancel notifications for.
     * @returns A promise that resolves when the notifications have been canceled.
     */
    async cancel(medicationId: string): Promise<void> {
        // TODO: Implement the logic to cancel notifications.
        console.log(`Canceling notifications for medication ${medicationId}`);
        return Promise.resolve();
    }
}
