import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn786r1btw20hb8skemndz59hs7sjkym/design-tokens/tailwind.preset";

const config: Config = {
  darkMode: ["class"],
  presets: [tailwindPreset],
  content: ["./src/**/*.{{ts,tsx}}"],
  plugins: [],
};

export default config;
