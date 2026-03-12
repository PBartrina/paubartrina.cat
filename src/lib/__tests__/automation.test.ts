import { describe, it, expect } from "vitest";

// ─── Reimplemented pure functions from automation scripts ────────────────────
// The .mjs scripts can't be directly imported by vitest, so we reimplement
// the pure logic here to verify the contracts.

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function categorizeIssue(labels: string[]): "bug" | "enhancement" | null {
  const set = new Set(labels);
  if (set.has("bug") && set.has("automated")) return "bug";
  if (set.has("enhancement") && set.has("automated") && set.has("approved"))
    return "enhancement";
  return null;
}

function getBranchName(
  type: "bug" | "enhancement",
  number: number,
  title: string
): string {
  const prefix = type === "enhancement" ? "feat" : "fix";
  return `${prefix}/${number}-${slugify(title)}`;
}

function getCommitMessage(
  type: "bug" | "enhancement",
  summary: string,
  number: number
): string {
  const prefix = type === "enhancement" ? "feat" : "fix";
  return `${prefix}: ${summary} (closes #${number})`;
}

function isDuplicate(title: string, existingTitles: Set<string>): boolean {
  return existingTitles.has(title.toLowerCase());
}

function stripCodeFences(text: string): string {
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenceMatch ? fenceMatch[1].trim() : text;
}

function parseClaudeResponse(text: string): unknown[] {
  const stripped = stripCodeFences(text.trim());
  return JSON.parse(stripped);
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("automation: slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(slugify("Fix: bug in <Nav>")).toBe("fix-bug-in-nav");
  });

  it("truncates at 40 characters", () => {
    const long = "this is a very long title that should be truncated at forty chars";
    expect(slugify(long).length).toBeLessThanOrEqual(40);
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("automation: categorizeIssue", () => {
  it('returns "bug" for bug+automated labels', () => {
    expect(categorizeIssue(["bug", "automated"])).toBe("bug");
  });

  it('returns "enhancement" for enhancement+automated+approved labels', () => {
    expect(
      categorizeIssue(["enhancement", "automated", "approved"])
    ).toBe("enhancement");
  });

  it("returns null for enhancement+automated without approved", () => {
    expect(categorizeIssue(["enhancement", "automated"])).toBeNull();
  });

  it("returns null for unknown label combinations", () => {
    expect(categorizeIssue(["question"])).toBeNull();
    expect(categorizeIssue([])).toBeNull();
  });
});

describe("automation: getBranchName", () => {
  it("uses fix/ prefix for bugs", () => {
    expect(getBranchName("bug", 42, "Broken navbar")).toBe(
      "fix/42-broken-navbar"
    );
  });

  it("uses feat/ prefix for enhancements", () => {
    expect(getBranchName("enhancement", 7, "Add dark mode")).toBe(
      "feat/7-add-dark-mode"
    );
  });
});

describe("automation: getCommitMessage", () => {
  it("uses fix: prefix for bugs", () => {
    expect(getCommitMessage("bug", "Resolve navbar overlap", 42)).toBe(
      "fix: Resolve navbar overlap (closes #42)"
    );
  });

  it("uses feat: prefix for enhancements", () => {
    expect(getCommitMessage("enhancement", "Add dark mode toggle", 7)).toBe(
      "feat: Add dark mode toggle (closes #7)"
    );
  });
});

describe("automation: isDuplicate", () => {
  const existing = new Set(["fix broken navbar", "add dark mode"]);

  it("returns true for case-insensitive match", () => {
    expect(isDuplicate("Fix Broken Navbar", existing)).toBe(true);
  });

  it("returns false for no match", () => {
    expect(isDuplicate("New feature", existing)).toBe(false);
  });
});

describe("automation: stripCodeFences", () => {
  it("strips ```json fences", () => {
    expect(stripCodeFences('```json\n[{"a":1}]\n```')).toBe('[{"a":1}]');
  });

  it("strips ``` fences without language tag", () => {
    expect(stripCodeFences('```\n[{"a":1}]\n```')).toBe('[{"a":1}]');
  });

  it("returns text unchanged if no fences", () => {
    expect(stripCodeFences('[{"a":1}]')).toBe('[{"a":1}]');
  });
});

describe("automation: parseClaudeResponse", () => {
  it("parses valid JSON", () => {
    const result = parseClaudeResponse('[{"title":"Test"}]');
    expect(result).toEqual([{ title: "Test" }]);
  });

  it("parses fenced JSON", () => {
    const result = parseClaudeResponse('```json\n[{"title":"Test"}]\n```');
    expect(result).toEqual([{ title: "Test" }]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseClaudeResponse("not json")).toThrow();
  });

  it("parses empty array", () => {
    expect(parseClaudeResponse("[]")).toEqual([]);
  });
});
