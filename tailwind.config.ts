import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        text: "var(--text)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        hairline: "var(--hairline)",
        settled: "var(--settled)",
        deprecated: "var(--deprecated)",
        unsafe: "var(--unsafe)",
        contested: "var(--contested)",
        action: "var(--action)",
        "action-bg": "var(--action-bg)",
        "action-text": "var(--action-text)",
      },
      borderRadius: {
        composer: "var(--r-composer)",
        card: "var(--r-card)",
        row: "var(--r-row)",
        input: "var(--r-input)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        serif: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "highlight-light": "inset 0 1px 0 rgba(0, 0, 0, 0.06)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.2, 0.9, 0.25, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
