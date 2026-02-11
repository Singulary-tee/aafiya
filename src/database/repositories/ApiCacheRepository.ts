
import { SQLiteDatabase } from 'expo-sqlite';
import { ApiCache, ApiCacheInput } from '../models/ApiCache';

export class ApiCacheRepository {
    private db: SQLiteDatabase;

    constructor(db: SQLiteDatabase) {
        this.db = db;
    }

    async get(key: string): Promise<ApiCache | null> {
        const result = await this.db.getFirstAsync<ApiCache>(
            'SELECT * FROM api_cache WHERE key = ? AND expires_at > ?;',
            [key, Date.now()]
        );
        return result || null;
    }

    async set(input: ApiCacheInput): Promise<void> {
        await this.db.runAsync(
            'INSERT OR REPLACE INTO api_cache (key, value, expires_at) VALUES (?, ?, ?);',
            [input.key, input.value, input.expires_at]
        );
    }

    async invalidate(key: string): Promise<void> {
        await this.db.runAsync('DELETE FROM api_cache WHERE key = ?;', [key]);
    }

    async clearExpired(): Promise<void> {
        await this.db.runAsync('DELETE FROM api_cache WHERE expires_at <= ?;', [Date.now()]);
    }

    async clearAll(): Promise<void> {
        await this.db.runAsync('DELETE FROM api_cache;');
    }
}
