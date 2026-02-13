/**
 * Database Schema Migration v1 (Initial)
 * Creates all tables for medication tracking
 */

import * as SQLite from 'expo-sqlite';

export async function initializeDatabaseSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  // Check if schema already exists
  const tables = await db.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='profiles';"
  );

  if (tables.length > 0) {
    return; // Schema already initialized
  }

  // Create profiles table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX idx_profiles_created ON profiles(created_at);
  `);

  // Create medications table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS medications (
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
  `);

  // Create schedules table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      medication_id TEXT NOT NULL,
      time TEXT NOT NULL,
      days TEXT NOT NULL,
      grace_period_minutes INTEGER DEFAULT 30,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_schedules_medication ON schedules(medication_id);
    CREATE INDEX idx_schedules_active ON schedules(is_active);
  `);

  // Create dose_log table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dose_log (
      id TEXT PRIMARY KEY,
      schedule_id TEXT NOT NULL,
      medication_id TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      status TEXT NOT NULL,
      scheduled_time INTEGER NOT NULL,
      actual_time INTEGER,
      notes TEXT,
      is_auto_marked_missed INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
      FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_dose_log_schedule ON dose_log(schedule_id);
    CREATE INDEX idx_dose_log_medication ON dose_log(medication_id);
    CREATE INDEX idx_dose_log_profile ON dose_log(profile_id);
    CREATE INDEX idx_dose_log_status ON dose_log(status);
    CREATE INDEX idx_dose_log_time ON dose_log(scheduled_time);
  `);

  // Create health_metrics table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS health_metrics (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      medication_id TEXT,
      health_score INTEGER NOT NULL,
      streak_days INTEGER NOT NULL,
      last_dose_time INTEGER,
      adherence_percentage REAL NOT NULL,
      missed_doses_count INTEGER NOT NULL,
      late_doses_count INTEGER NOT NULL,
      skipped_doses_count INTEGER NOT NULL,
      total_doses_expected INTEGER NOT NULL,
      calculated_at INTEGER NOT NULL,
      period_start INTEGER NOT NULL,
      period_end INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (medication_id) REFERENCES medications(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_health_metrics_profile ON health_metrics(profile_id);
    CREATE INDEX idx_health_metrics_medication ON health_metrics(medication_id);
    CREATE INDEX idx_health_metrics_calculated ON health_metrics(calculated_at);
  `);

  // Create api_cache table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS api_cache (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      data TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX idx_api_cache_key ON api_cache(key);
    CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
  `);

  // Create helper_pairing table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS helper_pairing (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      pairing_key TEXT NOT NULL UNIQUE,
      helper_device_id TEXT,
      helper_name TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_helper_pairing_profile ON helper_pairing(profile_id);
    CREATE INDEX idx_helper_pairing_key ON helper_pairing(pairing_key);
  `);
}
