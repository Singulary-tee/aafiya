
import { SQLiteDatabase } from 'expo-sqlite';
import { IRepository } from './IRepository';
import { HealthMetrics, HealthMetricsInput } from '../models/HealthMetrics';

export class HealthMetricsRepository implements IRepository<HealthMetrics, HealthMetricsInput, Partial<HealthMetricsInput>> {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(input: HealthMetricsInput): Promise<HealthMetrics> {
        const now = Date.now();
        const newMetrics: HealthMetrics = {
            ...input,
            last_calculated: now,
        };

        await this.db.runAsync(
            `INSERT INTO health_metrics (profile_id, health_score, last_calculated)
             VALUES (?, ?, ?);`,
            [
                newMetrics.profile_id,
                newMetrics.health_score,
                newMetrics.last_calculated,
            ]
        );

        return newMetrics;
    }

    async findById(id: string): Promise<HealthMetrics | null> {
        // Note: The schema uses profile_id as the primary key, so we find by that.
        const result = await this.db.getFirstAsync<HealthMetrics>(
            'SELECT * FROM health_metrics WHERE profile_id = ?;',
            [id]
        );
        return result || null;
    }

    async findByProfileId(profileId: string): Promise<HealthMetrics | null> {
        const result = await this.db.getFirstAsync<HealthMetrics>(
            'SELECT * FROM health_metrics WHERE profile_id = ? ORDER BY last_calculated DESC;',
            [profileId]
        );
        return result || null;
    }

    async findAll(filters: { profile_id: string }): Promise<HealthMetrics[]> {
        const results = await this.db.getAllAsync<HealthMetrics>(
            'SELECT * FROM health_metrics WHERE profile_id = ?;',
            [filters.profile_id]
        );
        return results;
    }

    async update(id: string, input: Partial<HealthMetricsInput>): Promise<HealthMetrics> {
        const now = Date.now();
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('HealthMetrics not found');
        }

        const fields = Object.keys(input).map(key => `${key} = ?`).join(', ');
        const values = Object.values(input);

        if (fields.length === 0) {
            return existing;
        }

        await this.db.runAsync(
            `UPDATE health_metrics SET ${fields}, last_calculated = ? WHERE profile_id = ?;`,
            [...values, now, id]
        );

        return { ...existing, ...input, last_calculated: now };
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.runAsync('DELETE FROM health_metrics WHERE profile_id = ?;', [id]);
        return (result.changes ?? 0) > 0;
    }
}
