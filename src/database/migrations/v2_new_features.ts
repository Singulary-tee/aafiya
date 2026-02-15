import * as SQLite from 'expo-sqlite';

/**
 * Migration v2: Adds new features including therapy tracking, archive, pause/resume,
 * custom health metrics, and delayed dose status
 */
export const applyMigrationV2 = async (db: SQLite.SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
        -- Add new columns to medications table for therapy tracking
        ALTER TABLE medications ADD COLUMN therapy_type TEXT; -- 'limited' or NULL for ongoing
        ALTER TABLE medications ADD COLUMN therapy_duration INTEGER; -- Number of days for limited therapy
        ALTER TABLE medications ADD COLUMN therapy_start_date INTEGER; -- Unix timestamp when therapy started
        
        -- Add archive fields
        ALTER TABLE medications ADD COLUMN archived INTEGER DEFAULT 0; -- 1 for archived, 0 for active
        ALTER TABLE medications ADD COLUMN archived_at INTEGER; -- Unix timestamp when archived
        
        -- Add pause/resume fields
        ALTER TABLE medications ADD COLUMN paused INTEGER DEFAULT 0; -- 1 for paused, 0 for active
        ALTER TABLE medications ADD COLUMN paused_at INTEGER; -- Unix timestamp when paused
        ALTER TABLE medications ADD COLUMN pause_reason TEXT; -- Reason for pausing
        
        -- Create custom health metrics table for BP, glucose, etc.
        CREATE TABLE IF NOT EXISTS custom_health_metrics (
            id TEXT PRIMARY KEY,
            profile_id TEXT NOT NULL,
            metric_type TEXT NOT NULL, -- 'blood_pressure', 'glucose', 'weight', etc.
            value TEXT NOT NULL, -- JSON string for complex values like BP (systolic/diastolic)
            unit TEXT, -- 'mmHg', 'mg/dL', etc.
            notes TEXT,
            recorded_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_custom_health_metrics_profile ON custom_health_metrics(profile_id);
        CREATE INDEX IF NOT EXISTS idx_custom_health_metrics_type ON custom_health_metrics(metric_type);
        CREATE INDEX IF NOT EXISTS idx_custom_health_metrics_recorded ON custom_health_metrics(recorded_at);
        
        -- Update schema version
        INSERT INTO schema_version (version, applied_at) VALUES (2, strftime('%s', 'now'));
    `);
};
