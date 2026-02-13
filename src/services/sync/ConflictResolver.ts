import { logger } from '../../utils/logger';

/**
 * Represents a data record that has a last-updated timestamp.
 * This is a prerequisite for the conflict resolution strategy.
 */
export interface VersionedData {
    id: string;
    updated_at: number;
}

/**
 * The result of a conflict resolution.
 * It specifies whether the local or remote version should be kept,
 * or if they are identical.
 */
export type Resolution<T extends VersionedData> = 
    | { status: 'local_wins', merged: T }
    | { status: 'remote_wins', merged: T }
    | { status: 'no_conflict', merged: T };

/**
 * Implements a "last write wins" conflict resolution strategy.
 * This resolver is designed to work with any data that includes an `updated_at` timestamp.
 */
export class ConflictResolver {

    /**
     * Resolves a conflict between a local and a remote version of a data record.
     *
     * @param local The local version of the record.
     * @param remote The remote version of the record from the server.
     * @returns A `Resolution` object indicating which version won and the merged result.
     */
    resolve<T extends VersionedData>(local: T, remote: T): Resolution<T> {
        if (local.id !== remote.id) {
            throw new Error('Cannot resolve conflict for records with different IDs.');
        }

        logger.log(`Resolving conflict for record ID: ${local.id}`);

        if (remote.updated_at > local.updated_at) {
            logger.log(`Remote version is newer (Remote: ${remote.updated_at}, Local: ${local.updated_at}). Remote wins.`);
            // Remote version is newer, so it wins.
            return { status: 'remote_wins', merged: remote };
        } else if (local.updated_at > remote.updated_at) {
            logger.log(`Local version is newer (Local: ${local.updated_at}, Remote: ${remote.updated_at}). Local wins.`);
            // Local version is newer, so it wins.
            return { status: 'local_wins', merged: local };
        } else {
            logger.log(`No conflict detected for record ID: ${local.id}. Versions are identical.`);
            // Timestamps are the same, so there is no conflict.
            // We can return either version.
            return { status: 'no_conflict', merged: local };
        }
    }
}
