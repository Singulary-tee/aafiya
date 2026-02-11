/**
 * Logger Utility
 * Simple logging utility for development
 * Can be extended for production analytics
 */

const isDevelopment = __DEV__;

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

let currentLogLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

export const logger = {
  setLogLevel(level: LogLevel) {
    currentLogLevel = level;
  },

  debug(...args: unknown[]) {
    if (currentLogLevel <= LogLevel.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  info(...args: unknown[]) {
    if (currentLogLevel <= LogLevel.INFO) {
      console.log('[INFO]', ...args);
    }
  },

  warn(...args: unknown[]) {
    if (currentLogLevel <= LogLevel.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  error(...args: unknown[]) {
    if (currentLogLevel <= LogLevel.ERROR) {
      console.error('[ERROR]', ...args);
    }
  },
};

export default logger;
