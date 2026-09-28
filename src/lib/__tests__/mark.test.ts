import { describe, expect, it } from "vitest";
import { hashSeed, truchetPath } from "../mark";

describe("truchetPath", () => {
  it("is deterministic for a seed and differs across seeds", () => {
    expect(truchetPath("abc", 6, 4)).toBe(truchetPath("abc", 6, 4));
    expect(truchetPath("abc", 6, 4)).not.toBe(truchetPath("abd", 6, 4));
  });

  it("draws two arcs per cell inside the viewBox", () => {
    const d = truchetPath("seed", 5, 3);
    expect(d.match(/A/g)).toHaveLength(5 * 3 * 2);
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(Math.min(...nums)).toBeGreaterThanOrEqual(0);
  });

  it("hashSeed spreads similar inputs apart", () => {
    expect(hashSeed("2026-09-27")).not.toBe(hashSeed("2026-09-28"));
  });
});
