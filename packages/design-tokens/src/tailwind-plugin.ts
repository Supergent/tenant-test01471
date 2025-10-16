/**
 * Tailwind CSS Plugin for Design Tokens
 *
 * This plugin adds CSS variables for all design tokens and extends the Tailwind theme
 * with colors, borderRadius, fontSize, fontWeight, boxShadow, and motion properties.
 */

import plugin from "tailwindcss/plugin";
import { theme } from "./theme";

export const designTokensPlugin = plugin(
  // Add CSS variables to base layer
  function ({ addBase }) {
    addBase({
      ":root": {
        // Palette colors
        "--color-primary": theme.palette.primary.base,
        "--color-primary-foreground": theme.palette.primary.foreground,
        "--color-primary-emphasis": theme.palette.primary.emphasis,

        "--color-secondary": theme.palette.secondary.base,
        "--color-secondary-foreground": theme.palette.secondary.foreground,
        "--color-secondary-emphasis": theme.palette.secondary.emphasis,

        "--color-accent": theme.palette.accent.base,
        "--color-accent-foreground": theme.palette.accent.foreground,
        "--color-accent-emphasis": theme.palette.accent.emphasis,

        "--color-success": theme.palette.success.base,
        "--color-success-foreground": theme.palette.success.foreground,
        "--color-success-emphasis": theme.palette.success.emphasis,

        "--color-warning": theme.palette.warning.base,
        "--color-warning-foreground": theme.palette.warning.foreground,
        "--color-warning-emphasis": theme.palette.warning.emphasis,

        "--color-danger": theme.palette.danger.base,
        "--color-danger-foreground": theme.palette.danger.foreground,
        "--color-danger-emphasis": theme.palette.danger.emphasis,

        // Neutral colors
        "--color-background": theme.neutrals.background,
        "--color-surface": theme.neutrals.surface,
        "--color-muted": theme.neutrals.muted,
        "--color-text-primary": theme.neutrals.textPrimary,
        "--color-text-secondary": theme.neutrals.textSecondary,

        // Border radius
        "--radius-sm": `${theme.radius.sm}px`,
        "--radius-md": `${theme.radius.md}px`,
        "--radius-lg": `${theme.radius.lg}px`,
        "--radius-pill": `${theme.radius.pill}px`,

        // Spacing
        "--spacing-xs": `${theme.spacing.scale.xs}px`,
        "--spacing-sm": `${theme.spacing.scale.sm}px`,
        "--spacing-md": `${theme.spacing.scale.md}px`,
        "--spacing-lg": `${theme.spacing.scale.lg}px`,
        "--spacing-xl": `${theme.spacing.scale.xl}px`,
        "--spacing-2xl": `${theme.spacing.scale["2xl"]}px`,

        // Component spacing
        "--spacing-padding-y": `${theme.spacing.components.paddingY}px`,
        "--spacing-padding-x": `${theme.spacing.components.paddingX}px`,
        "--spacing-gap": `${theme.spacing.components.gap}px`,

        // Typography
        "--font-base": theme.typography.fontFamily,
        "--font-heading": theme.typography.headingsFamily,

        "--font-size-xs": `${theme.typography.scale.xs}px`,
        "--font-size-sm": `${theme.typography.scale.sm}px`,
        "--font-size-base": `${theme.typography.scale.base}px`,
        "--font-size-lg": `${theme.typography.scale.lg}px`,
        "--font-size-xl": `${theme.typography.scale.xl}px`,
        "--font-size-2xl": `${theme.typography.scale["2xl"]}px`,

        "--font-weight-regular": theme.typography.weight.regular.toString(),
        "--font-weight-medium": theme.typography.weight.medium.toString(),
        "--font-weight-semibold": theme.typography.weight.semibold.toString(),
        "--font-weight-bold": theme.typography.weight.bold.toString(),

        // Shadows
        "--shadow-sm": theme.shadows.sm,
        "--shadow-md": theme.shadows.md,
        "--shadow-lg": theme.shadows.lg,

        // Motion
        "--motion-ease": theme.motion.ease,
        "--motion-duration-fast": `${theme.motion.duration.fast}ms`,
        "--motion-duration-base": `${theme.motion.duration.base}ms`,
        "--motion-duration-slow": `${theme.motion.duration.slow}ms`,
      },
    });
  },
  // Extend Tailwind theme
  {
    theme: {
      extend: {
        // Colors
        colors: {
          primary: {
            DEFAULT: "var(--color-primary)",
            foreground: "var(--color-primary-foreground)",
            emphasis: "var(--color-primary-emphasis)",
          },
          secondary: {
            DEFAULT: "var(--color-secondary)",
            foreground: "var(--color-secondary-foreground)",
            emphasis: "var(--color-secondary-emphasis)",
          },
          accent: {
            DEFAULT: "var(--color-accent)",
            foreground: "var(--color-accent-foreground)",
            emphasis: "var(--color-accent-emphasis)",
          },
          success: {
            DEFAULT: "var(--color-success)",
            foreground: "var(--color-success-foreground)",
            emphasis: "var(--color-success-emphasis)",
          },
          warning: {
            DEFAULT: "var(--color-warning)",
            foreground: "var(--color-warning-foreground)",
            emphasis: "var(--color-warning-emphasis)",
          },
          danger: {
            DEFAULT: "var(--color-danger)",
            foreground: "var(--color-danger-foreground)",
            emphasis: "var(--color-danger-emphasis)",
          },
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          muted: "var(--color-muted)",
          text: {
            primary: "var(--color-text-primary)",
            secondary: "var(--color-text-secondary)",
          },
        },

        // Border radius
        borderRadius: {
          sm: "var(--radius-sm)",
          md: "var(--radius-md)",
          lg: "var(--radius-lg)",
          pill: "var(--radius-pill)",
        },

        // Font sizes
        fontSize: {
          xs: ["var(--font-size-xs)", { lineHeight: "1.5" }],
          sm: ["var(--font-size-sm)", { lineHeight: "1.5" }],
          base: ["var(--font-size-base)", { lineHeight: "1.5" }],
          lg: ["var(--font-size-lg)", { lineHeight: "1.5" }],
          xl: ["var(--font-size-xl)", { lineHeight: "1.4" }],
          "2xl": ["var(--font-size-2xl)", { lineHeight: "1.3" }],
        },

        // Font weights
        fontWeight: {
          regular: "var(--font-weight-regular)",
          medium: "var(--font-weight-medium)",
          semibold: "var(--font-weight-semibold)",
          bold: "var(--font-weight-bold)",
        },

        // Font families
        fontFamily: {
          sans: ["var(--font-base)", "system-ui", "sans-serif"],
          heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        },

        // Spacing
        spacing: {
          xs: "var(--spacing-xs)",
          sm: "var(--spacing-sm)",
          md: "var(--spacing-md)",
          lg: "var(--spacing-lg)",
          xl: "var(--spacing-xl)",
          "2xl": "var(--spacing-2xl)",
        },

        // Box shadows
        boxShadow: {
          sm: "var(--shadow-sm)",
          md: "var(--shadow-md)",
          lg: "var(--shadow-lg)",
        },

        // Motion - Transition timing functions
        transitionTimingFunction: {
          smooth: "var(--motion-ease)",
        },

        // Motion - Transition durations
        transitionDuration: {
          fast: "var(--motion-duration-fast)",
          base: "var(--motion-duration-base)",
          slow: "var(--motion-duration-slow)",
        },
      },
    },
  }
);

export default designTokensPlugin;
