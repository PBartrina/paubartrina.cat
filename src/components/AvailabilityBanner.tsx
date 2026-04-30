"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "availability-banner-dismissed";

export default function AvailabilityBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("availability");

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage not available — just hide for this session
    }
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label={t("ariaLabel")}
      className="relative flex items-center justify-between gap-4 bg-text-accent px-6 py-3 font-mono text-sm text-bg-dark"
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="text-base">🟢</span>
        <span className="font-semibold">{t("message")}</span>
        <Link
          href="/contacte"
          className="underline hover:no-underline"
        >
          {t("cta")}
        </Link>
      </div>

      <button
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="flex-shrink-0 rounded p-1 hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bg-dark"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
