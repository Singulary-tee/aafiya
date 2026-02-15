
import { DoseLogRepository } from '../../database/repositories/DoseLogRepository';
import { HealthMetricsRepository } from '../../database/repositories/HealthMetricsRepository';
import { NOTIFICATION_CONFIG, HEALTH_SCORE_CONFIG } from '../../constants/config';
import { HealthMetrics } from '../../database/models/HealthMetrics';
import { logger } from '../../utils/logger';

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;
const GRACE_PERIOD_MS = NOTIFICATION_CONFIG.DEFAULT_GRACE_PERIOD_MINUTES * 60 * 1000;

/**
 * Service for calculating and managing a user's health score.
 * The health score is a gamified metric representing medication adherence.
 * 
 * NOTE: For new implementations, prefer using the utility functions in
 * src/utils/healthScore.ts which include support for delayed doses and
 * updated scoring logic. This service is maintained for backward compatibility.
 */
export class HealthScoreCalculatorService {
    private doseLogRepository: DoseLogRepository;
    private healthMetricsRepository: HealthMetricsRepository;

    constructor(
        doseLogRepository: DoseLogRepository,
        healthMetricsRepository: HealthMetricsRepository
    ) {
        this.doseLogRepository = doseLogRepository;
        this.healthMetricsRepository = healthMetricsRepository;
    }

    /**
     * Calculates and saves the health score for a given profile.
     * The score is based on medication adherence over the last 30 days.
     * @param profileId The ID of the profile to calculate the score for.
     * @returns The updated health metrics for the profile.
     */
    async calculateAndSave(profileId: string): Promise<HealthMetrics> {
        const endTimestamp = Date.now();
        const startTimestamp = endTimestamp - THIRTY_DAYS_IN_MS;

        logger.log(`[HealthScoreCalculator] Calculating score for profile ${profileId} from ${new Date(startTimestamp).toISOString()} to ${new Date(endTimestamp).toISOString()}`);

        const doseLogs = await this.doseLogRepository.findByProfileIdAndDateRange(
            profileId,
            startTimestamp,
            endTimestamp
        );

        if (doseLogs.length === 0) {
            logger.log(`[HealthScoreCalculator] No dose logs found for profile ${profileId}. Defaulting to max score.`);
            return this.healthMetricsRepository.upsert({
                profile_id: profileId,
                health_score: HEALTH_SCORE_CONFIG.MAX_SCORE,
            });
        }

        let totalDoses = 0;
        let adherentDoses = 0;

        for (const log of doseLogs) {
            // Only consider doses that were part of a schedule
            if (log.schedule_id) {
                totalDoses++;
                if (log.status === 'taken' && log.actual_time) {
                    const delay = log.actual_time - log.scheduled_time;
                    if (delay <= GRACE_PERIOD_MS) {
                        adherentDoses++;
                    }
                }
            }
        }

        const score = totalDoses > 0 
            ? (adherentDoses / totalDoses) * 100 
            : HEALTH_SCORE_CONFIG.MAX_SCORE; // If no scheduled doses, adherence is 100%

        const finalScore = Math.round(Math.max(HEALTH_SCORE_CONFIG.MIN_SCORE, Math.min(HEALTH_SCORE_CONFIG.MAX_SCORE, score)));
        logger.log(`[HealthScoreCalculator] Profile ${profileId}: ${adherentDoses}/${totalDoses} doses were adherent. Final score: ${finalScore}`);

        return this.healthMetricsRepository.upsert({
            profile_id: profileId,
            health_score: finalScore,
        });
    }

    /**
     * Retrieves the current health score for a profile.
     * @param profileId The ID of the profile.
     * @returns The health metrics, or null if not found.
     */
    async getScore(profileId: string): Promise<HealthMetrics | null> {
        return this.healthMetricsRepository.findByProfileId(profileId);
    }
}
