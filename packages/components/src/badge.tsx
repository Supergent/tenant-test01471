import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@jn786r1btw20hb8skemndz59hs7sjkym/design-tokens";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        danger: "border-transparent bg-danger text-danger-foreground",
        outline: "border-border text-text-primary",
        subtle: "border-transparent bg-muted text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
