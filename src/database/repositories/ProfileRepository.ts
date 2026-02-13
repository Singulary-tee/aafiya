import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';
import { Profile } from '../models/Profile';

/**
 * Data required to create a new profile.
 */
export type ProfileData = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;

/**
 * Data that can be updated on an existing profile.
 */
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export class ProfileRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Creates a new user profile.
     * @param data The data for the new profile.
     * @returns The newly created profile object.
     */
    async create(data: ProfileData): Promise<Profile> {
        const now = Date.now();
        const newProfile = {
            id: generateUUID(),
            name: data.name,
            avatar_color: data.avatar_color,
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            'INSERT INTO profiles (id, name, avatar_color, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
            [newProfile.id, newProfile.name, newProfile.avatar_color, newProfile.created_at, newProfile.updated_at]
        );
        return newProfile;
    }

    /**
     * Finds a profile by its unique ID.
     * @param id The ID of the profile.
     * @returns The profile object, or null if not found.
     */
    async findById(id: string): Promise<Profile | null> {
        const result = await this.db.getFirstAsync<Profile>('SELECT * FROM profiles WHERE id = ?', [id]);
        return result ?? null;
    }

    /**
     * Finds all user profiles.
     * @returns A list of all profile objects.
     */
    async findAll(): Promise<Profile[]> {
        return await this.db.getAllAsync<Profile>('SELECT * FROM profiles');
    }

    /**
     * Updates an existing profile.
     * @param id The ID of the profile to update.
     * @param data An object containing the fields to update.
     * @returns The updated profile object.
     */
    async update(id: string, data: ProfileUpdate): Promise<Profile> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Profile not found');
        }

        const fieldsToUpdate = Object.keys(data);
        if (fieldsToUpdate.length === 0) return existing;

        const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
        const values = fieldsToUpdate.map(key => {
            const value = data[key as keyof ProfileUpdate];
            return value === undefined ? null : value;
        });
        
        const now = Date.now();

        await this.db.runAsync(
            `UPDATE profiles SET ${setClause}, updated_at = ? WHERE id = ?`,
            [...values, now, id]
        );

        const updatedProfile = await this.findById(id);
        if (!updatedProfile) {
            throw new Error('Profile not found after update');
        }
        return updatedProfile;
    }

    /**
     * Deletes a profile by its ID.
     * @param id The ID of the profile to delete.
     */
    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM profiles WHERE id = ?', [id]);
    }
}
