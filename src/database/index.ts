
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'medication_tracker.db';

/**
 * Initializes the database, creates tables if they don't exist, and runs migrations.
 * @returns A promise that resolves with the database instance.
 */
export const initializeDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Check schema version
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        applied_at INTEGER NOT NULL
    );
  `);

  const result = await db.getFirstAsync<{ version?: number }>('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1');
  const currentVersion = result?.version || 0;

  if (currentVersion < 1) {
    await db.execAsync(`
        -- Wrap schema creation in a transaction
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
            times TEXT NOT NULL,
            days_of_week TEXT,
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
            status TEXT NOT NULL,
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

  // Placeholder for future migrations
  // if (currentVersion < 2) { ... }

  return db;
};
