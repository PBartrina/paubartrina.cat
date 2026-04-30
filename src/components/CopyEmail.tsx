"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const EMAIL = "paumc.bcn@gmail.com";

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("common");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available — fallback: open mailto
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-2 font-mono text-sm text-text-secondary">
      <span>{t("orEmail")}</span>
      <div className="flex items-center gap-2">
        <a
          href={`mailto:${EMAIL}`}
          className="text-text-accent hover:underline"
        >
          {EMAIL}
        </a>
        <button
          onClick={handleCopy}
          aria-label={copied ? t("emailCopied") : t("copyEmail")}
          className="rounded-md border border-border-color px-2 py-1 text-xs transition-colors hover:border-text-accent hover:text-text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-accent"
        >
          {copied ? t("emailCopied") : t("copyEmail")}
        </button>
      </div>
    </div>
  );
}
