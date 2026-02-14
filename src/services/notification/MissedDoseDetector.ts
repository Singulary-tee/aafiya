import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { ScheduleRepository } from '../../database/repositories/ScheduleRepository';
import { logger } from '../../utils/logger';

/**
 * MissedDoseDetector
 * Detects missed medication doses and updates the database.
 */
export class MissedDoseDetector {
    private doseLogRepository: DoseLogRepository;
    private scheduleRepository: ScheduleRepository;

    constructor(doseLogRepository: DoseLogRepository, scheduleRepository: ScheduleRepository) {
        this.doseLogRepository = doseLogRepository;
        this.scheduleRepository = scheduleRepository;
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

            // Use Promise.allSettled to handle potential errors for individual dose updates.
            const results = await Promise.allSettled(
                filteredMissedDoses.map(async (dose) => {
                    try {
                        await this.doseLogRepository.update(dose.id, { status: 'missed' });
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
