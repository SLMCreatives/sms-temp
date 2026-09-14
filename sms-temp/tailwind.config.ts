import type { Config } from "tailwindcss";

/**
 * The theme tokens in app/globals.css are complete oklch colours (e.g.
 * `--card: oklch(1 0 0)`), not the bare HSL triplets shadcn used to ship. They
 * must therefore be referenced as plain `var(--token)` — wrapping them in
 * `hsl(...)` produces `hsl(oklch(...))`, which every browser discards as
 * invalid, and that is what silently blanked out the semantic colours.
 *
 * `withAlpha` keeps the `/50` opacity modifiers working by mixing the token
 * with transparent, which Tailwind v3 cannot do for a raw `var()` value.
 */
const withAlpha = (token: string) =>
  `color-mix(in oklab, var(${token}) calc(<alpha-value> * 100%), transparent)`;

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: withAlpha("--background"),
        foreground: withAlpha("--foreground"),
        card: {
          DEFAULT: withAlpha("--card"),
          foreground: withAlpha("--card-foreground"),
        },
        popover: {
          DEFAULT: withAlpha("--popover"),
          foreground: withAlpha("--popover-foreground"),
        },
        primary: {
          DEFAULT: withAlpha("--primary"),
          foreground: withAlpha("--primary-foreground"),
        },
        secondary: {
          DEFAULT: withAlpha("--secondary"),
          foreground: withAlpha("--secondary-foreground"),
        },
        muted: {
          DEFAULT: withAlpha("--muted"),
          foreground: withAlpha("--muted-foreground"),
        },
        accent: {
          DEFAULT: withAlpha("--accent"),
          foreground: withAlpha("--accent-foreground"),
        },
        destructive: {
          DEFAULT: withAlpha("--destructive"),
          foreground: withAlpha("--destructive-foreground"),
        },
        border: withAlpha("--border"),
        input: withAlpha("--input"),
        ring: withAlpha("--ring"),
        chart: {
          "1": withAlpha("--chart-1"),
          "2": withAlpha("--chart-2"),
          "3": withAlpha("--chart-3"),
          "4": withAlpha("--chart-4"),
          "5": withAlpha("--chart-5"),
        },
        // The sidebar palette was defined in CSS but never registered here, so
        // `bg-sidebar` was never generated and the nav rendered transparent.
        sidebar: {
          DEFAULT: withAlpha("--sidebar"),
          foreground: withAlpha("--sidebar-foreground"),
          primary: withAlpha("--sidebar-primary"),
          "primary-foreground": withAlpha("--sidebar-primary-foreground"),
          accent: withAlpha("--sidebar-accent"),
          "accent-foreground": withAlpha("--sidebar-accent-foreground"),
          border: withAlpha("--sidebar-border"),
          ring: withAlpha("--sidebar-ring"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
