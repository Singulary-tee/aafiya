
import { SQLiteDatabase } from 'expo-sqlite';
import { IRepository } from './IRepository';
import { Profile, ProfileInput, ProfileUpdate } from '../models/Profile';
import { v4 as uuidv4 } from 'uuid';

export class ProfileRepository implements IRepository<Profile, ProfileInput, ProfileUpdate> {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(input: ProfileInput): Promise<Profile> {
        const now = Date.now();
        const newProfile: Profile = {
            id: uuidv4(),
            ...input,
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            'INSERT INTO profiles (id, name, avatar_color, created_at, updated_at) VALUES (?, ?, ?, ?, ?);',
            [newProfile.id, newProfile.name, newProfile.avatar_color, newProfile.created_at, newProfile.updated_at]
        );

        return newProfile;
    }

    async findById(id: string): Promise<Profile | null> {
        const result = await this.db.getFirstAsync<Profile>(
            'SELECT * FROM profiles WHERE id = ?;',
            [id]
        );
        return result || null;
    }

    async findAll(): Promise<Profile[]> {
        const results = await this.db.getAllAsync<Profile>('SELECT * FROM profiles ORDER BY created_at ASC;');
        return results;
    }

    async update(id: string, input: ProfileUpdate): Promise<Profile> {
        const now = Date.now();
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('Profile not found');
        }

        const fields = Object.keys(input).map(key => `${key} = ?`).join(', ');
        const values = Object.values(input);

        if (fields.length === 0) {
            return existing;
        }

        await this.db.runAsync(
            `UPDATE profiles SET ${fields}, updated_at = ? WHERE id = ?;`,
            [...values, now, id]
        );

        return { ...existing, ...input, updated_at: now };
    }

    async delete(id: string): Promise<boolean> {
        // Note: CASCADE delete should handle associated data
        const result = await this.db.runAsync('DELETE FROM profiles WHERE id = ?;', [id]);
        return (result.changes ?? 0) > 0;
    }
}
