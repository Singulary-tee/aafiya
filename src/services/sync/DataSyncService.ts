import { ConflictResolver } from "./ConflictResolver";

/**
 * Represents the basic structure of a local repository.
 * This is a generic interface that can be implemented by specific repositories.
 */
export interface Repository<T> {
    create(item: T): Promise<void>;
    update(id: string, item: Partial<T>): Promise<void>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
}

/**
 * Represents the API for fetching remote data.
 * This is a generic interface that can be implemented by a specific API client.
 */
export interface SyncAPI<T> {
    fetchLatest(since: number): Promise<T[]>;
}

/**
 * Service for synchronizing local data with a remote server.
 * It uses a repository for local data access and a SyncAPI for remote data access.
 * A conflict resolver is used to handle cases where an item has been modified both locally and remotely.
 */
export class DataSyncService<T extends { id: string, updated_at: number }> {
    private api: SyncAPI<T> | null;
    private repository: Repository<T>;
    private conflictResolver: ConflictResolver;

    constructor(api: SyncAPI<T> | null, repository: Repository<T>, conflictResolver: ConflictResolver) {
        this.api = api;
        this.repository = repository;
        this.conflictResolver = conflictResolver;
    }

    /**
     * Checks if the service has a remote API to sync with.
     */
    isApiAvailable(): boolean {
        return !!this.api;
    }

    /**
     * Fetches the latest data from the remote server and updates the local database.
     * @param lastSyncTimestamp The timestamp of the last successful sync.
     * @returns The timestamp of the current sync.
     */
    async syncDown(lastSyncTimestamp: number): Promise<number> {
        if (!this.api) {
            throw new Error("Sync API not configured.");
        }

        const remoteData = await this.api.fetchLatest(lastSyncTimestamp);
        const now = Date.now();

        for (const remoteItem of remoteData) {
            const localItem = await this.repository.findById(remoteItem.id);

            if (!localItem) {
                // If the item doesn't exist locally, create it.
                await this.repository.create(remoteItem);
            } else if (remoteItem.updated_at > localItem.updated_at) {
                // If the remote item is newer, check for conflicts.
                const resolution = this.conflictResolver.resolve(localItem, remoteItem);
                await this.repository.update(resolution.merged.id, resolution.merged);
            }
        }

        return now;
    }
}
