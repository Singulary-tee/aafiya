/**
 * Validation result type with error message
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates that a string is not empty and within a specified length range.
 * @param input - The string to validate.
 * @param minLength - The minimum allowed length.
 * @param maxLength - The maximum allowed length.
 * @returns True if the string is valid, false otherwise.
 */
const validateStringLength = (input: string, minLength: number, maxLength: number): boolean => {
  return typeof input === 'string' && input.trim().length >= minLength && input.trim().length <= maxLength;
};

/**
 * Validates a profile name based on length constraints.
 * @param name - The profile name.
 * @returns True if valid (1-50 characters), false otherwise.
 */
export const validateProfileName = (name: string): boolean => {
  return validateStringLength(name, 1, 50);
};

/**
 * Validates a profile name with detailed error message.
 * @param name - The profile name.
 * @returns Validation result with error message if invalid.
 */
export const validateProfileNameWithError = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Profile name is required' };
  }
  if (name.trim().length < 1) {
    return { isValid: false, error: 'Profile name must be at least 1 character' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Profile name must be 50 characters or less' };
  }
  return { isValid: true };
};

/**
 * Validates a medication name based on length constraints.
 * @param name - The medication name.
 * @returns True if valid (1-200 characters), false otherwise.
 */
export const validateMedicationName = (name: string): boolean => {
  return validateStringLength(name, 1, 200);
};

/**
 * Validates a medication name with detailed error message.
 * @param name - The medication name.
 * @returns Validation result with error message if invalid.
 */
export const validateMedicationNameWithError = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Medication name is required' };
  }
  if (name.trim().length < 1) {
    return { isValid: false, error: 'Medication name must be at least 1 character' };
  }
  if (name.trim().length > 200) {
    return { isValid: false, error: 'Medication name must be 200 characters or less' };
  }
  return { isValid: true };
};

/**
 * Validates a hex color code.
 * @param color - The color string.
 * @returns True if it's a valid #RRGGBB format, false otherwise.
 */
export const validateHexColor = (color: string): boolean => {
  return /^#[0-9a-fA-F]{6}$/.test(color);
};

/**
 * Validates if a number is a non-negative integer.
 * @param count - The number to validate.
 * @returns True if it's a non-negative integer, false otherwise.
 */
export const validateCount = (count: number): boolean => {
  return Number.isInteger(count) && count >= 0;
};

/**
 * Validates pill count with detailed error message.
 * @param count - The pill count.
 * @returns Validation result with error message if invalid.
 */
export const validatePillCountWithError = (count: number | string): ValidationResult => {
  const numCount = typeof count === 'string' ? parseFloat(count) : count;
  
  if (isNaN(numCount)) {
    return { isValid: false, error: 'Pill count must be a number' };
  }
  if (!Number.isInteger(numCount)) {
    return { isValid: false, error: 'Pill count must be a whole number' };
  }
  if (numCount < 0) {
    return { isValid: false, error: 'Pill count must be a positive number' };
  }
  if (numCount > 9999) {
    return { isValid: false, error: 'Pill count must be 9999 or less' };
  }
  return { isValid: true };
};

/**
 * Validates an array of time strings in HH:MM format.
 * @param times - The array of time strings.
 * @returns True if the array is valid, false otherwise.
 */
export const validateScheduleTimes = (times: string[]): boolean => {
  if (!Array.isArray(times) || times.length === 0) return false;
  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  return times.every(time => timeRegex.test(time));
};

/**
 * Validates schedule times with detailed error message.
 * @param times - The array of time strings.
 * @returns Validation result with error message if invalid.
 */
export const validateScheduleTimesWithError = (times: string[]): ValidationResult => {
  if (!Array.isArray(times)) {
    return { isValid: false, error: 'Times must be an array' };
  }
  if (times.length === 0) {
    return { isValid: false, error: 'At least one time is required' };
  }
  const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const invalidTimes = times.filter(time => !timeRegex.test(time));
  if (invalidTimes.length > 0) {
    return { isValid: false, error: `Invalid time format: ${invalidTimes[0]}. Use HH:MM format` };
  }
  return { isValid: true };
};

/**
 * Validates the grace period in minutes.
 * @param minutes - The grace period.
 * @returns True if between 5 and 120 (inclusive), false otherwise.
 */
export const validateGracePeriod = (minutes: number): boolean => {
  return Number.isInteger(minutes) && minutes >= 5 && minutes <= 120;
};

/**
 * Validates grace period with detailed error message.
 * @param minutes - The grace period in minutes.
 * @returns Validation result with error message if invalid.
 */
export const validateGracePeriodWithError = (minutes: number | string): ValidationResult => {
  const numMinutes = typeof minutes === 'string' ? parseFloat(minutes) : minutes;
  
  if (isNaN(numMinutes)) {
    return { isValid: false, error: 'Grace period must be a number' };
  }
  if (!Number.isInteger(numMinutes)) {
    return { isValid: false, error: 'Grace period must be a whole number' };
  }
  if (numMinutes < 5) {
    return { isValid: false, error: 'Grace period must be at least 5 minutes' };
  }
  if (numMinutes > 120) {
    return { isValid: false, error: 'Grace period must be 120 minutes or less' };
  }
  return { isValid: true };
};

/**
 * Validates the days of the week array.
 * @param days - An array of numbers (0-6) or null.
 * @returns True if valid, false otherwise.
 */
export const validateDaysOfWeek = (days: number[] | null): boolean => {
  if (days === null) return true;
  if (!Array.isArray(days)) return false;
  const uniqueDays = new Set(days);
  if (uniqueDays.size !== days.length) return false; // No duplicates
  return days.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
};
