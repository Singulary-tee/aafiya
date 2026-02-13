import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { DoseLog } from '../models/DoseLog';

/**
 * Data required to create a new dose log entry.
 */
export type DoseLogData = Omit<DoseLog, 'id' | 'created_at'>;

/**
 * Data that can be updated on an existing dose log.
 */
export type DoseLogUpdate = Partial<Omit<DoseLog, 'id' | 'medication_id' | 'schedule_id' | 'created_at'>>;

export class DoseLogRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Creates a new dose log entry.
     * @param data The data for the new dose log.
     * @returns The newly created dose log object.
     */
    async create(data: DoseLogData): Promise<DoseLog> {
        const now = Date.now();
        const newLog: DoseLog = {
            id: generateUUID(),
            profile_id: data.profile_id,
            medication_id: data.medication_id,
            schedule_id: data.schedule_id ?? null,
            scheduled_time: data.scheduled_time,
            actual_time: data.actual_time ?? null,
            status: data.status,
            notes: data.notes ?? null,
            created_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO dose_log (id, profile_id, medication_id, schedule_id, scheduled_time, actual_time, status, notes, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [newLog.id, newLog.profile_id, newLog.medication_id, newLog.schedule_id, newLog.scheduled_time, newLog.actual_time, newLog.status, newLog.notes, newLog.created_at]
        );
        return newLog;
    }
    
    /**
     * Finds a specific dose log by its ID.
     * @param id The dose log ID.
     * @returns The dose log, or null if not found.
     */
    async findById(id: string): Promise<DoseLog | null> {
        return await this.db.getFirstAsync<DoseLog>('SELECT * FROM dose_log WHERE id = ?', [id]) ?? null;
    }

    /**
     * Finds all dose logs for a given medication, ordered by scheduled time.
     * @param medicationId The ID of the medication.
     * @param limit The maximum number of logs to return.
     * @param offset The number of logs to skip.
     * @returns A list of dose logs.
     */
    async findByMedicationId(medicationId: string, limit: number = 30, offset: number = 0): Promise<DoseLog[]> {
        return await this.db.getAllAsync<DoseLog>(
            'SELECT * FROM dose_log WHERE medication_id = ? ORDER BY scheduled_time DESC LIMIT ? OFFSET ?',
            [medicationId, limit, offset]
        );
    }
    
    /**
     * Finds a dose log by medication and scheduled time.
     * Useful for preventing duplicate logs for the same scheduled event.
     * @param medicationId The ID of the medication.
     * @param scheduledTime The scheduled time of the dose.
     * @returns The dose log, or null if not found.
     */
    async findByMedicationAndScheduledTime(medicationId: string, scheduledTime: number): Promise<DoseLog | null> {
        return await this.db.getFirstAsync<DoseLog>(
            'SELECT * FROM dose_log WHERE medication_id = ? AND scheduled_time = ?',
            [medicationId, scheduledTime]
        ) ?? null;
    }

    /**
     * Finds all dose logs with a specific status.
     * @param status The status to search for (e.g., 'skipped', 'taken', 'missed').
     * @returns A list of dose logs with the given status.
     */
    async findByStatus(status: string): Promise<DoseLog[]> {
        return await this.db.getAllAsync<DoseLog>(
            'SELECT * FROM dose_log WHERE status = ?',
            [status]
        );
    }

    /**
     * Finds all dose logs for a given profile within a specific date range.
     * @param profileId The ID of the profile.
     * @param startTimestamp The start of the time range (Unix timestamp).
     * @param endTimestamp The end of the time range (Unix timestamp).
     * @returns A list of dose logs within the range.
     */
    async findByProfileIdAndDateRange(profileId: string, startTimestamp: number, endTimestamp: number): Promise<DoseLog[]> {
        return await this.db.getAllAsync<DoseLog>(
            `SELECT dl.* 
             FROM dose_log dl
             JOIN medications m ON dl.medication_id = m.id
             WHERE m.profile_id = ? AND dl.scheduled_time BETWEEN ? AND ?
             ORDER BY dl.scheduled_time ASC`,
            [profileId, startTimestamp, endTimestamp]
        );
    }

    /**
     * Updates an existing dose log.
     * @param id The ID of the dose log to update.
     * @param data An object containing the fields to update.
     * @returns The updated dose log object.
     */
    async update(id: string, data: DoseLogUpdate): Promise<DoseLog> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('DoseLog not found');
        }

        const fieldsToUpdate = Object.keys(data);
        if (fieldsToUpdate.length === 0) return existing;

        const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
        const values = fieldsToUpdate.map(key => {
            const value = data[key as keyof DoseLogUpdate];
            return value === undefined ? null : value;
        });

        await this.db.runAsync(
            `UPDATE dose_log SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        const updatedLog = await this.findById(id);
        if (!updatedLog) {
            throw new Error('DoseLog not found after update');
        }
        return updatedLog;
    }
    
    /**
     * Deletes a dose log by its ID.
     * @param id The ID of the dose log to delete.
     */
    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM dose_log WHERE id = ?', [id]);
    }
}
