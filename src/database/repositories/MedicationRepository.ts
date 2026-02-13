import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { Medication } from '../models/Medication';

/**
 * Data required to create a new medication.
 * The 'id', 'is_active', 'created_at', and 'updated_at' fields are auto-generated.
 */
export type MedicationData = Omit<Medication, 'id' | 'is_active' | 'created_at' | 'updated_at'>;

/**
 * Data that can be updated on an existing medication.
 * The 'id' and 'profile_id' are used for lookup and cannot be changed.
 */
export type MedicationUpdate = Partial<Omit<Medication, 'id' | 'profile_id' | 'created_at' | 'updated_at'>>;

export class MedicationRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Creates a new medication for a profile.
     * @param data The data for the new medication.
     * @returns The newly created medication object.
     */
    async create(data: MedicationData): Promise<Medication> {
        const now = Date.now();
        // Let TypeScript infer the type of this object, which will not include `undefined`
        const newMedication = {
            id: generateUUID(),
            profile_id: data.profile_id,
            rxcui: data.rxcui ?? null,
            name: data.name,
            generic_name: data.generic_name ?? null,
            brand_name: data.brand_name ?? null,
            dosage_form: data.dosage_form ?? null,
            strength: data.strength ?? null,
            initial_count: data.initial_count,
            current_count: data.current_count,
            image_url: data.image_url ?? null,
            notes: data.notes ?? null,
            is_active: 1, // Active by default
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO medications (id, profile_id, rxcui, name, generic_name, brand_name, dosage_form, strength, initial_count, current_count, image_url, notes, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newMedication.id,
                newMedication.profile_id,
                newMedication.rxcui,
                newMedication.name,
                newMedication.generic_name,
                newMedication.brand_name,
                newMedication.dosage_form,
                newMedication.strength,
                newMedication.initial_count,
                newMedication.current_count,
                newMedication.image_url,
                newMedication.notes,
                newMedication.is_active,
                newMedication.created_at,
                newMedication.updated_at
            ]
        );
        // The inferred type of newMedication is structurally compatible with Medication
        return newMedication;
    }

    /**
     * Finds a medication by its unique ID.
     * @param id The ID of the medication.
     * @returns The medication object, or null if not found.
     */
    async findById(id: string): Promise<Medication | null> {
        return await this.db.getFirstAsync<Medication>('SELECT * FROM medications WHERE id = ?', [id]) ?? null;
    }

    /**
     * Finds all medications associated with a specific profile.
     * @param profileId The ID of the profile.
     * @returns A list of medications.
     */
    async findByProfileId(profileId: string): Promise<Medication[]> {
        return await this.db.getAllAsync<Medication>('SELECT * FROM medications WHERE profile_id = ?', [profileId]);
    }

    /**
     * Updates an existing medication.
     * @param id The ID of the medication to update.
     * @param data An object containing the fields to update.
     * @returns The updated medication object.
     */
    async update(id: string, data: MedicationUpdate): Promise<Medication> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Medication not found');
        }

        const fieldsToUpdate = Object.keys(data).filter(key => key !== 'id');
        if (fieldsToUpdate.length === 0) return existing;

        const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
        const values = fieldsToUpdate.map(key => {
            const value = data[key as keyof MedicationUpdate];
            return value === undefined ? null : value;
        });
        
        const now = Date.now();

        await this.db.runAsync(
            `UPDATE medications SET ${setClause}, updated_at = ? WHERE id = ?`,
            [...values, now, id]
        );

        const updatedMedication = await this.findById(id);
        if (!updatedMedication) {
            throw new Error('Medication not found after update');
        }
        return updatedMedication;
    }

    /**
     * Deletes a medication by its ID.
     * @param id The ID of the medication to delete.
     */
    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM medications WHERE id = ?', [id]);
    }
}
