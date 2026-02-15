import * as FileSystem from 'expo-file-system';
import { SQLiteDatabase } from 'expo-sqlite';
import { logger } from './logger';
import { Alert, Platform } from 'react-native';
import { APP_CONFIG } from '../constants/config';

/**
 * Export all app data to a JSON file
 */
export async function exportAllData(db: SQLiteDatabase): Promise<string | null> {
  try {
    logger.log('[DataExport] Starting data export...');

    // Get all data from all tables
    const profiles = await db.getAllAsync('SELECT * FROM profiles');
    const medications = await db.getAllAsync('SELECT * FROM medications');
    const schedules = await db.getAllAsync('SELECT * FROM schedules');
    const doseLogs = await db.getAllAsync('SELECT * FROM dose_log');
    const healthMetrics = await db.getAllAsync('SELECT * FROM health_metrics');
    const helperPairings = await db.getAllAsync('SELECT * FROM helper_pairing');

    const exportData = {
      version: APP_CONFIG.VERSION,
      exportDate: new Date().toISOString(),
      data: {
        profiles,
        medications,
        schedules,
        doseLogs,
        healthMetrics,
        helperPairings,
      },
    };

    // Create file path
    const fileName = `aafiya_backup_${Date.now()}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write to file
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));

    logger.log(`[DataExport] Data exported to ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('[DataExport] Error exporting data:', error);
    return null;
  }
}

/**
 * Export medication statistics for a specific medication
 */
export async function exportMedicationStats(
  db: SQLiteDatabase,
  medicationId: string
): Promise<string | null> {
  try {
    logger.log(`[DataExport] Exporting stats for medication ${medicationId}`);

    // Get medication info
    const medication = await db.getFirstAsync(
      'SELECT * FROM medications WHERE id = ?',
      [medicationId]
    );

    if (!medication) {
      logger.warn('[DataExport] Medication not found');
      return null;
    }

    // Get schedules
    const schedules = await db.getAllAsync(
      'SELECT * FROM schedules WHERE medication_id = ?',
      [medicationId]
    );

    // Get dose logs
    const doseLogs = await db.getAllAsync(
      'SELECT * FROM dose_log WHERE medication_id = ? ORDER BY scheduled_time DESC',
      [medicationId]
    );

    // Calculate statistics
    const totalDoses = doseLogs.length;
    const takenDoses = doseLogs.filter((log: any) => log.status === 'taken').length;
    const missedDoses = doseLogs.filter((log: any) => log.status === 'missed').length;
    const skippedDoses = doseLogs.filter((log: any) => log.status === 'skipped').length;
    const adherenceRate = totalDoses > 0 ? (takenDoses / totalDoses) * 100 : 0;

    const statsData = {
      version: APP_CONFIG.VERSION,
      exportDate: new Date().toISOString(),
      medication,
      schedules,
      statistics: {
        totalDoses,
        takenDoses,
        missedDoses,
        skippedDoses,
        adherenceRate: adherenceRate.toFixed(2),
      },
      doseHistory: doseLogs,
    };

    // Create file path
    const fileName = `aafiya_stats_${(medication as any).name}_${Date.now()}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write to file
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(statsData, null, 2));

    logger.log(`[DataExport] Stats exported to ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('[DataExport] Error exporting medication stats:', error);
    return null;
  }
}

/**
 * Export a single profile with all associated data
 */
