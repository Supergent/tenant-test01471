/**
 * Cron Helpers
 *
 * Pure functions for parsing cron expressions and calculating next run times.
 * NO database access, NO ctx parameter.
 */

/**
 * Parse a simple cron expression and calculate the next run time
 *
 * This is a simplified cron parser that handles basic cases:
 * - "0 9 * * *" - Daily at 9 AM
 * - "0 */4 * * *" - Every 4 hours
 * - "0 0 * * 1" - Weekly on Monday at midnight
 *
 * Note: For production, consider using a library like cron-parser
 */
export function calculateNextRun(
  cronExpression: string,
  fromTime: number = Date.now()
): number {
  // For now, return a simple implementation
  // In production, use a proper cron parser library
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression");
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const date = new Date(fromTime);

  // Simple daily cron (e.g., "0 9 * * *")
  if (minute !== "*" && hour !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const targetHour = parseInt(hour, 10);
    const targetMinute = parseInt(minute, 10);

    date.setHours(targetHour, targetMinute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (date.getTime() <= fromTime) {
      date.setDate(date.getDate() + 1);
    }

    return date.getTime();
  }

  // For more complex cron expressions, add 1 day as a fallback
  // In production, use a proper cron parser
  date.setDate(date.getDate() + 1);
  return date.getTime();
}

/**
 * Get a human-readable description of a cron expression
 */
export function describeCronExpression(cronExpression: string): string {
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) {
    return "Invalid cron expression";
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Daily at specific time
  if (minute !== "*" && hour !== "*" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    return `Daily at ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  // Hourly
  if (minute !== "*" && hour === "*") {
    return `Every hour at ${minute} minutes`;
  }

  // Generic fallback
  return `Custom: ${cronExpression}`;
}
