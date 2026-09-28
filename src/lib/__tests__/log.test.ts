import { describe, expect, it } from "vitest";
import { mergeEntries } from "../log";
import type { BlogPostMeta } from "../blog";

const post = (slug: string, date: string): BlogPostMeta => ({
  slug,
  locale: "ca",
  title: slug,
  date,
  description: "d",
  tags: [],
  readingTime: "1 min read",
  readingTimeMinutes: 1,
});

describe("mergeEntries", () => {
  it("interleaves PRs and essays newest first and attaches notes by PR number", () => {
    const entries = mergeEntries(
      [
        { number: 10, title: "old pr", mergedAt: "2026-03-01T10:00:00Z", url: "u10" },
        { number: 20, title: "new pr", mergedAt: "2026-09-01T10:00:00Z", url: "u20" },
      ],
      [post("essay", "2026-06-15")],
      { "20": "a note" }
    );
    expect(entries.map((e) => e.title)).toEqual(["new pr", "essay", "old pr"]);
    expect(entries[0]).toMatchObject({ kind: "pr", number: 20, note: "a note", external: true });
    expect(entries[1]).toMatchObject({ kind: "essay", href: "/blog/essay", external: false });
    expect(entries[2].note).toBeUndefined();
  });
});
