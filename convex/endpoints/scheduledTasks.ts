/**
 * Endpoint Layer: Scheduled Tasks
 *
 * Business logic for managing recurring tasks.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as ScheduledTasks from "../db/scheduledTasks";
import { isValidCronExpression } from "../helpers/validation";
import { calculateNextRun } from "../helpers/cron";

/**
 * Create a scheduled task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    tags: v.optional(v.array(v.string())),
    cronExpression: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const rateLimit = await rateLimiter.limit(ctx, "createScheduledTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    if (!isValidCronExpression(args.cronExpression)) {
      throw new Error("Invalid cron expression");
    }

    const nextRun = calculateNextRun(args.cronExpression);

    return await ScheduledTasks.createScheduledTask(ctx, {
      userId: authUser._id,
      taskTemplate: {
        title: args.title,
        description: args.description,
        priority: args.priority,
        tags: args.tags,
      },
      cronExpression: args.cronExpression,
      nextRun,
    });
  },
});

/**
 * List all scheduled tasks
 */
export const list = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await ScheduledTasks.getScheduledTasksByUser(ctx, authUser._id);
  },
});

/**
 * Update a scheduled task
 */
export const update = mutation({
  args: {
    id: v.id("scheduledTasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    tags: v.optional(v.array(v.string())),
    cronExpression: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const rateLimit = await rateLimiter.limit(ctx, "updateScheduledTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    const scheduledTask = await ScheduledTasks.getScheduledTaskById(
      ctx,
      args.id
    );
    if (!scheduledTask) {
      throw new Error("Scheduled task not found");
    }
    if (scheduledTask.userId !== authUser._id) {
      throw new Error("Not authorized to update this scheduled task");
    }

    const updateArgs: any = {};

    if (
      args.title ||
      args.description ||
      args.priority ||
      args.tags ||
      args.cronExpression
    ) {
      updateArgs.taskTemplate = {
        ...scheduledTask.taskTemplate,
        ...(args.title && { title: args.title }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.priority && { priority: args.priority }),
        ...(args.tags && { tags: args.tags }),
      };
    }

    if (args.cronExpression) {
      if (!isValidCronExpression(args.cronExpression)) {
        throw new Error("Invalid cron expression");
      }
      updateArgs.cronExpression = args.cronExpression;
      updateArgs.nextRun = calculateNextRun(args.cronExpression);
    }

    return await ScheduledTasks.updateScheduledTask(ctx, args.id, updateArgs);
  },
});

/**
 * Toggle enabled status
 */
export const toggleEnabled = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const scheduledTask = await ScheduledTasks.getScheduledTaskById(
      ctx,
      args.id
    );
    if (!scheduledTask) {
      throw new Error("Scheduled task not found");
    }
    if (scheduledTask.userId !== authUser._id) {
      throw new Error("Not authorized to update this scheduled task");
    }

    if (scheduledTask.enabled) {
      return await ScheduledTasks.disableScheduledTask(ctx, args.id);
    } else {
      return await ScheduledTasks.enableScheduledTask(ctx, args.id);
    }
  },
});

/**
 * Delete a scheduled task
 */
export const remove = mutation({
  args: {
    id: v.id("scheduledTasks"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const scheduledTask = await ScheduledTasks.getScheduledTaskById(
      ctx,
      args.id
    );
    if (!scheduledTask) {
      throw new Error("Scheduled task not found");
    }
    if (scheduledTask.userId !== authUser._id) {
      throw new Error("Not authorized to delete this scheduled task");
    }

    return await ScheduledTasks.deleteScheduledTask(ctx, args.id);
  },
});
