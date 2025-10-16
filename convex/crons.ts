import { cronJobs } from "@convex-dev/crons";
import { components } from "./_generated/api";
import { internal } from "./_generated/api";

/**
 * Cron Jobs Configuration
 *
 * Scheduled jobs for the todo application:
 * 1. Process scheduled tasks - checks for recurring tasks that need to be created
 * 2. Cleanup completed tasks - archives old completed tasks (optional)
 */
const crons = cronJobs(components.crons);

/**
 * Process Scheduled Tasks
 *
 * Runs every 15 minutes to check for scheduled tasks that are due
 * and creates new task instances from templates.
 */
crons.interval(
  "process-scheduled-tasks",
  { minutes: 15 },
  internal.jobs.processScheduledTasks
);

/**
 * Daily Digest Notifications (Future Enhancement)
 *
 * Runs daily at 8 AM to send users a summary of their tasks.
 * Currently a placeholder for future email integration.
 */
crons.cron(
  "daily-digest",
  "0 8 * * *", // 8 AM every day
  internal.jobs.sendDailyDigest
);

export default crons;
