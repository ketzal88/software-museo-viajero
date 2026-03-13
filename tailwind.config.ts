import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "background-light": "#FFFFFF",
        "background-dark": "#0A0A0A",
        sidebar: "#0A0A0A",
        surface: "#F5F5F5",
        "dark-surface": "#1A1A1A",
        primary: {
          DEFAULT: "#0A0A0A",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FF3B30", // iOS Red
          foreground: "#FFFFFF",
        },
        border: "var(--border)",
        success: "#22C55E",
        gray: {
          700: "#666666",
          600: "#777777",
          500: "#999999",
          400: "#AAAAAA",
          300: "#E0E0E0",
          200: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
