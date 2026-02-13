
import { getLocales } from 'expo-localization';

/**
 * Formats a date into a localized string (e.g., "February 11, 2026").
 * @param date - The date to format.
 * @returns A localized date string.
 */
export const formatDate = (date: Date): string => {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Formats a date into a localized time string (e.g., "9:00 AM").
 * @param date - The date to format.
 * @returns A localized time string.
 */
export const formatTime = (date: Date): string => {
  const locale = getLocales()[0]?.languageTag ?? 'en-US';
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

/**
 * Formats a number into a string, with an option to use Eastern Arabic numerals.
 * @param num - The number to format.
 * @param useEasternArabic - Whether to use Eastern Arabic numerals.
 * @returns A formatted number string.
 */
export const formatNumber = (num: number, useEasternArabic: boolean): string => {
  if (!useEasternArabic) {
    return num.toString();
  }
  const easternNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => {
    const parsed = parseInt(d, 10);
    return isNaN(parsed) ? d : easternNumerals[parsed];
  }).join('');
};

/**
 * Calculates the number of days remaining for a medication supply.
 * @param currentCount - The current number of pills.
 * @param dosesPerDay - The number of doses taken per day.
 * @returns The estimated number of days remaining.
 */
export const calculateDaysRemaining = (currentCount: number, dosesPerDay: number): number => {
  if (dosesPerDay <= 0) {
    return Infinity;
  }
  return Math.floor(currentCount / dosesPerDay);
};
