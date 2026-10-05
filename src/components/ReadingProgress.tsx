"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SITE_NAV_ID } from "@/lib/site-nav";

export default function ReadingProgress() {
  const t = useTranslations("blog");
  const [progress, setProgress] = useState(0);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const nav = document.getElementById(SITE_NAV_ID);

    const update = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0);
      // Sit along the bottom edge of the sticky navbar, wherever it is.
      setTop(nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    // Opening the mobile menu changes the navbar height without a scroll or
    // resize event.
    let navObserver: ResizeObserver | undefined;
    if (nav) {
      navObserver = new ResizeObserver(update);
      navObserver.observe(nav);
    }
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      navObserver?.disconnect();
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
        top: `${top}px`,
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
