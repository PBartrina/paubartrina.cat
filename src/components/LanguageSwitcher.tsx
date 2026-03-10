"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("languageSwitcher");

  function handleSwitch(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  return (
    <div className="flex gap-1 font-mono text-xs">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => handleSwitch(l)}
          disabled={l === locale}
          className={`rounded px-2 py-1 transition-colors ${
            l === locale
              ? "bg-text-accent text-bg-dark font-bold"
              : "text-text-on-dark hover:text-text-accent"
          }`}
          aria-label={`${t("label")}: ${t(l)}`}
          aria-current={l === locale ? "true" : undefined}
        >
          {t(l)}
        </button>
      ))}
    </div>
  );
}
