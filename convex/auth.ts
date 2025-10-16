import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { components } from "./_generated/api";
import { type DataModel } from "./_generated/dataModel";

/**
 * Better Auth Component Client
 *
 * Used throughout the application to:
 * - Get authenticated user information
 * - Verify user sessions
 * - Enforce authorization rules
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * Better Auth Configuration
 *
 * Configures authentication for the todo application:
 * - Email/password authentication (no email verification for simplicity)
 * - 30-day JWT sessions using Convex plugin
 * - Convex database adapter for session storage
 *
 * Single-tenant: No organization plugin needed - each user has their own private todo list
 */
export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  return betterAuth({
    baseURL: process.env.SITE_URL!,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      // Email verification disabled for development simplicity
      // Enable in production: requireEmailVerification: true
      requireEmailVerification: false,
    },
    plugins: [
      convex({
        // 30 days session duration
        jwtExpirationSeconds: 30 * 24 * 60 * 60,
      }),
      // No organization plugin - single-tenant per user
      // Each user gets their own isolated todo list
    ],
  });
};
