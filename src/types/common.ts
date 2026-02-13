/**
 * This file contains common TypeScript types used throughout the application.
 * These types are not specific to any single feature area.
 */

/**
 * A unique identifier, typically a UUID v4 string.
 */
export type ID = string;

/**
 * Represents the possible states for a medication dose log.
 * - 'taken': The dose was confirmed by the user.
 * - 'missed': The dose was not taken within the grace period.
 * - 'skipped': The user intentionally skipped the dose.
 */
export type DoseLogStatus = 'taken' | 'missed' | 'skipped';

/**
 * Represents the status of a dose in the UI, which includes 'pending' for upcoming doses.
 */
export type UIDoseStatus = DoseLogStatus | 'pending';

/**
 * Represents the textual rating of a health score, used for color-coding the UI.
 */
export type HealthRating = 'Healthy' | 'Needs Attention' | 'At Risk' | 'Critical';

/**
 * A generic type representing a value that may or may not exist.
 */
export type Maybe<T> = T | null | undefined;

/**
 * A generic type for a function that takes no arguments and returns nothing.
 * Useful for component props like onPress handlers that don't pass arguments.
 */
export type VoidFunction = () => void;
