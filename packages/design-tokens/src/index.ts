// Import CSS variables
import './theme.css';

// Export theme object and types
export { theme, type Theme, type PaletteColor, type RadiusSize, type SpacingSize, type TypographySize, type TypographyWeight, type ShadowSize, type MotionDuration } from './theme';

// Export Tailwind plugin
export { designTokensPlugin } from './tailwind-plugin';

// Export utility functions
export { cn } from './utils';

// Export for programmatic access if needed
export const applyCSSVariables = () => {
  // CSS variables are automatically applied via the imported stylesheet
  // This function exists for compatibility but does nothing
};
