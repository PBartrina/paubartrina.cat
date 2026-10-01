/**
 * Generative mark: seeded Truchet arcs.
 *
 * Every cell of a grid gets one of two quarter-arc orientations from a seeded
 * PRNG, so the same seed always draws the same composition. Pure string in,
 * SVG path out — no DOM, so the OG image route can reuse it (M4).
 */

// ponytail: mulberry32 — ten lines, good enough distribution, no dependency
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a: turns any string (commit sha, date) into a 32-bit seed
export function hashSeed(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** SVG path data for a cols×rows Truchet field in a `0 0 cols rows` viewBox. */
export function truchetPath(seed: string, cols: number, rows: number): string {
  const rand = mulberry32(hashSeed(seed));
  const d: string[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (rand() < 0.5) {
        // arcs around the top-left and bottom-right corners
        d.push(`M${x} ${y + 0.5}A.5 .5 0 0 0 ${x + 0.5} ${y}`);
        d.push(`M${x + 1} ${y + 0.5}A.5 .5 0 0 0 ${x + 0.5} ${y + 1}`);
      } else {
        // arcs around the top-right and bottom-left corners
        d.push(`M${x + 0.5} ${y}A.5 .5 0 0 1 ${x + 1} ${y + 0.5}`);
        d.push(`M${x} ${y + 0.5}A.5 .5 0 0 1 ${x + 0.5} ${y + 1}`);
      }
    }
  }
  return d.join("");
}

/**
 * The seed for this build. Pages are statically prerendered, so the mark is
 * fixed per deploy: the commit on Vercel, the date locally. Swap this for a
 * date if the site ever moves to ISR.
 */
// MARK_SEED pins it in CI so visual snapshots do not change with the date.
export const BUILD_SEED =
  process.env.MARK_SEED ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  new Date().toISOString().slice(0, 10);

/** GitHub link for the build seed when it is a commit sha, else undefined. */
export const BUILD_SEED_HREF = /^[0-9a-f]{40}$/.test(BUILD_SEED)
  ? `https://github.com/PBartrina/paubartrina.cat/commit/${BUILD_SEED}`
  : undefined;
