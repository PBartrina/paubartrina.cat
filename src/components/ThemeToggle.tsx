"use client";

import { useTheme } from "@/lib/theme";

export default function ThemeToggle() {
  const {theme, toggleTheme} = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 rounded-md border border-border-color bg-bg-dark px-4 py-2 font-mono text-sm text-text-on-dark transition-colors hover:bg-bg-dark-secondary"
      aria-label="Toggle theme"
    >
      [{theme === "dark" ? "light" : "dark"}]
    </button>
  );
}
