"use client";

import { useState } from "react";
import { truchetPath } from "@/lib/mark";

const COLS = 8;
const ROWS = 8;

function randomSeed() {
  return Math.random().toString(16).slice(2, 9);
}

/**
 * The home page's live mark: starts from the deployed seed, "Regenera" swaps
 * in a random one. Same generator as the server-rendered marks.
 */
export default function MarkPlayground({
  initialSeed,
  seedHref,
  labels,
}: {
  initialSeed: string;
  /** Link for the deployed seed (the commit), if it is one. */
  seedHref?: string;
  labels: { seed: string; regenerate: string; reset: string };
}) {
  const [seed, setSeed] = useState(initialSeed);
  const isDeployed = seed === initialSeed;
  const shown = /^[0-9a-f]{40}$/.test(seed) ? seed.slice(0, 7) : seed;

  return (
    <div className="flex flex-col items-start gap-4">
      <svg
        viewBox={`0 0 ${COLS} ${ROWS}`}
        aria-hidden="true"
        className="h-56 w-56 text-text-accent md:h-64 md:w-64"
      >
        <path
          d={truchetPath(seed, COLS, ROWS)}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.1}
          strokeLinecap="round"
        />
      </svg>
      <p className="font-mono text-xs text-text-secondary" aria-live="polite">
        {labels.seed}:{" "}
        {isDeployed && seedHref ? (
          <a href={seedHref} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
            {shown}
          </a>
        ) : (
          <span className="text-text-primary">{shown}</span>
        )}
      </p>
      <div className="flex flex-col items-start gap-2 font-mono text-sm">
        <button
          type="button"
          onClick={() => setSeed(randomSeed())}
          className="rounded-md bg-bg-dark px-4 py-2 font-bold text-text-on-dark transition-opacity hover:opacity-80"
        >
          {labels.regenerate}
        </button>
        {/* Always rendered so its line is reserved: showing it must not move the layout. */}
        <button
          type="button"
          onClick={() => setSeed(initialSeed)}
          aria-hidden={isDeployed}
          tabIndex={isDeployed ? -1 : undefined}
          className={`text-xs text-text-secondary underline hover:text-text-accent hover:no-underline ${
            isDeployed ? "invisible" : ""
          }`}
        >
          {labels.reset}
        </button>
      </div>
    </div>
  );
}
