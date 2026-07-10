/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f6ff",
          100: "#e0edff",
          200: "#b8d9ff",
          300: "#7abaff",
          400: "#3694ff",
          500: "#0a6df5",
          600: "#0052d2",
          700: "#0041aa",
          800: "#00368c",
          900: "#062e73",
          950: "#041e4d",
        },
        surface: {
          DEFAULT: "#ffffff",
          secondary: "#f8fafc",
          tertiary: "#f1f5f9",
          dark: "#0f172a",
          "dark-secondary": "#1e293b",
          "dark-tertiary": "#334155",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#94a3b8",
          dark: "#1e293b",
          "dark-foreground": "#64748b",
        },
        border: {
          DEFAULT: "#e2e8f0",
          dark: "#334155",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(15, 23, 42, 0.12)",
        card: "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "card-hover": "0 10px 40px rgba(15,23,42,0.08), 0 2px 8px rgba(15,23,42,0.04)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-left": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-right": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-left": "slide-left 0.3s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
