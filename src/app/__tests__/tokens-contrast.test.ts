import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

/**
 * Guards the colour tokens in globals.css against WCAG AA regressions
 * (4.5:1 for normal text). Every text token is checked on every surface it
 * is used on. Accents on --bg-dark must use --text-accent-on-dark.
 */

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf("\n" + selector + " {");
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*(#[0-9a-f]{6})/gi)].map(([, k, v]) => [k, v.toLowerCase()])
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(fg: string, bg: string): number {
  const [a, b] = [luminance(fg) + 0.05, luminance(bg) + 0.05];
  return Math.max(a, b) / Math.min(a, b);
}

const PAIRS: [string, string][] = [
  ["--text-primary", "--bg-primary"],
  ["--text-secondary", "--bg-primary"],
  ["--text-accent", "--bg-primary"],
  ["--text-primary", "--card-bg"],
  ["--text-secondary", "--card-bg"],
  ["--text-accent", "--card-bg"],
  ["--text-on-dark", "--bg-dark"],
  ["--text-on-dark", "--bg-dark-secondary"],
  ["--text-accent-on-dark", "--bg-dark"],
];

const THEMES = [
  ["light", ":root"],
  ["dark", '[data-theme="dark"]'],
  // ponytail: review candidates for #254, drop with the CSS blocks
  ["light b", '[data-palette="b"]'],
  ["dark b", '[data-palette="b"][data-theme="dark"]'],
  ["light c", '[data-palette="c"]'],
  ["dark c", '[data-palette="c"][data-theme="dark"]'],
] as const;

describe("colour tokens meet WCAG AA (4.5:1)", () => {
  for (const [name, selector] of THEMES) {
    it(name, () => {
      const t = tokens(selector);
      const failures = PAIRS.filter(([fg, bg]) => contrast(t[fg], t[bg]) < 4.5).map(
        ([fg, bg]) => `${fg} on ${bg} = ${contrast(t[fg], t[bg]).toFixed(2)}`
      );
      expect(failures).toEqual([]);
    });
  }
});

it("contrast() matches the WCAG reference (black on white = 21)", () => {
  expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 1);
});
