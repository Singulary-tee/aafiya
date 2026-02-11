/**
 * Validation Utility Functions
 * Input validation for medications, schedules, profiles
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate medication name
 * Requirements: 1-200 characters, required
 */
export function validateMedicationName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Medication name is required' };
  }
  if (name.length > 200) {
    return { field: 'name', message: 'Medication name cannot exceed 200 characters' };
  }
  return null;
}

/**
 * Validate profile name
 * Requirements: 1-50 characters, required
 */
export function validateProfileName(name: string): ValidationError | null {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Profile name is required' };
  }
  if (name.length > 50) {
    return { field: 'name', message: 'Profile name cannot exceed 50 characters' };
  }
  return null;
}

/**
 * Validate hex color code
 */
export function validateHexColor(color: string): ValidationError | null {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(color)) {
    return { field: 'color', message: 'Invalid hex color code' };
  }
  return null;
}

/**
 * Validate pill count
 * Requirements: integer >= 0
 */
export function validatePillCount(count: number): ValidationError | null {
  if (!Number.isInteger(count)) {
    return { field: 'count', message: 'Pill count must be a whole number' };
  }
  if (count < 0) {
    return { field: 'count', message: 'Pill count cannot be negative' };
  }
  return null;
}

/**
 * Validate time string format (HH:mm)
 */
export function validateTimeFormat(time: string): ValidationError | null {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { field: 'time', message: 'Invalid time format. Use HH:mm' };
  }
  return null;
}

/**
 * Validate grace period in minutes
 * Requirements: 0-120 minutes
 */
export function validateGracePeriod(minutes: number): ValidationError | null {
  if (!Number.isInteger(minutes)) {
    return { field: 'gracePeriod', message: 'Grace period must be a whole number' };
  }
  if (minutes < 0 || minutes > 120) {
    return { field: 'gracePeriod', message: 'Grace period must be between 0 and 120 minutes' };
  }
  return null;
}

/**
 * Validate that current_count doesn't exceed initial_count
 */
export function validatePillCountConsistency(initialCount: number, currentCount: number): ValidationError | null {
  if (currentCount > initialCount) {
    return { field: 'currentCount', message: 'Current count cannot exceed initial count' };
  }
  return null;
}
