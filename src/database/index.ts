/**
 * Database Initialization
 * Sets up SQLite database with schema and migrations
 */

import * as SQLite from 'expo-sqlite';
import { DATABASE_CONFIG } from '../constants/config';
import { initializeDatabaseSchema } from './migrations/v1_initial';

let database: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync(DATABASE_CONFIG.NAME);

  // Enable foreign keys
  await database.execAsync('PRAGMA foreign_keys = ON;');

  // Initialize schema
  await initializeDatabaseSchema(database);

  return database;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    return initializeDatabase();
  }
  return database;
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
  }
}

/**
 * Execute a database transaction
 */
export async function executeTransaction<T>(
  callback: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDatabase();
  await db.execAsync('BEGIN TRANSACTION;');
  try {
    const result = await callback(db);
    await db.execAsync('COMMIT;');
    return result;
  } catch (error) {
    await db.execAsync('ROLLBACK;');
    throw error;
  }
}
