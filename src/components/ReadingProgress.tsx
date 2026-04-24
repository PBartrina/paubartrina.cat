"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const t = useTranslations("blog");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t("readingProgress")}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "4px",
        width: `${progress}%`,
        backgroundColor: "var(--text-accent)",
        zIndex: 100,
        transition: "width 0.1s ease",
      }}
    />
  );
}
