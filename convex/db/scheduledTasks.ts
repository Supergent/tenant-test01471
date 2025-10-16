/**
 * Database Layer: Scheduled Tasks
 *
 * This is the ONLY file that directly accesses the scheduledTasks table using ctx.db.
 * Scheduled tasks represent recurring task templates that get created automatically.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { TaskPriority } from "./tasks";

/**
 * Task template for scheduled tasks
 */
export interface TaskTemplate {
  title: string;
  description?: string;
  priority: TaskPriority;
  tags?: string[];
}

/**
 * Arguments for creating a scheduled task
 */
export interface CreateScheduledTaskArgs {
  userId: string;
  taskTemplate: TaskTemplate;
  cronExpression: string;
  nextRun: number;
}

/**
 * Arguments for updating a scheduled task
 */
export interface UpdateScheduledTaskArgs {
  taskTemplate?: TaskTemplate;
  cronExpression?: string;
  enabled?: boolean;
  nextRun?: number;
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new scheduled task
 */
export async function createScheduledTask(
  ctx: MutationCtx,
  args: CreateScheduledTaskArgs
) {
  const now = Date.now();
  return await ctx.db.insert("scheduledTasks", {
    userId: args.userId,
    taskTemplate: args.taskTemplate,
    cronExpression: args.cronExpression,
    enabled: true,
    nextRun: args.nextRun,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get scheduled task by ID
 */
export async function getScheduledTaskById(
  ctx: QueryCtx,
  id: Id<"scheduledTasks">
) {
  return await ctx.db.get(id);
}

/**
 * Get all scheduled tasks for a user
 */
export async function getScheduledTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("scheduledTasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get enabled scheduled tasks for a user
 */
export async function getEnabledScheduledTasksByUser(
  ctx: QueryCtx,
  userId: string
) {
  return await ctx.db
    .query("scheduledTasks")
    .withIndex("by_user_and_enabled", (q) =>
      q.eq("userId", userId).eq("enabled", true)
    )
    .collect();
}

/**
 * Get scheduled tasks that are due to run (nextRun <= now)
 */
export async function getDueScheduledTasks(ctx: QueryCtx) {
  const now = Date.now();
  const allScheduledTasks = await ctx.db.query("scheduledTasks").collect();

  return allScheduledTasks.filter(
    (task) => task.enabled && task.nextRun <= now
  );
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update scheduled task fields
 */
export async function updateScheduledTask(
  ctx: MutationCtx,
  id: Id<"scheduledTasks">,
  args: UpdateScheduledTaskArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Enable a scheduled task
 */
export async function enableScheduledTask(
  ctx: MutationCtx,
  id: Id<"scheduledTasks">
) {
  return await ctx.db.patch(id, {
    enabled: true,
    updatedAt: Date.now(),
  });
}

/**
 * Disable a scheduled task
 */
export async function disableScheduledTask(
  ctx: MutationCtx,
  id: Id<"scheduledTasks">
) {
  return await ctx.db.patch(id, {
    enabled: false,
    updatedAt: Date.now(),
  });
}

/**
 * Update last run time and next run time
 */
export async function updateScheduledTaskRun(
  ctx: MutationCtx,
  id: Id<"scheduledTasks">,
  lastRun: number,
  nextRun: number
) {
  return await ctx.db.patch(id, {
    lastRun,
    nextRun,
    updatedAt: Date.now(),
  });
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a scheduled task
 */
export async function deleteScheduledTask(
  ctx: MutationCtx,
  id: Id<"scheduledTasks">
) {
  return await ctx.db.delete(id);
}
