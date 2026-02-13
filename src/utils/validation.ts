
/**
 * Validates that a string is not empty and within a specified length range.
 * @param input - The string to validate.
 * @param minLength - The minimum allowed length.
 * @param maxLength - The maximum allowed length.
 * @returns True if the string is valid, false otherwise.
 */
const validateStringLength = (input: string, minLength: number, maxLength: number): boolean => {
  return typeof input === 'string' && input.length >= minLength && input.length <= maxLength;
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
 * Validates a medication name based on length constraints.
 * @param name - The medication name.
 * @returns True if valid (1-200 characters), false otherwise.
 */
export const validateMedicationName = (name: string): boolean => {
  return validateStringLength(name, 1, 200);
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
 * Validates the grace period in minutes.
 * @param minutes - The grace period.
 * @returns True if between 5 and 120 (inclusive), false otherwise.
 */
export const validateGracePeriod = (minutes: number): boolean => {
  return Number.isInteger(minutes) && minutes >= 5 && minutes <= 120;
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
