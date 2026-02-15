
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * A simple logger that only logs in development mode.
 * It is a wrapper around the console object.
 */
export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
};
