import { subHours } from 'date-fns';
import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { logger } from '../../utils/logger';

// As per the spec, a dose is missed if the scheduled time + grace period elapses with no action.
// We'll define a 2-hour grace period.
const GRACE_PERIOD_IN_HOURS = 2;

/**
 * MissedDoseDetector
 * Detects missed medication doses and updates the database.
 */
export class MissedDoseDetector {
    private doseLogRepository: DoseLogRepository;

    constructor(doseLogRepository: DoseLogRepository) {
        this.doseLogRepository = doseLogRepository;
    }

    /**
     * Checks for doses that were scheduled but not taken and marks them as 'missed'.
     * A dose is considered missed if it has not been taken within the grace period
     * after its scheduled time.
     */
    async detect(): Promise<void> {
        logger.log('Checking for missed doses...');

        const now = new Date();
        const missedThreshold = subHours(now, GRACE_PERIOD_IN_HOURS);

        try {
            // Fetch all doses that are still pending (i.e., 'skipped' status).
            // This is the initial status set by the NotificationScheduler.
            const pendingDoses = await this.doseLogRepository.findByStatus('skipped');

            const missedDoses = pendingDoses.filter(
                (dose) => dose.scheduled_time < missedThreshold.getTime()
            );

            if (missedDoses.length === 0) {
                logger.log('No missed doses found.');
                return;
            }

            logger.log(`Found ${missedDoses.length} missed doses. Updating their status...`);

            // Use Promise.all to update all missed doses concurrently.
            await Promise.all(
                missedDoses.map((dose) =>
                    this.doseLogRepository.update(dose.id, { status: 'missed' })
                )
            );

            logger.log(`Successfully updated ${missedDoses.length} doses to 'missed'.`);
        } catch (error) {
            logger.error('Error while detecting missed doses:', error);
            // Re-throwing the error so the caller (e.g., a background job runner) knows the task failed.
            throw error;
        }
    }
}
