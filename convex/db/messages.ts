/**
 * Database Layer: Messages
 *
 * This is the ONLY file that directly accesses the messages table using ctx.db.
 * Messages represent individual messages in AI conversation threads.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Message role
 */
export type MessageRole = "user" | "assistant";

/**
 * Arguments for creating a message
 */
export interface CreateMessageArgs {
  threadId: Id<"threads">;
  userId: string;
  role: MessageRole;
  content: string;
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new message
 */
export async function createMessage(
  ctx: MutationCtx,
  args: CreateMessageArgs
) {
  const now = Date.now();
  return await ctx.db.insert("messages", {
    threadId: args.threadId,
    userId: args.userId,
    role: args.role,
    content: args.content,
    createdAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get message by ID
 */
export async function getMessageById(ctx: QueryCtx, id: Id<"messages">) {
  return await ctx.db.get(id);
}

/**
 * Get all messages in a thread, ordered chronologically
 */
export async function getMessagesByThread(
  ctx: QueryCtx,
  threadId: Id<"threads">
) {
  return await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .order("asc")
    .collect();
}

/**
 * Get all messages for a user
 */
export async function getMessagesByUser(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("messages")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .collect();
}

/**
 * Get the latest message in a thread
 */
export async function getLatestMessageByThread(
  ctx: QueryCtx,
  threadId: Id<"threads">
) {
  const messages = await ctx.db
    .query("messages")
    .withIndex("by_thread", (q) => q.eq("threadId", threadId))
    .order("desc")
    .take(1);

  return messages[0] ?? null;
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a message
 */
export async function deleteMessage(ctx: MutationCtx, id: Id<"messages">) {
  return await ctx.db.delete(id);
}

/**
 * Delete all messages in a thread (useful when deleting a thread)
 */
export async function deleteMessagesByThread(
  ctx: MutationCtx,
  threadId: Id<"threads">
) {
  const messages = await getMessagesByThread(ctx, threadId);
  for (const message of messages) {
    await ctx.db.delete(message._id);
  }
  return messages.length;
}
