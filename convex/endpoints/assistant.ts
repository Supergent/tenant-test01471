/**
 * Endpoint Layer: AI Assistant
 *
 * Business logic for AI-powered task assistance.
 * Manages threads and messages for conversations with the AI assistant.
 */

import { v } from "convex/values";
import { mutation, query, action } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import { todoAssistant } from "../agent";
import * as Threads from "../db/threads";
import * as Messages from "../db/messages";
import * as Tasks from "../db/tasks";
import {
  isValidThreadTitle,
  isValidMessageContent,
} from "../helpers/validation";

/**
 * Create a new conversation thread
 */
export const createThread = mutation({
  args: {
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "createThread", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Validation
    if (args.title && !isValidThreadTitle(args.title)) {
      throw new Error("Thread title must be between 1 and 200 characters");
    }

    // 4. Create thread
    return await Threads.createThread(ctx, {
      userId: authUser._id,
      title: args.title,
    });
  },
});

/**
 * List all threads for the current user
 */
export const listThreads = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Threads.getThreadsByUser(ctx, authUser._id);
  },
});

/**
 * List active threads
 */
export const listActiveThreads = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Threads.getActiveThreadsByUser(ctx, authUser._id);
  },
});

/**
 * Get messages in a thread
 */
export const getMessages = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to view this thread");
    }

    return await Messages.getMessagesByThread(ctx, args.threadId);
  },
});

/**
 * Send a message to the AI assistant
 */
export const sendMessage = action({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // 2. Rate limiting
    const rateLimit = await rateLimiter.limit(ctx, "sendMessage", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    // 3. Validation
    if (!isValidMessageContent(args.content)) {
      throw new Error("Message must be between 1 and 10000 characters");
    }

    // 4. Verify thread ownership
    const thread = await ctx.runQuery(
      api.endpoints.assistant.verifyThreadOwnership,
      {
        threadId: args.threadId,
      }
    );

    // 5. Create user message
    await ctx.runMutation(api.endpoints.assistant.createUserMessage, {
      threadId: args.threadId,
      content: args.content,
    });

    // 6. Get user's tasks for context
    const userTasks = await ctx.runQuery(api.endpoints.tasks.list, {});

    // 7. Generate AI response
    const context = `User has ${userTasks.length} total tasks.
Active tasks: ${userTasks.filter((t) => !t.completed).length}
Completed tasks: ${userTasks.filter((t) => t.completed).length}

Recent tasks:
${userTasks
  .slice(0, 5)
  .map((t) => `- ${t.title} (${t.priority} priority, ${t.completed ? "completed" : "active"})`)
  .join("\n")}`;

    const response = await todoAssistant.chat(ctx, {
      threadId: args.threadId.toString(),
      message: `${context}\n\nUser question: ${args.content}`,
      userId: authUser._id,
    });

    // 8. Create assistant message
    await ctx.runMutation(api.endpoints.assistant.createAssistantMessage, {
      threadId: args.threadId,
      content: response,
    });

    return { response };
  },
});

/**
 * Internal: Verify thread ownership (called from action)
 */
export const verifyThreadOwnership = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const thread = await Threads.getThreadById(ctx, args.threadId);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to access this thread");
    }

    return thread;
  },
});

/**
 * Internal: Create user message
 */
export const createUserMessage = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Messages.createMessage(ctx, {
      threadId: args.threadId,
      userId: authUser._id,
      role: "user",
      content: args.content,
    });
  },
});

/**
 * Internal: Create assistant message
 */
export const createAssistantMessage = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await Messages.createMessage(ctx, {
      threadId: args.threadId,
      userId: authUser._id,
      role: "assistant",
      content: args.content,
    });
  },
});

/**
 * Archive a thread
 */
export const archiveThread = mutation({
  args: {
    id: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const thread = await Threads.getThreadById(ctx, args.id);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to archive this thread");
    }

    return await Threads.archiveThread(ctx, args.id);
  },
});

/**
 * Delete a thread and all its messages
 */
export const deleteThread = mutation({
  args: {
    id: v.id("threads"),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    // Verify ownership
    const thread = await Threads.getThreadById(ctx, args.id);
    if (!thread) {
      throw new Error("Thread not found");
    }
    if (thread.userId !== authUser._id) {
      throw new Error("Not authorized to delete this thread");
    }

    // Delete all messages in the thread first
    await Messages.deleteMessagesByThread(ctx, args.id);

    // Delete the thread
    return await Threads.deleteThread(ctx, args.id);
  },
});

// Import API after defining functions
import { api } from "../_generated/api";
