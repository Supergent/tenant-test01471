/**
 * Endpoint Layer: User Preferences
 *
 * Business logic for managing user settings and preferences.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import { rateLimiter } from "../rateLimiter";
import * as UserPreferences from "../db/userPreferences";

/**
 * Get current user's preferences
 */
export const get = query({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await UserPreferences.getUserPreferencesByUser(ctx, authUser._id);
  },
});

/**
 * Update user preferences
 */
export const update = mutation({
  args: {
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("system"))
    ),
    defaultPriority: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high"))
    ),
    notifications: v.optional(
      v.object({
        dueDateReminders: v.boolean(),
        dailyDigest: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const rateLimit = await rateLimiter.limit(ctx, "updatePreferences", {
      key: authUser._id,
    });
    if (!rateLimit.ok) {
      throw new Error(
        `Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`
      );
    }

    return await UserPreferences.updateUserPreferencesByUser(
      ctx,
      authUser._id,
      args
    );
  },
});

/**
 * Get or create preferences (ensures preferences exist)
 */
export const getOrCreate = mutation({
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await UserPreferences.getOrCreateUserPreferences(ctx, authUser._id);
  },
});
