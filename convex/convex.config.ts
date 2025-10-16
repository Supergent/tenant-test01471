import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import agent from "@convex-dev/agent/convex.config";
import crons from "@convex-dev/crons/convex.config";

const app = defineApp();

// Better Auth MUST be first - provides authentication foundation
app.use(betterAuth);

// Rate Limiter - protects endpoints from abuse
app.use(rateLimiter);

// Agent - AI assistant capabilities
app.use(agent);

// Crons - scheduled tasks for cleanup and notifications
app.use(crons);

export default app;
