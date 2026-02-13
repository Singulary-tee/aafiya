
import * as Notifications from 'expo-notifications';
import { Schedule } from '../../database/models/Schedule';
import { Medication } from '../../database/models/Medication';
import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { logger } from '../../utils/logger';
import { DoseLog } from '../../database/models/DoseLog';
import { addDays, setHours, setMinutes, setSeconds } from 'date-fns';

const NOTIFICATION_CATEGORY_ID = 'medication-reminder';

/**
 * Manages the scheduling and cancellation of local notifications for medication reminders.
 */
export class NotificationScheduler {
    private doseLogRepository: DoseLogRepository;

    constructor(doseLogRepository: DoseLogRepository) {
        this.doseLogRepository = doseLogRepository;
    }

    /**
     * Schedules notifications for a given medication according to its schedule.
     * It also creates corresponding dose logs.
     * @param medication The medication to schedule notifications for.
     * @param schedule The schedule to base the notifications on.
     */
    async scheduleNotifications(medication: Medication, schedule: Schedule): Promise<void> {
        const now = new Date();
        // Schedule for the next 30 days
        for (let day = 0; day < 30; day++) {
            const scheduleDate = addDays(now, day);
            const dayOfWeek = scheduleDate.getDay(); // Sunday = 0, Monday = 1, etc.

            // If the schedule is for specific days, check if the current day is one of them
            if (schedule.days_of_week && !schedule.days_of_week.includes(dayOfWeek)) {
                continue;
            }

            for (const time of schedule.times) {
                const [hour, minute] = time.split(':').map(Number);
                let notificationDate = setSeconds(setMinutes(setHours(scheduleDate, hour), minute), 0);

                if (notificationDate < now) {
                    continue; // Do not schedule for past times
                }

                // Create a dose log for this scheduled time if one doesn't already exist
                let doseLog = await this.doseLogRepository.findByMedicationAndScheduledTime(medication.id, notificationDate.getTime());
                if (!doseLog) {
                    doseLog = await this.doseLogRepository.create({
                        medication_id: medication.id,
                        schedule_id: schedule.id,
                        scheduled_time: notificationDate.getTime(),
                        status: 'skipped', // Default status
                        actual_time: null,
                        notes: null,
                    });
                }

                const notificationId = await this.scheduleSingleNotification(medication, notificationDate, doseLog);
                logger.log(`Scheduled notification ${notificationId} for ${medication.name} at ${notificationDate}.`);
            }
        }
    }

    /**
     * Schedules a single notification.
     * @param medication The medication for the notification.
     * @param date The date and time for the notification.
     * @param doseLog The corresponding dose log.
     * @returns The ID of the scheduled notification.
     */
    private async scheduleSingleNotification(medication: Medication, date: Date, doseLog: DoseLog): Promise<string> {
        return await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Time for your medication!',
                body: `Don't forget to take ${medication.name}.`,
                sound: 'default',
                data: {
                    medicationId: medication.id,
                    doseLogId: doseLog.id,
                },
                categoryIdentifier: NOTIFICATION_CATEGORY_ID,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE, 
                date: date,
            }
        });
    }

    /**
     * Cancels all scheduled notifications for a given medication.
     * @param medicationId The ID of the medication.
     */
    async cancelNotifications(medicationId: string): Promise<void> {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        let cancelCount = 0;

        for (const notification of scheduledNotifications) {
            if (notification.content.data?.medicationId === medicationId) {
                await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                cancelCount++;
            }
        }

        if (cancelCount > 0) {
            logger.log(`Cancelled ${cancelCount} notifications for medication ID ${medicationId}.`);
        }
    }
}
