import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Database Schema for Todo List Application
 *
 * Architecture: Four-layer Convex pattern
 * - User-scoped: All tables include userId for privacy
 * - Status-based: Tasks have clear lifecycle states
 * - Indexed: Optimized for common query patterns
 */

export default defineSchema({
  // ============================================================================
  // Core Application Tables
  // ============================================================================

  /**
   * Tasks - User's todo items
   * Each user has their own private task list
   */
  tasks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    dueDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_completed", ["userId", "completed"])
    .index("by_user_and_priority", ["userId", "priority"])
    .index("by_user_and_due_date", ["userId", "dueDate"]),

  // ============================================================================
  // AI Agent Tables (for Agent Component)
  // ============================================================================

  /**
   * Threads - Conversation sessions with AI assistant
   * Used for AI-powered task suggestions and management
   */
  threads: defineTable({
    userId: v.string(),
    title: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"]),

  /**
   * Messages - Individual messages in AI conversations
   */
  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_user", ["userId"]),

  // ============================================================================
  // Scheduled Tasks Tables (for Crons Component)
  // ============================================================================

  /**
   * Scheduled Tasks - User-configured recurring tasks
   * Managed by Crons component for automated task creation
   */
  scheduledTasks: defineTable({
    userId: v.string(),
    taskTemplate: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      priority: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      ),
      tags: v.optional(v.array(v.string())),
    }),
    cronExpression: v.string(), // e.g., "0 9 * * *" for 9am daily
    enabled: v.boolean(),
    lastRun: v.optional(v.number()),
    nextRun: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_next_run", ["nextRun"])
    .index("by_user_and_enabled", ["userId", "enabled"]),

  // ============================================================================
  // User Preferences
  // ============================================================================

  /**
   * User Preferences - Settings and configuration
   */
  userPreferences: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    defaultPriority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high")
    ),
    notifications: v.object({
      dueDateReminders: v.boolean(),
      dailyDigest: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
