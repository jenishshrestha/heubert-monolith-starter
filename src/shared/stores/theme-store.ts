import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => () => void;
}

function applyThemeToDOM(theme: Theme) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");

  if (theme === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "system",
      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== "undefined") {
          applyThemeToDOM(theme);
        }
      },
      toggleTheme: () => {
        const current = get().theme;
        const cycle: Record<Theme, Theme> = {
          light: "dark",
          dark: "system",
          system: "light",
        };
        get().setTheme(cycle[current]);
      },
      initTheme: () => {
        const theme = get().theme;
        applyThemeToDOM(theme);

        // Listen for OS theme changes when in "system" mode
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
          if (get().theme === "system") {
            applyThemeToDOM("system");
          }
        };
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
      },
    }),
    {
      name: "theme-storage",
    },
  ),
);
