
// App Information
export const APP_CONFIG = {
  DATABASE_NAME: 'medication_tracker.db',
  SCHEMA_VERSION: 1,
};

// API Configuration
export const API_CONFIG = {
  CACHE_DURATION_DAYS: 30,
  RXNORM_RATE_LIMIT_RPS: 15, // Requests per second
  OPENFDA_RATE_LIMIT_RPS: 3,   // 180 requests per minute
  REQUEST_TIMEOUT: 10000,    // 10 seconds
};

// UI/UX Configuration
export const UI_CONFIG = {
  SEARCH_DEBOUNCE_MS: 300,
  MIN_TOUCH_TARGET_SIZE: 44,
};

// Notification System
export const NOTIFICATION_CONFIG = {
  DEFAULT_GRACE_PERIOD_MINUTES: 30,
  MIN_GRACE_PERIOD_MINUTES: 5,
  MAX_GRACE_PERIOD_MINUTES: 120,
  MISSED_DOSE_CHECK_INTERVAL_MINUTES: 15,
  NOTIFICATION_CHANNEL_ID: 'medication-reminders',
};

// Gamification - Health Score
export const HEALTH_SCORE_CONFIG = {
  PERFECT_DOSE_BONUS: 2,       // Score increase for on-time dose
  LATE_DOSE_PENALTY: 3,        // Score decrease for late dose (within grace period)
  SKIPPED_DOSE_PENALTY: 3,     // Score decrease for skipped dose
  MISSED_DOSE_PENALTY: 10,       // Score decrease for missed dose
  MAX_SCORE: 100,
  MIN_SCORE: 0,
};

// Gamification - Storage Indicators
export const STORAGE_LEVELS = {
  GOOD: 14,  // 14+ days remaining (Green)
  LOW: 7,    // 7-13 days remaining (Yellow)
  URGENT: 0, // <7 days remaining (Red)
};

// Family Helper Mode
export const HELPER_MODE_CONFIG = {
  QR_CODE_EXPIRATION_MINUTES: 5,
  WEBSOCKET_PORT: 3000,
  MDNS_SERVICE_TYPE: 'medication-tracker',
  MDNS_SERVICE_DOMAIN: 'local',
};
