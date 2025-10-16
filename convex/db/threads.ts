/**
 * Database Layer: Threads
 *
 * This is the ONLY file that directly accesses the threads table using ctx.db.
 * Threads represent conversation sessions with the AI assistant.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Thread status
 */
export type ThreadStatus = "active" | "archived";

/**
 * Arguments for creating a thread
 */
export interface CreateThreadArgs {
  userId: string;
  title?: string;
}

/**
 * Arguments for updating a thread
 */
export interface UpdateThreadArgs {
  title?: string;
  status?: ThreadStatus;
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new thread
 */
export async function createThread(ctx: MutationCtx, args: CreateThreadArgs) {
  const now = Date.now();
  return await ctx.db.insert("threads", {
    userId: args.userId,
    title: args.title,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get thread by ID
 */
export async function getThreadById(ctx: QueryCtx, id: Id<"threads">) {
  return await ctx.db.get(id);
}

/**
 * Get all threads for a user, ordered by update date (most recent first)
 */
export async function getThreadsByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("threads")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get threads by user and status
 */
export async function getThreadsByUserAndStatus(
  ctx: QueryCtx,
  userId: string,
  status: ThreadStatus
) {
  return await ctx.db
    .query("threads")
    .withIndex("by_user_and_status", (q) =>
      q.eq("userId", userId).eq("status", status)
    )
    .order("desc")
    .collect();
}

/**
 * Get active threads for a user
 */
export async function getActiveThreadsByUser(ctx: QueryCtx, userId: string) {
  return await getThreadsByUserAndStatus(ctx, userId, "active");
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update thread fields
 */
export async function updateThread(
  ctx: MutationCtx,
  id: Id<"threads">,
  args: UpdateThreadArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Archive a thread
 */
export async function archiveThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.patch(id, {
    status: "archived",
    updatedAt: Date.now(),
  });
}

/**
 * Unarchive a thread (make it active again)
 */
export async function unarchiveThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.patch(id, {
    status: "active",
    updatedAt: Date.now(),
  });
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a thread
 */
export async function deleteThread(ctx: MutationCtx, id: Id<"threads">) {
  return await ctx.db.delete(id);
}
