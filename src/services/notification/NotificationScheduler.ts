import { add, set } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { Medication } from '../../database/models/Medication';
import { Schedule } from '../../database/models/Schedule';
import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { MedicationRepository } from '../../database/repositories/MedicationRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';
import { ScheduleRepository } from '../../database/repositories/ScheduleRepository';
import { logger } from '../../utils/logger';
import { requestNotificationPermissions } from './NotificationPermissions';

const MEDICATION_REMINDER_CATEGORY_ID = 'medication-reminder';
const ACTION_MARK_AS_TAKEN = 'mark-as-taken';
const ACTION_SKIP = 'skip';

/**
 * NotificationScheduler
 * Schedules reminders for medication doses.
 */
export class NotificationScheduler {
    private doseLogRepository: DoseLogRepository;
    private profileRepository: ProfileRepository;
    private medicationRepository: MedicationRepository;
    private scheduleRepository: ScheduleRepository;

    constructor(
        doseLogRepository: DoseLogRepository,
        profileRepository: ProfileRepository,
        medicationRepository: MedicationRepository,
        scheduleRepository: ScheduleRepository
    ) {
        this.doseLogRepository = doseLogRepository;
        this.profileRepository = profileRepository;
        this.medicationRepository = medicationRepository;
        this.scheduleRepository = scheduleRepository;
    }

    /**
     * Configures the notification categories for dose reminders.
     * This should be called once when the app starts.
     */
    static async configureNotificationCategories(): Promise<void> {
        await Notifications.setNotificationCategoryAsync(MEDICATION_REMINDER_CATEGORY_ID, [
            { identifier: ACTION_MARK_AS_TAKEN, buttonTitle: 'Mark as Taken', options: { opensAppToForeground: true } },
            { identifier: ACTION_SKIP, buttonTitle: 'Skip', options: { opensAppToForeground: true } },
        ]);
    }

    /**
     * Schedules notifications for a given medication and its schedules.
     * It will clear any existing notifications for this medication to avoid duplicates.
     * @param medication The medication to schedule notifications for.
     * @param schedules A list of schedules for the medication.
     * @param profileId The ID of the profile the medication belongs to.
     */
    async schedule(medication: Medication, schedules: Schedule[], profileId: string): Promise<void> {
        const permissionsGranted = await requestNotificationPermissions();
        if (!permissionsGranted) {
            logger.warn('Notification permissions not granted. Skipping scheduling.');
            return;
        }

        await this.cancel(medication.id);

        for (const schedule of schedules) {
            for (const time of schedule.times) {
                const [hour, minute] = time.split(':').map(Number);
                const now = new Date();
                let nextDoseTime = set(now, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });

                if (nextDoseTime < now) {
                    nextDoseTime = add(nextDoseTime, { days: 1 });
                }

                const doseLog = await this.doseLogRepository.create({
                    medication_id: medication.id,
                    schedule_id: schedule.id,
                    profile_id: profileId, 
                    scheduled_time: nextDoseTime.getTime(),
                    status: 'pending',
                    actual_time: null,
                    notes: null,
                });

                const seconds = (nextDoseTime.getTime() - Date.now()) / 1000;
                const dosageForm = medication.dosage_form ? ` ${medication.dosage_form}` : '';
                const strength = medication.strength ? ` ${medication.strength}` : '';
                const doseDetails = `${dosageForm}${strength}`.trim();

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Time for your ${medication.name}`,
                        body: doseDetails.length > 0
                            ? `It's time to take your dose of ${doseDetails}.`
                            : `It's time to take your dose.`,
                        categoryIdentifier: MEDICATION_REMINDER_CATEGORY_ID,
                        data: { doseLogId: doseLog.id },
                        sound: true,
                    },
                    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: seconds > 0 ? seconds : 1, repeats: false },
                });

                logger.log(`Scheduled notification for ${medication.name} at ${nextDoseTime}`);
            }
        }
    }

    /**
     * Cancels all scheduled notifications for a specific medication.
     * @param medicationId The ID of the medication to cancel notifications for.
     */
    async cancel(medicationId: string): Promise<void> {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduled) {
            const doseLogId = notification.content.data?.doseLogId;
            if (doseLogId) {
                const doseLog = await this.doseLogRepository.findById(doseLogId as string);
                if (doseLog?.medication_id === medicationId) {
                    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
                }
            }
        }
    }

    /**
     * Reschedules all notifications for all active medications and profiles.
     * This is useful after a system reboot or app update.
     */
    async rescheduleAll(): Promise<void> {
        logger.log('Rescheduling all notifications...');
        const profiles = await this.profileRepository.findAll();
        for (const profile of profiles) {
            const medications = await this.medicationRepository.findByProfileId(profile.id);
            const activeMedications = medications.filter(med => med.is_active);
            for (const medication of activeMedications) {
                const schedules = await this.scheduleRepository.findByMedicationId(medication.id);
                await this.schedule(medication, schedules, profile.id);
            }
        }
    }
}
