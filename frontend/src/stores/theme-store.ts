import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "../types";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  _hydrate: () => void;
}

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      resolved: "light",

      setMode: (mode: ThemeMode) => {
        const resolved =
          mode === "system" ? getSystemPreference() : mode;
        set({ mode, resolved });
        applyTheme(resolved);
      },

      _hydrate: () => {
        const { mode } = get();
        const resolved =
          mode === "system" ? getSystemPreference() : mode;
        set({ resolved });
        applyTheme(resolved);

        // Listen for system theme changes
        window
          .matchMedia("(prefers-color-scheme: dark)")
          .addEventListener("change", () => {
            const { mode } = get();
            if (mode === "system") {
              const r = getSystemPreference();
              set({ resolved: r });
              applyTheme(r);
            }
          });
      },
    }),
    { name: "expense-tracker-theme" },
  ),
);
