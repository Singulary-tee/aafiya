import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { ScheduleRepository } from '../../database/repositories/ScheduleRepository';
import { HelperPairingRepository } from '../../database/repositories/HelperPairingRepository';
import { ProfileRepository } from '../../database/repositories/ProfileRepository';
import { MedicationRepository } from '../../database/repositories/MedicationRepository';
import { HelperNotificationService } from '../helper/HelperNotificationService';
import { logger } from '../../utils/logger';
import { DoseLog } from '../../database/models/DoseLog';

/**
 * MissedDoseDetector
 * Detects missed medication doses and updates the database.
 */
export class MissedDoseDetector {
    private doseLogRepository: DoseLogRepository;
    private scheduleRepository: ScheduleRepository;
    private helperNotificationService?: HelperNotificationService;

    constructor(
        doseLogRepository: DoseLogRepository, 
        scheduleRepository: ScheduleRepository,
        helperPairingRepository?: HelperPairingRepository,
        profileRepository?: ProfileRepository,
        medicationRepository?: MedicationRepository
    ) {
        this.doseLogRepository = doseLogRepository;
        this.scheduleRepository = scheduleRepository;

        // Initialize helper notification service if repositories are provided
        if (helperPairingRepository && profileRepository && medicationRepository) {
            this.helperNotificationService = new HelperNotificationService(
                helperPairingRepository,
                profileRepository,
                medicationRepository
            );
        }
    }

    /**
     * Checks for doses that were scheduled but not taken and marks them as 'missed'.
     * A dose is considered missed if it has not been taken within the grace period
     * after its scheduled time.
     */
    async detect(): Promise<void> {
        logger.log('Checking for missed doses...');

        const now = Date.now();

        try {
            // Fetch all doses that are still pending.
            const pendingDoses = await this.doseLogRepository.findByStatus('pending');

            const scheduleCache = new Map<string, number>();

            for (const dose of pendingDoses) {
                if (!dose.schedule_id || scheduleCache.has(dose.schedule_id)) {
                    continue;
                }
                const schedule = await this.scheduleRepository.findById(dose.schedule_id);
                scheduleCache.set(dose.schedule_id, schedule?.grace_period_minutes ?? 30);
            }

            const filteredMissedDoses = pendingDoses.filter((dose) => {
                if (!dose.schedule_id) return false;
                const graceMinutes = scheduleCache.get(dose.schedule_id) ?? 30;
                return dose.scheduled_time + graceMinutes * 60 * 1000 < now;
            });

            if (filteredMissedDoses.length === 0) {
                logger.log('No missed doses found.');
                return;
            }

            logger.log(`Found ${filteredMissedDoses.length} missed doses. Updating their status...`);

            // Track successfully updated doses for helper notification
            const successfullyMissedDoses: DoseLog[] = [];

            // Use Promise.allSettled to handle potential errors for individual dose updates.
            const results = await Promise.allSettled(
                filteredMissedDoses.map(async (dose) => {
                    try {
                        await this.doseLogRepository.update(dose.id, { status: 'missed' });
                        successfullyMissedDoses.push(dose);
                    } catch (error) {
                        logger.error(`Failed to update dose ${dose.id} to 'missed'. Deleting orphaned dose log.`, error);
                        // If updating fails (e.g., foreign key constraint), delete the orphaned log.
                        await this.doseLogRepository.delete(dose.id);
                        // Re-throw to mark the promise as rejected
                        throw error;
                    }
                })
            );

            const successfulUpdates = results.filter(result => result.status === 'fulfilled').length;
            const failedUpdates = results.length - successfulUpdates;

            if (successfulUpdates > 0) {
                logger.log(`Successfully updated ${successfulUpdates} doses to 'missed'.`);

                // Notify helpers about missed doses, grouped by profile
                if (this.helperNotificationService) {
                    const dosesByProfile = new Map<string, DoseLog[]>();
                    for (const dose of successfullyMissedDoses) {
                        const doses = dosesByProfile.get(dose.profile_id) || [];
                        doses.push(dose);
                        dosesByProfile.set(dose.profile_id, doses);
                    }

                    // Notify helpers for each profile
                    for (const [profileId, doses] of dosesByProfile) {
                        await this.helperNotificationService.notifyHelpersOfMissedDoses(profileId, doses);
                    }
                }
            }
            if (failedUpdates > 0) {
                logger.warn(`Failed to update and subsequently deleted ${failedUpdates} orphaned dose logs.`);
            }

        } catch (error) {
            logger.error('Error while detecting missed doses:', error);
            // Re-throwing the error so the caller (e.g., a background job runner) knows the task failed.
            throw error;
        }
    }
}
