
import { SQLiteDatabase } from 'expo-sqlite';
import { IRepository } from './IRepository';
import { Schedule, ScheduleInput, ScheduleUpdate } from '../models/Schedule';
import { v4 as uuidv4 } from 'uuid';

export class ScheduleRepository implements IRepository<Schedule, ScheduleInput & { medication_id: string }, ScheduleUpdate> {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(input: ScheduleInput & { medication_id: string }): Promise<Schedule> {
        const now = Date.now();
        const newSchedule: Schedule = {
            id: uuidv4(),
            ...input,
            times: JSON.stringify(input.times),
            days_of_week: JSON.stringify(input.days_of_week || null),
            grace_period_minutes: input.grace_period_minutes || 30,
            is_active: 1,
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO schedules (id, medication_id, times, days_of_week, grace_period_minutes, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                newSchedule.id,
                newSchedule.medication_id,
                newSchedule.times,
                newSchedule.days_of_week,
                newSchedule.grace_period_minutes,
                newSchedule.is_active,
                newSchedule.created_at,
                newSchedule.updated_at,
            ]
        );

        return { ...newSchedule, times: JSON.parse(newSchedule.times), days_of_week: JSON.parse(newSchedule.days_of_week) };
    }

    async findById(id: string): Promise<Schedule | null> {
        const result = await this.db.getFirstAsync<Schedule>(
            'SELECT * FROM schedules WHERE id = ?;',
            [id]
        );
        if (result) {
            return { ...result, times: JSON.parse(result.times), days_of_week: JSON.parse(result.days_of_week) };
        }
        return null;
    }

    async findAll(filters: { medication_id: string }): Promise<Schedule[]> {
        const results = await this.db.getAllAsync<Schedule>(
            'SELECT * FROM schedules WHERE medication_id = ? ORDER BY created_at ASC;',
            [filters.medication_id]
        );
        return results.map(schedule => ({ ...schedule, times: JSON.parse(schedule.times), days_of_week: JSON.parse(schedule.days_of_week) }));
    }

    async update(id: string, input: ScheduleUpdate): Promise<Schedule> {
        const now = Date.now();
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Schedule not found');
        }

        const updateInput = { ...input };
        if (updateInput.times) {
            updateInput.times = JSON.stringify(updateInput.times);
        }
        if (updateInput.days_of_week) {
            updateInput.days_of_week = JSON.stringify(updateInput.days_of_week);
        }

        const fields = Object.keys(updateInput).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updateInput);

        if (fields.length === 0) {
            return existing;
        }

        await this.db.runAsync(
            `UPDATE schedules SET ${fields}, updated_at = ? WHERE id = ?;`,
            [...values, now, id]
        );

        const updatedSchedule = { ...existing, ...input, updated_at: now };
        return updatedSchedule;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.runAsync('DELETE FROM schedules WHERE id = ?;', [id]);
        return (result.changes ?? 0) > 0;
    }
}
