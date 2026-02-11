/**
 * Application Constants
 * Central location for configuration values
 */

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Aafiya',
  VERSION: '1.0.0',
  DEFAULT_GRACE_PERIOD_MINUTES: 30,
  MAX_GRACE_PERIOD_MINUTES: 120,
  MIN_GRACE_PERIOD_MINUTES: 0,
  HEALTH_SCORE_CALCULATION_DAYS: 30,
  STREAK_CALCULATION_DAYS: 7,
  MISSED_DOSE_PENALTY: 10,
  LATE_DOSE_PENALTY: 5,
  SKIPPED_DOSE_PENALTY: 3,
  HEALTH_RECOVERY_PER_ON_TIME: 2,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  RXNORM_BASE: 'https://rxnav.nlm.nih.gov/REST',
  OPENFDA_BASE: 'https://api.fda.gov/drug',
  DAILYMED_BASE: 'https://dailymed.nlm.nih.gov/dailymed',
} as const;

// Rate Limits
export const RATE_LIMITS = {
  RXNORM_REQUESTS_PER_SECOND: 20,
  OPENFDA_REQUESTS_PER_SECOND: 240,
  API_CACHE_DURATION_HOURS: 24,
} as const;

// Database
export const DATABASE_CONFIG = {
  NAME: 'medication_tracker.db',
  SCHEMA_VERSION: 1,
} as const;

// Notification
export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'medication-reminders',
  CHANNEL_NAME: 'Medication Reminders',
  CHANNEL_DESCRIPTION: 'Notifications for medication reminders',
} as const;
