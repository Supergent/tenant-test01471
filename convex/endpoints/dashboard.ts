import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";
import * as Dashboard from "../db/dashboard";

export const summary = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return Dashboard.loadSummary(ctx, authUser._id);
  },
});

export const recent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return Dashboard.loadRecent(ctx, authUser._id, args.limit ?? 5);
  },
});
