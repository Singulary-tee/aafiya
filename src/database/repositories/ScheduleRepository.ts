import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { Schedule } from '../models/Schedule';

/**
 * Data required to create a new schedule.
 */
export type ScheduleData = Omit<Schedule, 'id' | 'is_active' | 'created_at' | 'updated_at'>;

/**
 * Data that can be updated on an existing schedule.
 */
export type ScheduleUpdate = Partial<Omit<Schedule, 'id' | 'medication_id' | 'created_at' | 'updated_at'>>;

// Represents the raw schedule format from the database.
type RawSchedule = Omit<Schedule, 'times' | 'days_of_week'> & { times: string, days_of_week: string | null };

export class ScheduleRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(data: ScheduleData): Promise<Schedule> {
        const now = Date.now();
        const newSchedule: Schedule = {
            id: generateUUID(),
            medication_id: data.medication_id,
            times: data.times,
            days_of_week: data.days_of_week ?? null,
            grace_period_minutes: data.grace_period_minutes ?? 0,
            notification_sound: data.notification_sound ?? null,
            is_active: 1, // 1 for true, as per the model
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO schedules (id, medication_id, times, days_of_week, grace_period_minutes, notification_sound, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [
                newSchedule.id,
                newSchedule.medication_id,
                JSON.stringify(newSchedule.times),
                newSchedule.days_of_week ? JSON.stringify(newSchedule.days_of_week) : null,
                newSchedule.grace_period_minutes,
                newSchedule.notification_sound,
                newSchedule.is_active,
                newSchedule.created_at,
                newSchedule.updated_at
            ]
        );

        return newSchedule;
    }

    async findByMedicationId(medicationId: string): Promise<Schedule[]> {
        const results = await this.db.getAllAsync<RawSchedule>(
            'SELECT * FROM schedules WHERE medication_id = ? AND is_active = 1',
            [medicationId]
        );
        return results.map(this.mapSchedule);
    }

    async findById(id: string): Promise<Schedule | null> {
        const result = await this.db.getFirstAsync<RawSchedule>('SELECT * FROM schedules WHERE id = ?', [id]);
        return result ? this.mapSchedule(result) : null;
    }

    async update(id: string, data: ScheduleUpdate): Promise<Schedule> {
        const existing = await this.findById(id);
        if (!existing) throw new Error('Schedule not found');

        const fieldsToUpdate = Object.keys(data).filter(k => k in data);
        if (fieldsToUpdate.length === 0) return existing;

        const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
        const values: (string | number | null)[] = [];

        for (const key of fieldsToUpdate) {
            let value = data[key as keyof ScheduleUpdate];

            if (key === 'times' || key === 'days_of_week') {
                values.push(value ? JSON.stringify(value) : null);
            } else if (value === undefined) {
                values.push(null);
            } else {
                values.push(value as any);
            }
        }

        const now = Date.now();
        await this.db.runAsync(
            `UPDATE schedules SET ${setClause}, updated_at = ? WHERE id = ?`,
            [...values, now, id]
        );

        const updatedSchedule = await this.findById(id);
        if (!updatedSchedule) throw new Error('Schedule not found after update');
        return updatedSchedule;
    }


    async deactivateByMedicationId(medicationId: string): Promise<void> {
        await this.db.runAsync(
            'UPDATE schedules SET is_active = 0, updated_at = ? WHERE medication_id = ?',
            [Date.now(), medicationId]
        );
    }

    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM schedules WHERE id = ?', [id]);
    }
    
    private mapSchedule(raw: RawSchedule): Schedule {
        return {
            id: raw.id,
            medication_id: raw.medication_id,
            times: JSON.parse(raw.times),
            days_of_week: raw.days_of_week ? JSON.parse(raw.days_of_week) : null,
            grace_period_minutes: raw.grace_period_minutes,
            notification_sound: raw.notification_sound,
            is_active: raw.is_active,
            created_at: raw.created_at,
            updated_at: raw.updated_at,
        };
    }
}
