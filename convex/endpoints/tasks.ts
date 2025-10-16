/**
 * Endpoint Layer: Tasks
 *
 * Business logic for task management.
 * Composes database operations from the db layer.
 * Handles authentication, authorization, and rate limiting.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as Tasks from "../db/tasks";
import {
  isValidTaskTitle,
  isValidTaskDescription,
  isValidTags,
} from "../helpers/validation";

/**
 * Create a new task
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "createTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Validation
    if (!isValidTaskTitle(args.title)) {
      throw new Error("Task title must be between 1 and 200 characters");
    }

    if (args.description && !isValidTaskDescription(args.description)) {
      throw new Error("Task description must be less than 2000 characters");
    }

    if (args.tags && !isValidTags(args.tags)) {
      throw new Error("Invalid tags: max 10 tags, each max 30 characters");
    }

    // 4. Create task
    return await Tasks.createTask(ctx, {
      userId: authUser._id,
      title: args.title,
      description: args.description,
      priority: args.priority,
      dueDate: args.dueDate,
      tags: args.tags,
    });
  },
});

/**
 * List all tasks for the current user
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUser(ctx, authUser._id);
  },
});

/**
 * List tasks by completion status
 */
export const listByStatus = query({
  args: {
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndCompleted(
      ctx,
      authUser._id,
      args.completed
    );
  },
});

/**
 * List tasks by priority
 */
export const listByPriority = query({
  args: {
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getTasksByUserAndPriority(ctx, authUser._id, args.priority);
  },
});

/**
 * Get upcoming tasks (with due dates, not completed)
 */
export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getUpcomingTasksByUser(ctx, authUser._id);
  },
});

/**
 * Get overdue tasks
 */
export const overdue = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Tasks.getOverdueTasksByUser(ctx, authUser._id);
  },
});

/**
 * Update a task
 */
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // 4. Validation
    if (args.title && !isValidTaskTitle(args.title)) {
      throw new Error("Task title must be between 1 and 200 characters");
    }

    if (args.description && !isValidTaskDescription(args.description)) {
      throw new Error("Task description must be less than 2000 characters");
    }

    if (args.tags && !isValidTags(args.tags)) {
      throw new Error("Invalid tags: max 10 tags, each max 30 characters");
    }

    // 5. Update task
    const { id, ...updateArgs } = args;
    return await Tasks.updateTask(ctx, id, updateArgs);
  },
});

/**
 * Toggle task completion status
 */
export const toggleComplete = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "updateTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to update this task");
    }

    // 4. Toggle completion
    if (task.completed) {
      return await Tasks.uncompleteTask(ctx, args.id);
    } else {
      return await Tasks.completeTask(ctx, args.id);
    }
  },
});

/**
 * Delete a task
 */
export const remove = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Verify ownership
    const task = await Tasks.getTaskById(ctx, args.id);
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== authUser._id) {
      throw new Error("Not authorized to delete this task");
    }

    // 4. Delete task
    return await Tasks.deleteTask(ctx, args.id);
  },
});

/**
 * Delete all completed tasks
 */
export const clearCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "deleteTask", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Delete all completed tasks
    return await Tasks.deleteCompletedTasks(ctx, authUser._id);
  },
});
