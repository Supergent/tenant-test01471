/**
 * Cron Jobs Implementation
 *
 * Background jobs that run on a schedule.
 * These are called by the cron configuration in crons.ts.
 */

import { internalMutation } from "./_generated/server";
import * as ScheduledTasks from "./db/scheduledTasks";
import * as Tasks from "./db/tasks";
import { calculateNextRun } from "./helpers/cron";

/**
 * Process Scheduled Tasks
 *
 * Checks for scheduled tasks that are due and creates task instances.
 * Runs every 15 minutes via cron.
 */
export const processScheduledTasks = internalMutation({
  handler: async (ctx) => {
    // Get all scheduled tasks that are due
    const dueTasks = await ScheduledTasks.getDueScheduledTasks(ctx);

    let created = 0;
    for (const scheduledTask of dueTasks) {
      try {
        // Create a new task instance from the template
        await Tasks.createTask(ctx, {
          userId: scheduledTask.userId,
          title: scheduledTask.taskTemplate.title,
          description: scheduledTask.taskTemplate.description,
          priority: scheduledTask.taskTemplate.priority,
          tags: scheduledTask.taskTemplate.tags,
        });

        // Update the scheduled task's run times
        const nextRun = calculateNextRun(
          scheduledTask.cronExpression,
          Date.now()
        );
        await ScheduledTasks.updateScheduledTaskRun(
          ctx,
          scheduledTask._id,
          Date.now(),
          nextRun
        );

        created++;
      } catch (error) {
        console.error(
          `Failed to process scheduled task ${scheduledTask._id}:`,
          error
        );
      }
    }

    console.log(
      `Processed ${dueTasks.length} scheduled tasks, created ${created} new tasks`
    );
    return { processed: dueTasks.length, created };
  },
});

/**
 * Send Daily Digest (Placeholder)
 *
 * Sends users a daily summary of their tasks.
 * Currently a placeholder for future email integration.
 * Runs daily at 8 AM via cron.
 */
export const sendDailyDigest = internalMutation({
  handler: async (ctx) => {
    // TODO: Implement when email (Resend) component is added
    // For now, just log that the cron ran
    console.log("Daily digest cron ran (not implemented yet)");
    return { sent: 0 };
  },
});