export async function exportProfile(
  db: SQLiteDatabase,
  profileId: string
): Promise<string | null> {
  try {
    logger.log(`[DataExport] Exporting profile ${profileId}`);

    // Get profile
    const profile = await db.getFirstAsync(
      'SELECT * FROM profiles WHERE id = ?',
      [profileId]
    );

    if (!profile) {
      logger.warn('[DataExport] Profile not found');
      return null;
    }

    // Get all related data
    const medications = await db.getAllAsync(
      'SELECT * FROM medications WHERE profile_id = ?',
      [profileId]
    );

    const medicationIds = (medications as any[]).map((m) => m.id);

    // Get schedules for all medications
    const schedules: any[] = [];
    const doseLogs: any[] = [];
    for (const medId of medicationIds) {
      const medSchedules = await db.getAllAsync(
        'SELECT * FROM schedules WHERE medication_id = ?',
        [medId]
      );
      const medDoseLogs = await db.getAllAsync(
        'SELECT * FROM dose_log WHERE medication_id = ?',
        [medId]
      );
      schedules.push(...medSchedules);
      doseLogs.push(...medDoseLogs);
    }

    const healthMetrics = await db.getAllAsync(
      'SELECT * FROM health_metrics WHERE profile_id = ?',
      [profileId]
    );

    const helperPairings = await db.getAllAsync(
      'SELECT * FROM helper_pairing WHERE profile_id = ?',
      [profileId]
    );

    const exportData = {
      version: APP_CONFIG.VERSION,
      exportDate: new Date().toISOString(),
      profile,
      data: {
        medications,
        schedules,
        doseLogs,
        healthMetrics,
        helperPairings,
      },
    };

    // Create file path
    const fileName = `aafiya_profile_${(profile as any).name}_${Date.now()}.json`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write to file
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));

    logger.log(`[DataExport] Profile exported to ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error('[DataExport] Error exporting profile:', error);
    return null;
  }
}

/**
 * Import data from a JSON file
 * Note: This is a basic implementation and should be enhanced with validation
 */
export async function importData(
  db: SQLiteDatabase,
  filePath: string
): Promise<boolean> {
  try {
    logger.log('[DataImport] Starting data import...');

    // Read file
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    const importData = JSON.parse(fileContent);

    if (!importData.version || !importData.data) {
      logger.error('[DataImport] Invalid file format');
      return false;
    }

    // Import data (this is a simplified version)
    // In production, you'd want to handle conflicts, validate data, etc.

    const { profiles, medications, schedules, doseLogs, healthMetrics, helperPairings } = importData.data;

    // Import profiles
    if (profiles && Array.isArray(profiles)) {
      for (const profile of profiles) {
        await db.runAsync(
          `INSERT OR REPLACE INTO profiles (id, name, avatar_color, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [profile.id, profile.name, profile.avatar_color, profile.created_at, profile.updated_at]
        );
      }
    }

    // Import medications
    if (medications && Array.isArray(medications)) {
      for (const med of medications) {
        await db.runAsync(
          `INSERT OR REPLACE INTO medications (id, profile_id, rxcui, name, generic_name, brand_name, 
           dosage_form, strength, initial_count, current_count, image_url, notes, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [med.id, med.profile_id, med.rxcui, med.name, med.generic_name, med.brand_name,
           med.dosage_form, med.strength, med.initial_count, med.current_count, med.image_url,
           med.notes, med.is_active, med.created_at, med.updated_at]
        );
      }
    }

    // Import schedules
    if (schedules && Array.isArray(schedules)) {
      for (const schedule of schedules) {
        await db.runAsync(
          `INSERT OR REPLACE INTO schedules (id, medication_id, times, days_of_week, 
           grace_period_minutes, notification_sound, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [schedule.id, schedule.medication_id, schedule.times, schedule.days_of_week,
           schedule.grace_period_minutes, schedule.notification_sound, schedule.is_active,
           schedule.created_at, schedule.updated_at]
        );
      }
    }

    // Import dose logs
    if (doseLogs && Array.isArray(doseLogs)) {
      for (const log of doseLogs) {
        await db.runAsync(
          `INSERT OR REPLACE INTO dose_log (id, schedule_id, medication_id, profile_id, status, 
           scheduled_time, actual_time, notes, is_auto_marked_missed, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [log.id, log.schedule_id, log.medication_id, log.profile_id, log.status,
           log.scheduled_time, log.actual_time, log.notes, log.is_auto_marked_missed,
           log.created_at, log.updated_at]
        );
      }
    }

    // Import health metrics
    if (healthMetrics && Array.isArray(healthMetrics)) {
      for (const metric of healthMetrics) {
        await db.runAsync(
          `INSERT OR REPLACE INTO health_metrics (id, profile_id, medication_id, health_score, 
           streak_days, last_dose_time, adherence_percentage, missed_doses_count, late_doses_count, 
           skipped_doses_count, total_doses_expected, calculated_at, period_start, period_end) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [metric.id, metric.profile_id, metric.medication_id, metric.health_score,
           metric.streak_days, metric.last_dose_time, metric.adherence_percentage, metric.missed_doses_count,
           metric.late_doses_count, metric.skipped_doses_count, metric.total_doses_expected,
           metric.calculated_at, metric.period_start, metric.period_end]
        );
      }
    }

    // Import helper pairings
    if (helperPairings && Array.isArray(helperPairings)) {
      for (const pairing of helperPairings) {
        await db.runAsync(
          `INSERT OR REPLACE INTO helper_pairing (id, profile_id, pairing_key, helper_device_id, 
           helper_name, is_active, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [pairing.id, pairing.profile_id, pairing.pairing_key, pairing.helper_device_id,
           pairing.helper_name, pairing.is_active, pairing.created_at, pairing.updated_at]
        );
      }
    }

    logger.log('[DataImport] Data imported successfully');
    return true;
  } catch (error) {
    logger.error('[DataImport] Error importing data:', error);
    return false;
  }
}
