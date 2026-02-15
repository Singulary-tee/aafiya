import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { CustomHealthMetric } from '../models/CustomHealthMetrics';

/**
 * Data required to create a new custom health metric.
 */
export type CustomHealthMetricData = Omit<CustomHealthMetric, 'id' | 'created_at'>;

export class CustomHealthMetricsRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Creates a new custom health metric entry.
     * @param data The data for the new metric.
     * @returns The newly created metric object.
     */
    async create(data: CustomHealthMetricData): Promise<CustomHealthMetric> {
        const now = Date.now();
        const newMetric: CustomHealthMetric = {
            id: generateUUID(),
            profile_id: data.profile_id,
            metric_type: data.metric_type,
            value: data.value,
            unit: data.unit ?? null,
            notes: data.notes ?? null,
            recorded_at: data.recorded_at,
            created_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO custom_health_metrics (id, profile_id, metric_type, value, unit, notes, recorded_at, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newMetric.id,
                newMetric.profile_id,
                newMetric.metric_type,
                newMetric.value,
                newMetric.unit,
                newMetric.notes,
                newMetric.recorded_at,
                newMetric.created_at
            ]
        );

        return newMetric;
    }

    /**
     * Finds a custom health metric by its unique ID.
     * @param id The ID of the metric.
     * @returns The metric object, or null if not found.
     */
    async findById(id: string): Promise<CustomHealthMetric | null> {
        return await this.db.getFirstAsync<CustomHealthMetric>(
            'SELECT * FROM custom_health_metrics WHERE id = ?',
            [id]
        ) ?? null;
    }

    /**
     * Finds all custom health metrics for a specific profile.
     * @param profileId The ID of the profile.
     * @param metricType Optional filter by metric type.
     * @param limit Optional limit on number of results.
     * @returns A list of custom health metrics.
     */
    async findByProfileId(
        profileId: string,
        metricType?: string,
        limit?: number
    ): Promise<CustomHealthMetric[]> {
        let query = 'SELECT * FROM custom_health_metrics WHERE profile_id = ?';
        const params: any[] = [profileId];

        if (metricType) {
            query += ' AND metric_type = ?';
            params.push(metricType);
        }

        query += ' ORDER BY recorded_at DESC';

        if (limit) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        return await this.db.getAllAsync<CustomHealthMetric>(query, params);
    }

    /**
     * Finds custom health metrics within a date range.
     * @param profileId The ID of the profile.
     * @param startTime Unix timestamp for start of range.
     * @param endTime Unix timestamp for end of range.
     * @param metricType Optional filter by metric type.
     * @returns A list of custom health metrics.
     */
    async findByDateRange(
        profileId: string,
        startTime: number,
        endTime: number,
        metricType?: string
    ): Promise<CustomHealthMetric[]> {
        let query = 'SELECT * FROM custom_health_metrics WHERE profile_id = ? AND recorded_at BETWEEN ? AND ?';
        const params: any[] = [profileId, startTime, endTime];

        if (metricType) {
            query += ' AND metric_type = ?';
            params.push(metricType);
        }

        query += ' ORDER BY recorded_at DESC';

        return await this.db.getAllAsync<CustomHealthMetric>(query, params);
    }

    /**
     * Deletes a custom health metric by its ID.
     * @param id The ID of the metric to delete.
     */
    async deleteById(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM custom_health_metrics WHERE id = ?', [id]);
    }

    /**
     * Deletes all custom health metrics for a profile.
     * @param profileId The ID of the profile.
     */
    async deleteByProfileId(profileId: string): Promise<void> {
        await this.db.runAsync('DELETE FROM custom_health_metrics WHERE profile_id = ?', [profileId]);
    }

    /**
     * Gets the latest metric of a specific type for a profile.
     * @param profileId The ID of the profile.
     * @param metricType The type of metric to retrieve.
     * @returns The most recent metric, or null if none exist.
     */
    async getLatestByType(profileId: string, metricType: string): Promise<CustomHealthMetric | null> {
        return await this.db.getFirstAsync<CustomHealthMetric>(
            'SELECT * FROM custom_health_metrics WHERE profile_id = ? AND metric_type = ? ORDER BY recorded_at DESC LIMIT 1',
            [profileId, metricType]
        ) ?? null;
    }
}
