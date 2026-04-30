"use client";

import { useState } from "react";

interface ShareButtonProps {
  url: string;
  title: string;
  labelShare: string;
  labelCopied: string;
  labelCopyLink: string;
}

export default function ShareButton({
  url,
  title,
  labelShare,
  labelCopied,
  labelCopyLink,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Try Web Share API first (mobile / modern browsers)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled or API unavailable — fall through to clipboard
      }
    }

    // Clipboard copy fallback
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Last resort: open mailto share
      window.open(
        `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
        "_blank"
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? labelCopied : labelShare}
      className="inline-flex items-center gap-2 rounded-md border border-border-color px-3 py-1.5 font-mono text-sm text-text-secondary transition-colors hover:border-text-accent hover:text-text-accent"
    >
      {copied ? (
        <>
          {/* Check icon */}
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {labelCopied}
        </>
      ) : (
        <>
          {/* Share / link icon */}
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          {labelCopyLink}
        </>
      )}
    </button>
  );
}
