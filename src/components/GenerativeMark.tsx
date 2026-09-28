import { BUILD_SEED, truchetPath } from "@/lib/mark";

interface Props {
  cols?: number;
  rows?: number;
  seed?: string;
  className?: string;
  /** Draw-in animation (skipped under prefers-reduced-motion via CSS). */
  animate?: boolean;
}

/**
 * Seeded Truchet mark. Server-rendered inline SVG; stroke is currentColor so
 * it takes whatever text colour token the parent sets. Decorative — hidden
 * from assistive tech.
 */
export default function GenerativeMark({
  cols = 4,
  rows = 4,
  seed = BUILD_SEED,
  className = "",
  animate = false,
}: Props) {
  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={`${animate ? "mark-draw " : ""}${className}`}
    >
      <path
        d={truchetPath(seed, cols, rows)}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.12}
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}
