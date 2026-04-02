"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("codeBlock");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? t("copied") : t("copy")}
      className="absolute right-3 top-3 rounded border border-border-color bg-card-bg px-2 py-1 font-mono text-xs text-text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:border-text-accent hover:text-text-accent focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-text-accent"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
