import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression (docs/REWORK.md, milestone 1).
 *
 * Every route × locale × theme, full page, compared against PNGs committed in
 * e2e/visual.spec.ts-snapshots/. Snapshots are Linux/Chromium renders and are
 * only ever generated in CI — run the "Visual snapshots" workflow, download the
 * artifact, commit. Never run --update-snapshots locally.
 */

const ROUTES = [
  ["home", ""],
  ["ara", "/ara"],
  ["blog", "/blog"],
  ["post", "/blog/cinc-mesos-de-bots-els-numeros"],
  ["uses", "/uses"],
  ["cv", "/cv"],
  ["contacte", "/contacte"],
] as const;
const LOCALES = ["ca", "es", "en"] as const;
const THEMES = ["light", "dark"] as const;

// Reveal-on-scroll and page transitions short-circuit under reduced motion,
// so a full-page capture sees the finished layout instead of mid-animation.
test.use({ reducedMotion: "reduce" });

function masks(page: Page) {
  return [
    page.getByRole("progressbar"), // reading progress, scroll-dependent
    page.getByTestId("last-updated"), // git-derived date on /ara
  ];
}

for (const theme of THEMES) {
  for (const locale of LOCALES) {
    for (const [name, path] of ROUTES) {
      test(`${name} · ${locale} · ${theme}`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
        await page.goto(`/${locale}${path}`);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page).toHaveScreenshot(`${name}-${locale}-${theme}.png`, {
          fullPage: true,
          animations: "disabled",
          mask: masks(page),
          // Per-pixel YIQ tolerance. Default 0.2 let the M2 palette swap pass as
          // "unchanged" on text-heavy pages; 0.1 registers accent-level changes
          // while still ignoring anti-aliasing noise.
          threshold: 0.1,
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  }
}
