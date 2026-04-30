"use client";

import { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  /** Additional class names applied regardless of visibility */
  className?: string;
  /** Delay in ms before animation starts once visible (default: 0) */
  delay?: number;
}

/**
 * Wraps children in a div that fades in + slides up when the element
 * enters the viewport via IntersectionObserver.
 *
 * Uses CSS class `reveal-visible` (defined in globals.css) to trigger
 * the animation; starts in an invisible but laid-out state so the page
 * layout is not affected before the section becomes visible.
 *
 * Respects prefers-reduced-motion — immediately shows content without
 * any animation when the user prefers reduced motion.
 */
export default function RevealOnScroll({
  children,
  className = "",
  delay = 0,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px", threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={[
        "reveal-on-scroll",
        visible ? "reveal-visible" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
