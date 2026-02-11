
import { SQLiteDatabase } from 'expo-sqlite';
import { IRepository } from './IRepository';
import { HelperPairing, HelperPairingInput, HelperPairingUpdate, PairingStatus } from '../models/HelperPairing';
import { v4 as uuidv4 } from 'uuid';

export class HelperPairingRepository implements IRepository<HelperPairing, HelperPairingInput, HelperPairingUpdate> {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async create(input: HelperPairingInput): Promise<HelperPairing> {
        const now = Date.now();
        const newPairing: HelperPairing = {
            id: uuidv4(),
            profile_id: input.profile_id,
            pairing_code: input.pairing_code,
            helper_name: '', // Initially empty
            status: 'pending',
            expires_at: input.expires_at,
            created_at: now,
            updated_at: now,
        };

        await this.db.runAsync(
            `INSERT INTO helper_pairing (id, profile_id, pairing_code, helper_name, status, expires_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
                newPairing.id,
                newPairing.profile_id,
                newPairing.pairing_code,
                newPairing.helper_name,
                newPairing.status,
                newPairing.expires_at,
                newPairing.created_at,
                newPairing.updated_at,
            ]
        );

        return newPairing;
    }

    async findById(id: string): Promise<HelperPairing | null> {
        const result = await this.db.getFirstAsync<HelperPairing>(
            'SELECT * FROM helper_pairing WHERE id = ?;',
            [id]
        );
        return result || null;
    }

    async findByCode(code: string): Promise<HelperPairing | null> {
        const result = await this.db.getFirstAsync<HelperPairing>(
            'SELECT * FROM helper_pairing WHERE pairing_code = ? AND status = ? AND expires_at > ?;',
            [code, 'pending', Date.now()]
        );
        return result || null;
    }

    async findByProfileId(profileId: string, status?: PairingStatus): Promise<HelperPairing | null> {
        let query = 'SELECT * FROM helper_pairing WHERE profile_id = ?';
        const params: any[] = [profileId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC;';

        const result = await this.db.getFirstAsync<HelperPairing>(query, params);
        return result || null;
    }

    async findAll(filters: { profile_id: string; status?: PairingStatus }): Promise<HelperPairing[]> {
        let query = 'SELECT * FROM helper_pairing WHERE profile_id = ?';
        const params: any[] = [filters.profile_id];

        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY created_at DESC;';

        return this.db.getAllAsync<HelperPairing>(query, params);
    }

    async update(id: string, input: HelperPairingUpdate): Promise<HelperPairing> {
        const now = Date.now();
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('HelperPairing not found');
        }

        const fields = Object.keys(input).map(key => `${key} = ?`).join(', ');
        const values = Object.values(input);

        if (fields.length === 0) {
            return existing;
        }

        await this.db.runAsync(
            `UPDATE helper_pairing SET ${fields}, updated_at = ? WHERE id = ?;`,
            [...values, now, id]
        );

        return { ...existing, ...input, updated_at: now };
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.runAsync('DELETE FROM helper_pairing WHERE id = ?;', [id]);
        return (result.changes ?? 0) > 0;
    }

    async clearExpired(): Promise<void> {
        await this.db.runAsync('DELETE FROM helper_pairing WHERE status = ? AND expires_at <= ?;', ['pending', Date.now()]);
    }
}
