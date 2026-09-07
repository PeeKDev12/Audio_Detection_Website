/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        neu: {
          base: "hsl(var(--neu-base))",
          light: "hsl(var(--neu-light))",
          dark: "hsl(var(--neu-dark))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        "3xl": "1.75rem",
        "2xl": "1.25rem",
        xl: "1rem",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Light mode neumorphism
        "neu-flat": "6px 6px 14px #d1d9e6, -6px -6px 14px #ffffff",
        "neu-sm": "3px 3px 7px #d1d9e6, -3px -3px 7px #ffffff",
        "neu-lg": "12px 12px 24px #caced4, -12px -12px 24px #ffffff",
        "neu-inset": "inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff",
        "neu-pressed": "inset 4px 4px 8px #c8d1df, inset -4px -4px 8px #ffffff",

        // Dark mode neumorphism
        "neu-flat-dark": "6px 6px 14px #0f131a, -6px -6px 14px #232a38",
        "neu-sm-dark": "3px 3px 7px #0f131a, -3px -3px 7px #232a38",
        "neu-lg-dark": "12px 12px 24px #0b0e14, -12px -12px 24px #262e3d",
        "neu-inset-dark": "inset 3px 3px 6px #0e1219, inset -3px -3px 6px #242c3b",
        "neu-pressed-dark": "inset 4px 4px 8px #0c1015, inset -4px -4px 8px #222937",

        // Glow accents
        "neu-glow-cyan": "0 0 20px rgba(6, 182, 212, 0.45)",
        "neu-glow-emerald": "0 0 20px rgba(16, 185, 129, 0.45)",
        "neu-glow-rose": "0 0 20px rgba(244, 63, 94, 0.45)",
      },
    },
  },
  plugins: [],
}
