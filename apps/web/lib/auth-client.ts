import { createAuthClient } from "better-auth/react";
import { convexPlugin } from "@convex-dev/better-auth/client";

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error("NEXT_PUBLIC_SITE_URL is not set");
}

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  plugins: [convexPlugin()],
});
