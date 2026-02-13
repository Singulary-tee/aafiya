
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// AsyncStorage for non-sensitive data

/**
 * Stores a value in AsyncStorage.
 * @param key - The key to store the value under.
 * @param value - The value to store (will be stringified).
 */
export const storeData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Failed to save data to AsyncStorage', e);
  }
};

/**
 * Retrieves a value from AsyncStorage.
 * @param key - The key of the value to retrieve.
 * @returns The parsed value, or null if not found.
 */
export const getData = async (key: string): Promise<any> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to fetch data from AsyncStorage', e);
    return null;
  }
};

// SecureStore for sensitive data

/**
 * Stores a value securely in SecureStore.
 * @param key - The key to store the value under.
 * @param value - The string value to store.
 */
export const storeSecureData = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.error('Failed to save data to SecureStore', e);
  }
};

/**
 * Retrieves a value from SecureStore.
 * @param key - The key of the value to retrieve.
 * @returns The value, or null if not found.
 */
export const getSecureData = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (e) {
    console.error('Failed to fetch data from SecureStore', e);
    return null;
  }
};
