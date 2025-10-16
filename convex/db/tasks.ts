/**
 * Database Layer: Tasks
 *
 * This is the ONLY file that directly accesses the tasks table using ctx.db.
 * All task-related database operations are defined here as pure async functions.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Task priority levels
 */
export type TaskPriority = "low" | "medium" | "high";

/**
 * Arguments for creating a task
 */
export interface CreateTaskArgs {
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: number;
  tags?: string[];
}

/**
 * Arguments for updating a task
 */
export interface UpdateTaskArgs {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: number;
  tags?: string[];
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new task
 */
export async function createTask(ctx: MutationCtx, args: CreateTaskArgs) {
  const now = Date.now();
  return await ctx.db.insert("tasks", {
    userId: args.userId,
    title: args.title,
    description: args.description,
    completed: false,
    priority: args.priority,
    dueDate: args.dueDate,
    tags: args.tags,
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get task by ID
 */
export async function getTaskById(ctx: QueryCtx, id: Id<"tasks">) {
  return await ctx.db.get(id);
}

/**
 * Get all tasks for a user, ordered by creation date (newest first)
 */
export async function getTasksByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get tasks by user and completion status
 */
export async function getTasksByUserAndCompleted(
  ctx: QueryCtx,
  userId: string,
  completed: boolean
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_completed", (q) =>
      q.eq("userId", userId).eq("completed", completed)
    )
    .order("desc")
    .collect();
}

/**
 * Get tasks by user and priority
 */
export async function getTasksByUserAndPriority(
  ctx: QueryCtx,
  userId: string,
  priority: TaskPriority
) {
  return await ctx.db
    .query("tasks")
    .withIndex("by_user_and_priority", (q) =>
      q.eq("userId", userId).eq("priority", priority)
    )
    .order("desc")
    .collect();
}

/**
 * Get upcoming tasks (tasks with due dates)
 */
export async function getUpcomingTasksByUser(ctx: QueryCtx, userId: string) {
  const allTasks = await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  return allTasks
    .filter((task) => task.dueDate && !task.completed)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasksByUser(ctx: QueryCtx, userId: string) {
  const now = Date.now();
  const allTasks = await ctx.db
    .query("tasks")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  return allTasks.filter(
    (task) => task.dueDate && task.dueDate < now && !task.completed
  );
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update task fields
 */
export async function updateTask(
  ctx: MutationCtx,
  id: Id<"tasks">,
  args: UpdateTaskArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Mark task as completed
 */
export async function completeTask(ctx: MutationCtx, id: Id<"tasks">) {
  const now = Date.now();
  return await ctx.db.patch(id, {
    completed: true,
    completedAt: now,
    updatedAt: now,
  });
}

/**
 * Mark task as incomplete
 */
export async function uncompleteTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.patch(id, {
    completed: false,
    completedAt: undefined,
    updatedAt: Date.now(),
  });
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a task
 */
export async function deleteTask(ctx: MutationCtx, id: Id<"tasks">) {
  return await ctx.db.delete(id);
}

/**
 * Delete all completed tasks for a user
 */
export async function deleteCompletedTasks(ctx: MutationCtx, userId: string) {
  const completedTasks = await getTasksByUserAndCompleted(ctx, userId, true);
  for (const task of completedTasks) {
    await ctx.db.delete(task._id);
  }
  return completedTasks.length;
}
