import type { Config } from "tailwindcss";
import { designTokensPlugin } from "@jn786r1btw20hb8skemndz59hs7sjkym/design-tokens";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  plugins: [designTokensPlugin],
};

export default config;
