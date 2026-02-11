/**
 * Encryption Utility Functions
 * Helpers for encrypting sensitive helper pairing data
 */

import * as Crypto from 'expo-crypto';

export async function encryptData(data: string, key: string): Promise<string> {
  const encrypted = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data + key);
  return encrypted;
}

export async function hashString(string: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, string);
}

export function generateRandomString(length: number = 32): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
