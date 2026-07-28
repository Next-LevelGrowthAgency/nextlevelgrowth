import type { Config } from "tailwindcss";

/**
 * Next Level Growth — Design System Tokens
 *
 * Palette logic (see BRAND.md for the full rationale):
 * - ink:    deep navy/near-black — authority, headings, dark sections
 * - paper:  warm off-white — openness, primary background
 * - stone:  neutral gray — structure, secondary text, borders
 * - signal: refined blue — trust, links, secondary actions
 * - grove:  controlled emerald — growth accent, primary CTAs, highlights
 * - ember:  warm accent — used sparingly for human warmth (badges, small details)
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#F4F6FA",
          100: "#E7EBF3",
          200: "#C7D0E3",
          300: "#9FADC9",
          400: "#6C7DA3",
          500: "#475777",
          600: "#34415C",
          700: "#262F45",
          800: "#181F30",
          900: "#0F1420",
          950: "#080B12",
        },
        paper: {
          50: "#FFFFFF",
          100: "#FDFCFA",
          200: "#FAF8F4",
          300: "#F3EFE7",
          400: "#E9E3D6",
          500: "#D6CDB8",
        },
        stone: {
          50: "#F7F7F6",
          100: "#EDECE9",
          200: "#DCDAD4",
          300: "#C1BEB4",
          400: "#9C988B",
          500: "#7A766A",
          600: "#5C594F",
          700: "#45433C",
          800: "#302E29",
          900: "#201F1B",
        },
        signal: {
          50: "#EEF2FF",
          100: "#DCE6FF",
          200: "#B6C9FF",
          300: "#8DA9FF",
          400: "#5C82F2",
          500: "#3A62DB",
          600: "#2B4ABF",
          700: "#21389A",
          800: "#1B2C77",
          900: "#16235C",
        },
        grove: {
          50: "#ECFBF5",
          100: "#D2F4E6",
          200: "#A6E8CE",
          300: "#72D6B0",
          400: "#3FBE8F",
          500: "#1FA378",
          600: "#148763",
          700: "#106B4F",
          800: "#0E5540",
          900: "#0C4635",
        },
        ember: {
          300: "#F1C08C",
          400: "#E8A464",
          500: "#DD8A44",
          600: "#C26F30",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(2.75rem, 2.1rem + 3vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-xl": ["clamp(2.25rem, 1.8rem + 2.2vw, 3.75rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(1.875rem, 1.6rem + 1.4vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-md": ["clamp(1.5rem, 1.35rem + 0.8vw, 2rem)", { lineHeight: "1.15" }],
      },
      maxWidth: {
        content: "1200px",
        prose: "68ch",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(15, 20, 32, 0.06), 0 8px 24px -8px rgba(15, 20, 32, 0.08)",
        lifted: "0 12px 32px -8px rgba(15, 20, 32, 0.16), 0 4px 12px -4px rgba(15, 20, 32, 0.08)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.6s ease forwards",
      },
      transitionTimingFunction: {
        confident: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
