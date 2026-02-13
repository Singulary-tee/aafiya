
import * as Crypto from 'expo-crypto';

/**
 * Generates a universally unique identifier (UUID) using the v4 standard.
 * This is used to create primary keys for database records.
 * @returns A new UUID string.
 */
export const generateUUID = (): string => {
  return Crypto.randomUUID();
};
