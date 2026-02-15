import { SQLiteDatabase } from 'expo-sqlite';
import { logger } from './logger';

/**
 * Transaction result type
 */
export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Executes a database operation within a transaction.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK on error.
 * 
 * @param db - The SQLite database instance
 * @param operation - The async function to execute within the transaction
 * @param operationName - Name of the operation for logging
 * @returns Transaction result with success status and data or error
 */
export async function withTransaction<T>(
  db: SQLiteDatabase,
  operation: (db: SQLiteDatabase) => Promise<T>,
  operationName: string = 'database operation'
): Promise<TransactionResult<T>> {
  try {
    await db.execAsync('BEGIN TRANSACTION');
    
    try {
      const result = await operation(db);
      await db.execAsync('COMMIT');
      return { success: true, data: result };
    } catch (error) {
      await db.execAsync('ROLLBACK');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Transaction failed for ${operationName}:`, error);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to start transaction for ${operationName}:`, error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Safely executes a database operation with error handling.
 * Does not use transactions - use withTransaction for multi-step operations.
 * 
 * @param operation - The async database operation
 * @param operationName - Name of the operation for logging
 * @returns Result with success status and data or error
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  operationName: string = 'database operation'
): Promise<TransactionResult<T>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`${operationName} failed:`, error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Logs a dose and decrements pill count atomically in a single transaction.
 * Ensures data consistency by preventing partial updates.
 * 
 * @param db - The SQLite database instance
 * @param doseLogData - Data for creating the dose log
 * @param medicationId - ID of the medication to decrement count
 * @returns Transaction result
 */
export async function logDoseAndDecrementCount(
  db: SQLiteDatabase,
  doseLogId: string,
  doseLogData: {
    profile_id: string;
    medication_id: string;
    schedule_id: string | null;
    scheduled_time: number;
    actual_time: number | null;
    status: string;
    notes: string | null;
  },
  medicationId: string
): Promise<TransactionResult<{ doseLogId: string; newCount: number }>> {
  return withTransaction(
    db,
    async (db) => {
      const now = Date.now();
      
      // Check current medication count
      const medication = await db.getFirstAsync<{ current_count: number }>(
        'SELECT current_count FROM medications WHERE id = ?',
        [medicationId]
      );
      
      if (!medication) {
        throw new Error('Medication not found');
      }
      
      if (medication.current_count <= 0) {
        throw new Error('No pills remaining');
      }
      
      // Insert dose log
      await db.runAsync(
        `INSERT INTO dose_log (id, profile_id, medication_id, schedule_id, scheduled_time, actual_time, status, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          doseLogId,
          doseLogData.profile_id,
          doseLogData.medication_id,
          doseLogData.schedule_id,
          doseLogData.scheduled_time,
          doseLogData.actual_time,
          doseLogData.status,
          doseLogData.notes,
          now,
          now
        ]
      );
      
      // Decrement pill count
      const newCount = medication.current_count - 1;
      await db.runAsync(
        'UPDATE medications SET current_count = ?, updated_at = ? WHERE id = ?',
        [newCount, now, medicationId]
      );
      
      return { doseLogId, newCount };
    },
    'log dose and decrement count'
  );
}
