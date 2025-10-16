import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

/**
 * Rate Limiter Configuration
 *
 * Protects the todo application from abuse by limiting API requests.
 * Uses token bucket algorithm for user actions (allows bursts, refills over time).
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Task operations - allow reasonable bursts
  createTask: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
  updateTask: { kind: "token bucket", rate: 50, period: MINUTE, capacity: 10 },
  deleteTask: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },

  // AI assistant operations - more restrictive
  createThread: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  sendMessage: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },

  // Scheduled task operations
  createScheduledTask: { kind: "token bucket", rate: 5, period: HOUR, capacity: 2 },
  updateScheduledTask: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },

  // User preferences - low frequency
  updatePreferences: { kind: "token bucket", rate: 10, period: MINUTE, capacity: 2 },
});
