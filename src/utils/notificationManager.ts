import * as Notifications from 'expo-notifications';
import { Medication } from '../../database/models/Medication';
import { Schedule } from '../../database/models/Schedule';
import { logger } from '../../utils/logger';
import { requestNotificationPermissions } from './NotificationPermissions';

/**
 * Enhanced notification management utilities.
 * Implements:
 * - Cancel ALL existing notifications before creating new ones
 * - Verify scheduling succeeded
 * - Handle permission denial gracefully
 * - Sync with database schedules
 */

/**
 * Safely cancels all notifications for a medication.
 * Returns true if successful, false otherwise.
 */
export async function cancelMedicationNotifications(
  medicationId: string
): Promise<boolean> {
  try {
    // Get all scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    
    // Find notifications for this medication
    const medicationNotificationIds = scheduled
      .filter(notif => notif.content.data?.medicationId === medicationId)
      .map(notif => notif.identifier);
    
    // Cancel each one
    for (const id of medicationNotificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    
    logger.info(`Cancelled ${medicationNotificationIds.length} notifications for medication ${medicationId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to cancel notifications for medication ${medicationId}:`, error);
    return false;
  }
}

/**
 * Cancels all notifications for a user/profile.
 */
export async function cancelAllNotifications(): Promise<boolean> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    logger.info('Cancelled all scheduled notifications');
    return true;
  } catch (error) {
    logger.error('Failed to cancel all notifications:', error);
    return false;
  }
}

/**
 * Schedules notifications for a medication with robust error handling.
 * 1. Checks permissions first
 * 2. Cancels ALL existing notifications for medication
 * 3. Schedules new notifications
 * 4. Verifies each notification was scheduled
 * Returns number of successfully scheduled notifications.
 */
export async function scheduleMedicationNotifications(
  medication: Medication,
  schedules: Schedule[]
): Promise<{ success: boolean; scheduledCount: number; error?: string }> {
  // Step 1: Check permissions
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    const error = 'Notification permissions not granted';
    logger.warn(error);
    return { success: false, scheduledCount: 0, error };
  }
  
  try {
    // Step 2: Cancel ALL existing notifications for this medication
    const cancelled = await cancelMedicationNotifications(medication.id);
    if (!cancelled) {
      logger.warn('Failed to cancel existing notifications, continuing anyway');
    }
    
    // Step 3: Schedule new notifications
    let scheduledCount = 0;
    const errors: string[] = [];
    
    for (const schedule of schedules) {
      if (!schedule.is_active) continue;
      
      for (const time of schedule.times) {
        try {
          const [hour, minute] = time.split(':').map(Number);
          
          // Calculate next occurrence
          const now = new Date();
          const scheduledTime = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour,
            minute,
            0,
            0
          );
          
          // If time has passed today, schedule for tomorrow
          if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
          }
          
          // Check if schedule runs on this day of week
          const dayOfWeek = scheduledTime.getDay();
          if (schedule.days_of_week && !schedule.days_of_week.includes(dayOfWeek)) {
            // Find next valid day
            let daysToAdd = 1;
            for (let i = 1; i <= 7; i++) {
              const testDay = (dayOfWeek + i) % 7;
              if (schedule.days_of_week.includes(testDay)) {
                daysToAdd = i;
                break;
              }
            }
            scheduledTime.setDate(scheduledTime.getDate() + daysToAdd);
          }
          
          // Calculate trigger time
          const triggerSeconds = Math.max(1, (scheduledTime.getTime() - now.getTime()) / 1000);
          
          // Step 4: Schedule and verify
          const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
              title: `Time for ${medication.name}`,
              body: `Take your medication as prescribed`,
              data: {
                medicationId: medication.id,
                scheduleId: schedule.id,
                scheduledTime: scheduledTime.getTime(),
              },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: triggerSeconds,
              repeats: false,
            },
          });
          
          // Verify notification was scheduled
          if (notificationId) {
            scheduledCount++;
            logger.info(`Scheduled notification ${notificationId} for ${medication.name} at ${time}`);
          } else {
            errors.push(`Failed to schedule notification for ${time}`);
          }
        } catch (error) {
          const errorMsg = `Failed to schedule notification for ${medication.name} at ${time}`;
          logger.error(errorMsg, error);
          errors.push(errorMsg);
        }
      }
    }
    
    // Return result
    if (scheduledCount === 0 && errors.length > 0) {
      return { 
        success: false, 
        scheduledCount: 0, 
        error: errors.join('; ') 
      };
    }
    
    return { success: true, scheduledCount };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to schedule medication notifications:', error);
    return { success: false, scheduledCount: 0, error: errorMsg };
  }
}

/**
 * Gets count of scheduled notifications for a medication.
 */
export async function getScheduledNotificationCount(
  medicationId: string
): Promise<number> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.filter(notif => 
      notif.content.data?.medicationId === medicationId
    ).length;
  } catch (error) {
    logger.error('Failed to get scheduled notification count:', error);
    return 0;
  }
}

/**
 * Handles notification permission denial gracefully.
 * Returns user-friendly error message.
 */
export function getPermissionDeniedMessage(): string {
  return 'Notifications are disabled. To receive medication reminders:\n\n' +
         '1. Open device Settings\n' +
         '2. Find this app\n' +
         '3. Enable Notifications';
}
