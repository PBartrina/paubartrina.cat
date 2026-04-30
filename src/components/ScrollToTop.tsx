"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("common");

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label={t("scrollToTop")}
      className="fixed bottom-20 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border-color bg-card-bg font-mono text-lg text-text-accent shadow-md transition-all hover:scale-110 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-accent"
    >
      ↑
    </button>
  );
}
