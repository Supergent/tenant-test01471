import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./auth";

/**
 * HTTP Router Configuration
 *
 * Defines HTTP endpoints for the application, primarily for Better Auth.
 * The auth endpoints handle login, signup, logout, and session management.
 */
const http = httpRouter();

/**
 * Better Auth POST Routes
 *
 * Handles authentication requests:
 * - POST /auth/sign-in - User login
 * - POST /auth/sign-up - User registration
 * - POST /auth/sign-out - User logout
 * - POST /auth/reset-password - Password reset
 *
 * Uses httpAction() wrapper for proper TypeScript types
 */
http.route({
  path: "/auth/*",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

/**
 * Better Auth GET Routes
 *
 * Handles authentication-related GET requests:
 * - GET /auth/session - Check current session
 * - GET /auth/verify-email - Email verification (if enabled)
 * - GET /auth/oauth/* - OAuth callbacks (if configured)
 */
http.route({
  path: "/auth/*",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = createAuth(ctx);
    return await auth.handler(request);
  }),
});

export default http;
