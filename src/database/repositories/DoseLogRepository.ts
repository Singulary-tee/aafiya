
import { SQLiteDatabase } from 'expo-sqlite';
import { IRepository } from './IRepository';
import { DoseLog, DoseLogInput, DoseLogUpdate, DoseStatus } from '../models/DoseLog';
import { v4 as uuidv4 } from 'uuid';

export class DoseLogRepository implements IRepository<DoseLog, DoseLogInput, DoseLogUpdate> {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(input: DoseLogInput): Promise<DoseLog> {
        const now = Date.now();
        const newDoseLog: DoseLog = {
            id: uuidv4(),
            ...input,
            created_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO dose_log (id, medication_id, schedule_id, scheduled_time, actual_time, status, notes, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                newDoseLog.id,
                newDoseLog.medication_id,
                newDoseLog.schedule_id,
                newDoseLog.scheduled_time,
                newDoseLog.actual_time || null,
                newDoseLog.status,
                newDoseLog.notes || null,
                newDoseLog.created_at,
            ]
        );

        return newDoseLog;
    }

    async findById(id: string): Promise<DoseLog | null> {
        const result = await this.db.getFirstAsync<DoseLog>(
            'SELECT * FROM dose_log WHERE id = ?;',
            [id]
        );
        return result || null;
    }

    async findAll(filters: { medication_id?: string; from?: number, to?: number, status?: DoseStatus }): Promise<DoseLog[]> {
        let query = 'SELECT * FROM dose_log WHERE 1=1';
        const params: any[] = [];

        if (filters.medication_id) {
            query += ' AND medication_id = ?';
            params.push(filters.medication_id);
        }
        if (filters.from) {
            query += ' AND scheduled_time >= ?';
            params.push(filters.from);
        }
        if (filters.to) {
            query += ' AND scheduled_time <= ?';
            params.push(filters.to);
        }
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY scheduled_time DESC;';

        const results = await this.db.getAllAsync<DoseLog>(query, params);
        return results;
    }

    async update(id: string, input: DoseLogUpdate): Promise<DoseLog> {
        const now = Date.now();
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('DoseLog not found');
        }

        const fields = Object.keys(input).map(key => `${key} = ?`).join(', ');
        const values = Object.values(input);

        if (fields.length === 0) {
            return existing;
        }

        await this.db.runAsync(
            `UPDATE dose_log SET ${fields} WHERE id = ?;`,
            [...values, id]
        );

        return { ...existing, ...input };
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.runAsync('DELETE FROM dose_log WHERE id = ?;', [id]);
        return (result.changes ?? 0) > 0;
    }
}
