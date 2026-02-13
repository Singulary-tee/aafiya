import { SQLiteDatabase } from 'expo-sqlite';
import { generateUUID } from '../../utils/uuid';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Represents a cached API response in the database.
 */
export interface ApiCache {
    id: string;
    query: string;
    source: string;
    response_data: any; // Stored as JSON string
    cached_at: number;
    expires_at: number;
}

export class ApiCacheRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    /**
     * Caches an API response.
     * @param query The search query.
     * @param source The API source (e.g., 'rxnorm').
     * @param response_data The JSON response data to cache.
     * @returns The newly created cache entry.
     */
    async cacheResponse(query: string, source: string, response_data: any): Promise<ApiCache> {
        const now = Date.now();
        const newCacheEntry: ApiCache = {
            id: generateUUID(),
            query,
            source,
            response_data: JSON.stringify(response_data),
            cached_at: now,
            expires_at: now + CACHE_DURATION_MS,
        };

        await this.db.runAsync(
            'INSERT INTO api_cache (id, query, source, response_data, cached_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
            [newCacheEntry.id, newCacheEntry.query, newCacheEntry.source, newCacheEntry.response_data, newCacheEntry.cached_at, newCacheEntry.expires_at]
        );
        // Return the object with the data parsed, as the application would expect
        return {
            ...newCacheEntry,
            response_data: JSON.parse(newCacheEntry.response_data)
        };
    }

    /**
     * Finds a cached response by query and source.
     * @param query The search query.
     * @param source The API source.
     * @returns The cached data, or null if not found or expired.
     */
    async find(query: string, source: string): Promise<any | null> {
        const result = await this.db.getFirstAsync<ApiCache>(
            'SELECT * FROM api_cache WHERE query = ? AND source = ? AND expires_at > ?',
            [query, source, Date.now()]
        );

        if (result) {
            // The data is stored as a JSON string, so we need to parse it
            return JSON.parse(result.response_data);
        }

        return null;
    }

    /**
     * Clears all expired cache entries from the database.
     */
    async clearExpired(): Promise<void> {
        await this.db.runAsync('DELETE FROM api_cache WHERE expires_at <= ?', [Date.now()]);
    }

    /**
     * Clears the entire API cache.
     */
    async clearAll(): Promise<void> {
        await this.db.runAsync('DELETE FROM api_cache');
    }
}
