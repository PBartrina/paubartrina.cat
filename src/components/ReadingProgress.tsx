"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { SITE_NAV_ID } from "@/lib/site-nav";

const noopSubscribe = () => () => {};

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

  // Rendered into <body>, not in place: page content sits inside
  // .page-transition-wrapper, whose animation leaves a transform that would
  // make position: fixed relative to the wrapper instead of the viewport.
  // false during SSR and hydration, true after mount (document exists).
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted) return null;

  return createPortal(
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
    />,
    document.body
  );
}
