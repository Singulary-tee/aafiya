import * as SQLite from 'expo-sqlite';

const DB_NAME = 'medication_tracker.db';

/**
 * Executes a single SQL statement.
 * @param db The database instance.
 * @param sql The SQL statement to execute.
 */
const executeSql = async (db: SQLite.SQLiteDatabase, sql: string) => {
    try {
        await db.execAsync(sql);
    } catch (e) {
        console.error("Error executing SQL:", e);
        console.error("SQL statement:", sql);
        throw e;
    }
};

/**
 * Applies migrations to the database.
 * This function checks the current schema version and applies updates sequentially.
 * @param db The database instance.
 */
const applyMigrations = async (db: SQLite.SQLiteDatabase) => {
    await executeSql(db, 'PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await executeSql(db, 'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL);');
    
    const versionResult = await db.getFirstAsync<{ version: number }>('SELECT MAX(version) as version FROM schema_version;');
    let currentVersion = versionResult?.version ?? 0;

    if (currentVersion < 1) {
        await db.execAsync(`
            BEGIN TRANSACTION;

            -- Table: profiles
            CREATE TABLE profiles (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                avatar_color TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE INDEX idx_profiles_created ON profiles(created_at);

            -- Table: medications
            CREATE TABLE medications (
                id TEXT PRIMARY KEY,
                profile_id TEXT NOT NULL,
                rxcui TEXT,
                name TEXT NOT NULL,
                generic_name TEXT,
                brand_name TEXT,
                dosage_form TEXT,
                strength TEXT,
                initial_count INTEGER NOT NULL,
                current_count INTEGER NOT NULL,
                image_url TEXT,
                notes TEXT,
                is_active INTEGER DEFAULT 1,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            );
            CREATE INDEX idx_medications_profile ON medications(profile_id);
            CREATE INDEX idx_medications_active ON medications(is_active);
            CREATE INDEX idx_medications_rxcui ON medications(rxcui);

            -- Table: schedules
            CREATE TABLE schedules (
                id TEXT PRIMARY KEY,
                medication_id TEXT NOT NULL,
                times TEXT NOT NULL, -- JSON array of time strings ["09:00", "21:00"]
                days_of_week TEXT, -- JSON array [0,1,2,3,4,5,6] or null for daily
                grace_period_minutes INTEGER DEFAULT 30,
                notification_sound TEXT,
                is_active INTEGER DEFAULT 1,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
            );
            CREATE INDEX idx_schedules_medication ON schedules(medication_id);
            CREATE INDEX idx_schedules_active ON schedules(is_active);

            -- Table: dose_log
            CREATE TABLE dose_log (
                id TEXT PRIMARY KEY,
                medication_id TEXT NOT NULL,
                schedule_id TEXT NOT NULL,
                scheduled_time INTEGER NOT NULL,
                actual_time INTEGER,
                status TEXT NOT NULL, -- 'taken', 'missed', 'skipped'
                notes TEXT,
                created_at INTEGER NOT NULL,
                FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
                FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE
            );
            CREATE INDEX idx_dose_log_medication ON dose_log(medication_id);
            CREATE INDEX idx_dose_log_scheduled_time ON dose_log(scheduled_time);
            CREATE INDEX idx_dose_log_status ON dose_log(status);
            CREATE INDEX idx_dose_log_created ON dose_log(created_at);

            -- Table: health_metrics
            CREATE TABLE health_metrics (
                profile_id TEXT PRIMARY KEY,
                health_score REAL NOT NULL DEFAULT 100.0,
                last_calculated INTEGER NOT NULL,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            );

            -- Table: api_cache
            CREATE TABLE api_cache (
                id TEXT PRIMARY KEY,
                query TEXT NOT NULL,
                source TEXT NOT NULL,
                response_data TEXT NOT NULL,
                cached_at INTEGER NOT NULL,
                expires_at INTEGER NOT NULL
            );
            CREATE INDEX idx_api_cache_query ON api_cache(query, source);
            CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);

            -- Table: helper_pairings
            CREATE TABLE helper_pairings (
                id TEXT PRIMARY KEY,
                profile_id TEXT NOT NULL,
                helper_device_id TEXT NOT NULL,
                encryption_key TEXT NOT NULL,
                paired_at INTEGER NOT NULL,
                last_sync INTEGER,
                is_active INTEGER DEFAULT 1,
                FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
            );
            CREATE INDEX idx_helper_pairings_profile ON helper_pairings(profile_id);
            CREATE INDEX idx_helper_pairings_device ON helper_pairings(helper_device_id);

            -- Update schema version
            INSERT INTO schema_version (version, applied_at) VALUES (1, strftime('%s', 'now'));

            COMMIT;
        `);
        console.log('Database schema version 1 created successfully.');
    }
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Opens and initializes the application database.
 * This is a singleton and will return the existing database instance if already created.
 * @returns A promise resolving to the database instance.
 */
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (dbInstance) {
        return dbInstance;
    }

    const db = await SQLite.openDatabaseAsync(DB_NAME);
    await applyMigrations(db);
    dbInstance = db;
    console.log('Database connection opened successfully.');
    return db;
};
