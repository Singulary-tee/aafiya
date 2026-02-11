
import { SQLiteDatabase } from 'expo-sqlite';
import { IRepository } from './IRepository';
import { Medication, MedicationInput, MedicationUpdate } from '../models/Medication';
import { v4 as uuidv4 } from 'uuid';

export class MedicationRepository implements IRepository<Medication, MedicationInput & { profile_id: string }, MedicationUpdate> {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(input: MedicationInput & { profile_id: string }): Promise<Medication> {
        const now = Date.now();
        const newMedication: Medication = {
            id: uuidv4(),
            ...input,
            current_count: input.initial_count,
            is_active: 1,
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO medications (id, profile_id, rxcui, name, generic_name, brand_name, dosage_form, strength, initial_count, current_count, image_url, notes, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                newMedication.id,
                newMedication.profile_id,
                newMedication.rxcui || null,
                newMedication.name,
                newMedication.generic_name || null,
                newMedication.brand_name || null,
                newMedication.dosage_form || null,
                newMedication.strength || null,
                newMedication.initial_count,
                newMedication.current_count,
                newMedication.image_url || null,
                newMedication.notes || null,
                newMedication.is_active,
                newMedication.created_at,
                newMedication.updated_at,
            ]
        );

        return newMedication;
    }

    async findById(id: string): Promise<Medication | null> {
        const result = await this.db.getFirstAsync<Medication>(
            'SELECT * FROM medications WHERE id = ?;',
            [id]
        );
        return result || null;
    }

    async findAll(filters: { profile_id: string; is_active?: boolean }): Promise<Medication[]> {
        let query = 'SELECT * FROM medications WHERE profile_id = ?';
        const params: any[] = [filters.profile_id];

        if (filters.is_active !== undefined) {
            query += ' AND is_active = ?';
            params.push(filters.is_active ? 1 : 0);
        }

        query += ' ORDER BY created_at DESC;';

        const results = await this.db.getAllAsync<Medication>(query, params);
        return results;
    }

    async update(id: string, input: MedicationUpdate): Promise<Medication> {
        const now = Date.now();
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Medication not found');
        }

        const fields = Object.keys(input).map(key => `${key} = ?`).join(', ');
        const values = Object.values(input);

        if (fields.length === 0) {
            return existing;
        }

        await this.db.runAsync(
            `UPDATE medications SET ${fields}, updated_at = ? WHERE id = ?;`,
            [...values, now, id]
        );

        return { ...existing, ...input, updated_at: now };
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.runAsync('DELETE FROM medications WHERE id = ?;', [id]);
        return (result.changes ?? 0) > 0;
    }

    async decrementCount(id: string, amount: number): Promise<Medication> {
        const now = Date.now();
        await this.db.runAsync(
            'UPDATE medications SET current_count = current_count - ?, updated_at = ? WHERE id = ? AND current_count >= ?;',
            [amount, now, id, amount]
        );

        const updated = await this.findById(id);
        if (!updated) {
            throw new Error('Medication not found after decrementing count.');
        }
        return updated;
    }
}
