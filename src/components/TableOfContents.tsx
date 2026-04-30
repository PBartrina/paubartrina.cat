"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/lib/headings";

interface TableOfContentsProps {
  headings: Heading[];
  title: string;
}

export default function TableOfContents({ headings, title }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const headingEls = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    // Disconnect previous observer
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "0px 0px -70% 0px",
        threshold: 0,
      }
    );

    headingEls.forEach((el) => observerRef.current!.observe(el));

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      el.focus({ preventScroll: true });
    }
  };

  return (
    <nav
      aria-label={title}
      className="sticky top-24 hidden w-64 shrink-0 xl:block"
    >
      <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-text-secondary">
        {title}
      </p>
      <ul className="space-y-1 border-l border-border-color pl-4">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={[
                "block py-0.5 font-mono text-sm leading-snug transition-colors hover:text-text-accent",
                heading.level === 3 ? "pl-4" : "",
                activeId === heading.id
                  ? "text-text-accent"
                  : "text-text-secondary",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
