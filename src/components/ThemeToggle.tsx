"use client";

import { useTheme } from "@/lib/theme";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useTranslations("theme");

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);

    const root = document.documentElement;
    root.style.setProperty("--toggle-x", `${x}px`);
    root.style.setProperty("--toggle-y", `${y}px`);

    const next = theme === "dark" ? "light" : "dark";

    if (!("startViewTransition" in document)) {
      toggleTheme();
      return;
    }

    // Synchronously update data-theme inside the snapshot so the View
    // Transition captures the correct before/after states.
    (document as Document & { startViewTransition: (cb: () => void) => unknown })
      .startViewTransition(() => {
        root.setAttribute("data-theme", next);
        toggleTheme(); // keeps React state in sync
      });
  }

  return (
    <button
      suppressHydrationWarning
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 rounded-md border border-border-color bg-bg-dark px-4 py-2 font-mono text-sm text-text-on-dark transition-colors hover:bg-bg-dark-secondary"
      aria-label={t("toggleLabel")}
    >
      [{theme === "dark" ? t("light") : t("dark")}]
    </button>
  );
}
