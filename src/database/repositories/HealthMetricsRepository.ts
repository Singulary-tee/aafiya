import { SQLiteDatabase } from 'expo-sqlite';
import { HealthMetrics } from '../models/HealthMetrics';

/**
 * Data required to create or update a health metric.
 */
export type HealthMetricsData = Omit<HealthMetrics, 'last_calculated'>;


export class HealthMetricsRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Creates or updates a health metric for a profile.
     * This is an 'upsert' operation.
     * @param data The health metrics data.
     * @returns The newly created or updated health metrics object.
     */
    async upsert(data: HealthMetricsData): Promise<HealthMetrics> {
        const now = Date.now();
        // Clamp the score between 0 and 100
        const clampedScore = Math.max(0, Math.min(100, data.health_score));

        await this.db.runAsync(
            `INSERT INTO health_metrics (profile_id, health_score, last_calculated) 
             VALUES (?, ?, ?) 
             ON CONFLICT(profile_id) DO UPDATE SET health_score = excluded.health_score, last_calculated = excluded.last_calculated`,
            [data.profile_id, clampedScore, now]
        );

        return {
            profile_id: data.profile_id,
            health_score: clampedScore,
            last_calculated: now,
        };
    }

    /**
     * Finds the health metric for a given profile.
     * @param profileId The ID of the profile.
     * @returns The health metric object, or null if not found.
     */
    async findByProfileId(profileId: string): Promise<HealthMetrics | null> {
        return await this.db.getFirstAsync<HealthMetrics>(
            'SELECT * FROM health_metrics WHERE profile_id = ?',
            [profileId]
        ) ?? null;
    }

    /**
     * Deletes the health metric for a profile.
     * This is typically handled by cascading deletes but can be called directly.
     * @param profileId The ID of the profile whose health metric should be deleted.
     */
    async delete(profileId: string): Promise<void> {
        await this.db.runAsync('DELETE FROM health_metrics WHERE profile_id = ?', [profileId]);
    }
}
