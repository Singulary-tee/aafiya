/**
 * Date Utility Functions
 * Date formatting and calculations for scheduling
 */

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function getDateFromTimestamp(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export function getTimestampFromDate(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function formatTime(timestamp: number, locale: string = 'en-US'): string {
  const date = getDateFromTimestamp(timestamp);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: number, locale: string = 'en-US'): string {
  const date = getDateFromTimestamp(timestamp);
  return date.toLocaleDateString(locale);
}

export function formatDateTime(timestamp: number, locale: string = 'en-US'): string {
  const date = getDateFromTimestamp(timestamp);
  return date.toLocaleString(locale);
}

/**
 * Parse time string in HH:mm format to today's timestamp
 */
export function parseTimeToTodayTimestamp(timeString: string): number {
  const today = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  const scheduledDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, 0);
  return getTimestampFromDate(scheduledDate);
}

/**
 * Check if a timestamp is within grace period from scheduled time
 */
export function isWithinGracePeriod(scheduledTime: number, gracePeriodMinutes: number, currentTime: number = getCurrentTimestamp()): boolean {
  const gracePeriodSeconds = gracePeriodMinutes * 60;
  const endOfGracePeriod = scheduledTime + gracePeriodSeconds;
  return currentTime <= endOfGracePeriod;
}

/**
 * Calculate streak based on dose logs
 */
export function calculateStreak(doseLogs: Array<{ status: string; scheduled_time: number }>): number {
  if (doseLogs.length === 0) return 0;

  let streak = 0;
  const sortedLogs = [...doseLogs].sort((a, b) => b.scheduled_time - a.scheduled_time);

  for (const log of sortedLogs) {
    if (log.status === 'taken') {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
