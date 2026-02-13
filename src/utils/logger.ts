
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * A simple logger that only logs in development mode.
 * It is a wrapper around the console object.
 */
export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
};
