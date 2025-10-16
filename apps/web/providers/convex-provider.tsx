"use client";

import { ConvexProviderWithAuth } from "convex/react";
import { ReactNode } from "react";
import { convex } from "@/lib/convex";
import { authClient } from "@/lib/auth-client";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={authClient.useAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
