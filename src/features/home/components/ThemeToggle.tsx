import { Monitor, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

const themes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1"
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          aria-label={`Switch to ${label} theme`}
          className={`relative rounded-full p-2 transition-colors ${
            theme === value ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {theme === value && (
            <motion.span
              layoutId="theme-indicator"
              className="absolute inset-0 rounded-full bg-background shadow-sm"
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            />
          )}
          <Icon className="relative size-4" />
        </button>
      ))}
    </motion.div>
  );
}
