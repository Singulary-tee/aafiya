import * as Notifications from 'expo-notifications';
import { DoseLogRepository } from '../database/repositories/DoseLogRepository';
import { openDatabase } from '../database';
import { logger } from './logger';

/**
 * Snooze duration in milliseconds (15 minutes).
 */
export const SNOOZE_DURATION_MS = 15 * 60 * 1000;

/**
 * Snoozes a medication reminder for 15 minutes.
 * Schedules a new notification and logs the dose as "delayed".
 * 
 * @param notificationId The ID of the notification to snooze.
 * @param profileId The profile ID.
 * @param medicationId The medication ID.
 * @param scheduleId The schedule ID.
 * @param scheduledTime The original scheduled time.
 * @param medicationName The name of the medication for the notification.
 * @returns The new notification ID, or null if snooze failed.
 */
export async function snoozeMedicationReminder(
    notificationId: string,
    profileId: string,
    medicationId: string,
    scheduleId: string,
    scheduledTime: number,
    medicationName: string
): Promise<string | null> {
    try {
        // Dismiss the current notification
        await Notifications.dismissNotificationAsync(notificationId);
        
        // Schedule new notification for 15 minutes from now
        const snoozeTime = Date.now() + SNOOZE_DURATION_MS;
        const newNotificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏰ Reminder (Snoozed)',
                body: `Time to take ${medicationName}`,
                data: {
                    type: 'medication_reminder_snoozed',
                    profileId,
                    medicationId,
                    scheduleId,
                    scheduledTime,
                    snoozedAt: Date.now(),
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
                seconds: Math.floor(SNOOZE_DURATION_MS / 1000),
            },
        });
        
        // Log as delayed (not missed)
        const db = await openDatabase();
        const doseLogRepo = new DoseLogRepository(db);
        
        // Check if a log entry already exists for this dose
        const existingLogs = await doseLogRepo.findByScheduleAndDate(
            scheduleId,
            scheduledTime,
            scheduledTime + (24 * 60 * 60 * 1000)
        );
        
        // Only create a delayed log if no entry exists yet
        if (existingLogs.length === 0) {
            await doseLogRepo.create({
                profile_id: profileId,
                medication_id: medicationId,
                schedule_id: scheduleId,
                status: 'delayed',
                scheduled_time: scheduledTime,
                actual_time: null, // Will be filled when actually taken
                notes: `Snoozed for 15 minutes at ${new Date().toLocaleTimeString()}`,
            });
        }
        
        logger.info(`Medication reminder snoozed: ${medicationName}, new notification: ${newNotificationId}`);
        return newNotificationId;
    } catch (error) {
        logger.error('Error snoozing medication reminder:', error);
        return null;
    }
}

/**
 * Handles a snoozed notification action.
 * Called when the user taps the snoozed reminder.
 * 
 * @param notificationResponse The notification response.
 */
export async function handleSnoozedNotification(
    notificationResponse: Notifications.NotificationResponse
): Promise<void> {
    try {
        const { data } = notificationResponse.notification.request.content;
        
        if (data.type === 'medication_reminder_snoozed') {
            logger.info('Snoozed notification tapped:', data);
            // The app should navigate to the dose logging screen
            // This will be handled in the notification listener
        }
    } catch (error) {
        logger.error('Error handling snoozed notification:', error);
    }
}

/**
 * Cancels a snoozed notification.
 * 
 * @param notificationId The ID of the snoozed notification.
 */
export async function cancelSnoozedNotification(notificationId: string): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        logger.info(`Snoozed notification cancelled: ${notificationId}`);
    } catch (error) {
        logger.error('Error cancelling snoozed notification:', error);
    }
}

/**
 * Gets all scheduled snoozed notifications.
 * 
 * @returns Array of scheduled notification objects.
 */
export async function getSnoozedNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        
        // Filter for snoozed medication reminders
        return scheduledNotifications.filter(
            notif => notif.content.data?.type === 'medication_reminder_snoozed'
        );
    } catch (error) {
        logger.error('Error getting snoozed notifications:', error);
        return [];
    }
}

/**
 * Updates a delayed dose to taken status.
 * Should be called when the user actually takes the medication after snoozing.
 * 
 * @param profileId The profile ID.
 * @param medicationId The medication ID.
 * @param scheduleId The schedule ID.
 * @param scheduledTime The original scheduled time.
 */
export async function markDelayedDoseAsTaken(
    profileId: string,
    medicationId: string,
    scheduleId: string,
    scheduledTime: number
): Promise<void> {
    try {
        const db = await openDatabase();
        const doseLogRepo = new DoseLogRepository(db);
        
        // Find the delayed dose log
        const logs = await doseLogRepo.findByScheduleAndDate(
            scheduleId,
            scheduledTime,
            scheduledTime + (24 * 60 * 60 * 1000)
        );
        
        const delayedLog = logs.find(log => log.status === 'delayed');
        
        if (delayedLog) {
            // Update to taken status
            await doseLogRepo.update(delayedLog.id, {
                status: 'taken',
                actual_time: Date.now(),
                notes: (delayedLog.notes || '') + ' | Taken after snooze',
            });
            
            logger.info(`Delayed dose marked as taken: ${medicationId}`);
        }
    } catch (error) {
        logger.error('Error marking delayed dose as taken:', error);
        throw error;
    }
}
