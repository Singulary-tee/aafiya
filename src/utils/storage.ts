/**
 * AsyncStorage Utility Functions
 * Centralized helpers for persisting app state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  LANGUAGE: 'app_language',
  ACTIVE_PROFILE_ID: 'active_profile_id',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  NOTIFICATION_SETTINGS: 'notification_settings',
  THEME_MODE: 'theme_mode',
} as const;

export async function setLanguage(language: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
}

export async function getLanguage(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
}

export async function setActiveProfileId(profileId: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, profileId);
}

export async function getActiveProfileId(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
}

export async function setOnboardingComplete(isComplete: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, JSON.stringify(isComplete));
}

export async function getOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return value ? JSON.parse(value) : false;
}

export async function setNotificationSettings(settings: Record<string, unknown>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
}

export async function getNotificationSettings(): Promise<Record<string, unknown>> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  return value ? JSON.parse(value) : {};
}

export async function setThemeMode(theme: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, theme);
}

export async function getThemeMode(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
}

export async function clearAppStorage(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  await AsyncStorage.multiRemove(keys);
}
