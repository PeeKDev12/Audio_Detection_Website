/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl: "0.75rem",
        lg: "0.5rem",
        md: "0.375rem",
      },
      boxShadow: {
        // Light mode Neumorphism (#e0e5ec base)
        "neu-flat": "6px 6px 14px #b8bec7, -6px -6px 14px #ffffff",
        "neu-sm": "3px 3px 6px #b8bec7, -3px -3px 6px #ffffff",
        "neu-lg": "10px 10px 22px #b0b7c2, -10px -10px 22px #ffffff",
        "neu-inset": "inset 3px 3px 6px #b8bec7, inset -3px -3px 6px #ffffff",
        "neu-pressed": "inset 4px 4px 8px #b0b7c2, inset -4px -4px 8px #ffffff",

        // Dark mode Neumorphism (#1a1f28 base)
        "neu-flat-dark": "6px 6px 14px #12161e, -6px -6px 14px #242c3b",
        "neu-sm-dark": "3px 3px 6px #12161e, -3px -3px 6px #242c3b",
        "neu-lg-dark": "10px 10px 22px #0f1219, -10px -10px 22px #263040",
        "neu-inset-dark": "inset 3px 3px 6px #12161e, inset -3px -3px 6px #242c3b",
        "neu-pressed-dark": "inset 4px 4px 8px #0f1219, inset -4px -4px 8px #263040",
      },
      animation: {
        "shiny-text": "shiny-text 8s infinite",
      },
      keyframes: {
        "shiny-text": {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shiny-width, 100px)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shiny-width, 100px)) 0",
          },
        },
      },
    },
  },
  plugins: [],
}
