"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps page content with a CSS fade-in + slide-up animation on route changes.
 * Uses the pathname as React key so the component remounts (re-animates)
 * whenever the user navigates to a different page.
 *
 * Animation is defined in globals.css as @keyframes page-enter
 * and honoured via `motion-reduce` media query.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="page-transition-wrapper"
    >
      {children}
    </div>
  );
}
