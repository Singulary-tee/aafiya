import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';

/**
 * Represents the status of a helper pairing connection.
 */
export type PairingStatus = 'pending' | 'active' | 'inactive' | 'expired';

/**
 * Represents a helper pairing record in the database.
 */
export interface HelperPairing {
    id: string;
    profile_id: string;
    pairing_code: string;
    helper_name: string | null;
    status: PairingStatus;
    expires_at: number;
    created_at: number;
    updated_at: number;
}

/**
 * Data required to create a new helper pairing.
 */
export interface HelperPairingInput {
    profile_id: string;
    pairing_code: string;
    expires_at: number;
}

/**
 * Data that can be updated on an existing helper pairing.
 */
export type HelperPairingUpdate = Partial<{
    helper_name: string | null;
    status: PairingStatus;
}>;


export class HelperPairingRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Creates a new helper pairing request.
     * @param input The data for the new pairing.
     * @returns The newly created pairing object.
     */
    async create(input: HelperPairingInput): Promise<HelperPairing> {
        const now = Date.now();
        const newPairing: HelperPairing = {
            id: generateUUID(),
            profile_id: input.profile_id,
            pairing_code: input.pairing_code,
            helper_name: null,
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

    /**
     * Finds a pairing by its unique ID.
     * @param id The ID of the pairing.
     * @returns The pairing object or null if not found.
     */
    async findById(id: string): Promise<HelperPairing | null> {
        return await this.db.getFirstAsync<HelperPairing>(
            'SELECT * FROM helper_pairing WHERE id = ?;',
            [id]
        ) ?? null;
    }

    /**
     * Finds a pending pairing by its pairing code.
     * @param code The pairing code.
     * @returns The pairing object or null if not found, not pending, or expired.
     */
    async findByCode(code: string): Promise<HelperPairing | null> {
        return await this.db.getFirstAsync<HelperPairing>(
            'SELECT * FROM helper_pairing WHERE pairing_code = ? AND status = ? AND expires_at > ?;',
            [code, 'pending', Date.now()]
        ) ?? null;
    }

    /**
     * Finds all pairings for a specific profile.
     * @param profileId The ID of the profile.
     * @param status Optional filter by pairing status.
     * @returns A list of matching pairings.
     */
    async findAllByProfileId(profileId: string, status?: PairingStatus): Promise<HelperPairing[]> {
        let query = 'SELECT * FROM helper_pairing WHERE profile_id = ?';
        const params: any[] = [profileId];

        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC;';

        return this.db.getAllAsync<HelperPairing>(query, params);
    }

    /**
     * Updates a pairing's information.
     * @param id The ID of the pairing to update.
     * @param input An object containing the fields to update.
     * @returns The updated pairing object.
     */
    async update(id: string, input: HelperPairingUpdate): Promise<HelperPairing> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error('HelperPairing not found');
        }

        const fieldsToUpdate = Object.keys(input);
        if (fieldsToUpdate.length === 0) {
            return existing; // Nothing to update
        }

        const now = Date.now();
        const setClause = fieldsToUpdate.map(key => `${key} = ?`).join(', ');
        const values = fieldsToUpdate.map(key => {
            const value = input[key as keyof HelperPairingUpdate];
            return value === undefined ? null : value;
        });

        await this.db.runAsync(
            `UPDATE helper_pairing SET ${setClause}, updated_at = ? WHERE id = ?;`,
            [...values, now, id]
        );

        const updatedPairing = await this.findById(id);
        if (!updatedPairing) {
            throw new Error('HelperPairing not found after update');
        }
        return updatedPairing;
    }

    /**
     * Deletes a pairing by its ID.
     * @param id The ID of the pairing to delete.
     */
    async delete(id: string): Promise<void> {
        await this.db.runAsync('DELETE FROM helper_pairing WHERE id = ?;', [id]);
    }

    /**
     * Deletes all expired, pending pairings from the database.
     */
    async clearExpired(): Promise<void> {
        await this.db.runAsync('DELETE FROM helper_pairing WHERE status = ? AND expires_at <= ?;', ['pending', Date.now()]);
    }
}
