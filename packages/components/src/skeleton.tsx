import * as React from "react";
import { cn } from "@jn786r1btw20hb8skemndz59hs7sjkym/design-tokens";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted/60", className)} {...props} />;
}
