
import * as Crypto from 'expo-crypto';
import CryptoJS from 'crypto-js';

/**
 * Generates a random 256-bit encryption key.
 * @returns A Base64 encoded encryption key.
 */
export const generateEncryptionKey = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  // Convert Uint8Array to a string of characters before Base64 encoding
  const charString = Array.from(randomBytes).map(byte => String.fromCharCode(byte)).join('');
  return btoa(charString);
};

/**
 * Encrypts data using AES-256.
 * @param data - The data to encrypt (will be stringified).
 * @param key - The Base64 encoded encryption key.
 * @returns The encrypted ciphertext.
 */
export const encryptData = (data: any, key: string): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

/**
 * Decrypts data using AES-256.
 * @param ciphertext - The encrypted data.
 * @param key - The Base64 encoded encryption key.
 * @returns The decrypted data (parsed from JSON).
 */
export const decryptData = (ciphertext: string, key: string): any => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new Error('Decryption failed. Invalid key or ciphertext.');
  }
  return JSON.parse(decryptedString);
};
