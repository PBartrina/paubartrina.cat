import { ImageResponse } from "next/og";
import { truchetPath } from "@/lib/mark";

export const ogSize = { width: 1200, height: 630 };

/**
 * A page that sets its own `openGraph` replaces the inherited one (metadata
 * merges shallowly), which drops the [locale]/opengraph-image card. Such pages
 * spread this into their openGraph to point back at it.
 */
export const localeOgImage = (locale: string) => ({
  images: [{ url: `https://paubartrina.cat/${locale}/opengraph-image`, ...ogSize, alt: "Pau Bartrina" }],
});

// Palette A, dark theme (globals.css [data-theme="dark"]).
const INK = "#141216";
const TEXT = "#efe9e2";
const MUTED = "#a9a0aa";
const ACCENT = "#f58fa9";

/**
 * Shared Open Graph card: the generative Truchet field behind an eyebrow,
 * a title and an optional meta line. Same generator as the site's mark, so
 * shared links carry the identity. Seed per page (slug) or per deploy.
 */
export function ogCard({
  seed,
  eyebrow,
  title,
  meta,
}: {
  seed: string;
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  const cols = 24;
  const rows = 13;
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px 80px",
          background: INK,
        }}
      >
        <svg
          width={ogSize.width}
          height={ogSize.height}
          viewBox={`0 0 ${cols} ${rows}`}
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", top: 0, left: 0, opacity: 0.22 }}
        >
          <path
            d={truchetPath(seed, cols, rows)}
            fill="none"
            stroke={ACCENT}
            strokeWidth={0.12}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ display: "flex", color: ACCENT, fontSize: 26, marginBottom: 20 }}>{eyebrow}</div>
        <div
          style={{
            display: "flex",
            color: TEXT,
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        {meta && (
          <div style={{ display: "flex", color: MUTED, fontSize: 26, marginTop: 28 }}>{meta}</div>
        )}
      </div>
    ),
    { ...ogSize }
  );
}
