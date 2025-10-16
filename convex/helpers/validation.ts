/**
 * Validation Helpers
 *
 * Pure functions for input validation.
 * NO database access, NO ctx parameter.
 */

import { TaskPriority } from "../db/tasks";

/**
 * Validate task title
 */
export function isValidTaskTitle(title: string): boolean {
  return title.length > 0 && title.length <= 200;
}

/**
 * Validate task description
 */
export function isValidTaskDescription(description: string): boolean {
  return description.length <= 2000;
}

/**
 * Validate task priority
 */
export function isValidTaskPriority(priority: string): priority is TaskPriority {
  return priority === "low" || priority === "medium" || priority === "high";
}

/**
 * Validate due date (must be in the future or not set)
 */
export function isValidDueDate(dueDate: number | undefined): boolean {
  if (dueDate === undefined) {
    return true;
  }
  return dueDate > Date.now();
}

/**
 * Validate tags (max 10 tags, each max 30 characters)
 */
export function isValidTags(tags: string[] | undefined): boolean {
  if (!tags) {
    return true;
  }
  if (tags.length > 10) {
    return false;
  }
  return tags.every((tag) => tag.length > 0 && tag.length <= 30);
}

/**
 * Validate cron expression (basic validation)
 */
export function isValidCronExpression(cron: string): boolean {
  // Basic validation: should have 5 parts (minute hour day month weekday)
  const parts = cron.trim().split(/\s+/);
  return parts.length === 5;
}

/**
 * Validate thread title
 */
export function isValidThreadTitle(title: string): boolean {
  return title.length > 0 && title.length <= 200;
}

/**
 * Validate message content
 */
export function isValidMessageContent(content: string): boolean {
  return content.length > 0 && content.length <= 10000;
}
