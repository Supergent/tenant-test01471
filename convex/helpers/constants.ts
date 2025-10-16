/**
 * Application Constants
 *
 * Centralized constants used throughout the application.
 */

/**
 * Pagination limits
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

/**
 * Task limits
 */
export const TASK_LIMITS = {
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_TAGS: 10,
  MAX_TAG_LENGTH: 30,
} as const;

/**
 * Thread and message limits
 */
export const CONVERSATION_LIMITS = {
  MAX_THREAD_TITLE_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 10000,
  MAX_ACTIVE_THREADS: 20,
} as const;

/**
 * Scheduled task limits
 */
export const SCHEDULED_TASK_LIMITS = {
  MAX_PER_USER: 50,
} as const;

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  ONE_MINUTE: 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  TASK_PRIORITY: "medium" as const,
  THEME: "system" as const,
  NOTIFICATIONS_DUE_DATE_REMINDERS: true,
  NOTIFICATIONS_DAILY_DIGEST: false,
} as const;
