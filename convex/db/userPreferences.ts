/**
 * Database Layer: User Preferences
 *
 * This is the ONLY file that directly accesses the userPreferences table using ctx.db.
 * User preferences store settings and configuration for each user.
 */

import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { TaskPriority } from "./tasks";

/**
 * Theme preference
 */
export type Theme = "light" | "dark" | "system";

/**
 * Notification settings
 */
export interface NotificationSettings {
  dueDateReminders: boolean;
  dailyDigest: boolean;
}

/**
 * Arguments for creating user preferences
 */
export interface CreateUserPreferencesArgs {
  userId: string;
  theme?: Theme;
  defaultPriority?: TaskPriority;
  notifications?: NotificationSettings;
}

/**
 * Arguments for updating user preferences
 */
export interface UpdateUserPreferencesArgs {
  theme?: Theme;
  defaultPriority?: TaskPriority;
  notifications?: NotificationSettings;
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create user preferences with defaults
 */
export async function createUserPreferences(
  ctx: MutationCtx,
  args: CreateUserPreferencesArgs
) {
  const now = Date.now();
  return await ctx.db.insert("userPreferences", {
    userId: args.userId,
    theme: args.theme ?? "system",
    defaultPriority: args.defaultPriority ?? "medium",
    notifications: args.notifications ?? {
      dueDateReminders: true,
      dailyDigest: false,
    },
    createdAt: now,
    updatedAt: now,
  });
}

// ============================================================================
// READ
// ============================================================================

/**
 * Get user preferences by ID
 */
export async function getUserPreferencesById(
  ctx: QueryCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.get(id);
}

/**
 * Get user preferences by user ID
 */
export async function getUserPreferencesByUser(ctx: QueryCtx, userId: string) {
  const preferences = await ctx.db
    .query("userPreferences")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  return preferences;
}

/**
 * Get user preferences or create defaults if they don't exist
 */
export async function getOrCreateUserPreferences(
  ctx: MutationCtx,
  userId: string
) {
  const existing = await getUserPreferencesByUser(ctx, userId);
  if (existing) {
    return existing;
  }

  // Create default preferences
  const id = await createUserPreferences(ctx, { userId });
  return await ctx.db.get(id);
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">,
  args: UpdateUserPreferencesArgs
) {
  return await ctx.db.patch(id, {
    ...args,
    updatedAt: Date.now(),
  });
}

/**
 * Update user preferences by user ID (finds or creates)
 */
export async function updateUserPreferencesByUser(
  ctx: MutationCtx,
  userId: string,
  args: UpdateUserPreferencesArgs
) {
  const preferences = await getOrCreateUserPreferences(ctx, userId);
  if (!preferences) {
    throw new Error("Failed to get or create user preferences");
  }
  return await updateUserPreferences(ctx, preferences._id, args);
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete user preferences
 */
export async function deleteUserPreferences(
  ctx: MutationCtx,
  id: Id<"userPreferences">
) {
  return await ctx.db.delete(id);
}
