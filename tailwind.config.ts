import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      colors: {
        "brand-blue": "var(--brand-blue)",
        "brand-blue-dark": "var(--brand-blue-dark)",
        "brand-blue-light": "var(--brand-blue-light)",
        "brand-green": "var(--brand-green)",
        "brand-green-dark": "var(--brand-green-dark)",
        "brand-green-light": "var(--brand-green-light)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        fill: "var(--color-fill)",
        section: "var(--color-section)",
      },
    },
  },
  plugins: [],
};
export default config;
