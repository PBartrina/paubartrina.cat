#!/usr/bin/env node
/**
 * detect-bugs.mjs
 * Code quality & security scanner for paubartrina.cat.
 * Uses Claude to analyze source code for security flaws, performance issues,
 * accessibility gaps, SEO problems, code quality, and dependency health.
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  - Anthropic API key
 *   GITHUB_TOKEN       - GitHub token with issues:write permission
 *   GITHUB_REPOSITORY  - e.g. "PBartrina/paubartrina.cat"
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import Anthropic from "@anthropic-ai/sdk";

const REPO = process.env.GITHUB_REPOSITORY ?? "PBartrina/paubartrina.cat";
const [OWNER, REPO_NAME] = REPO.split("/");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_ROOT = process.cwd();
const MAX_ISSUES = 5;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd) {
  try {
    return {
      ok: true,
      output: execSync(cmd, {
        cwd: PROJECT_ROOT,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }),
    };
  } catch (err) {
    return {
      ok: false,
      output: (err.stdout ?? "") + (err.stderr ?? ""),
    };
  }
}

const SKIP_DIRS = ["node_modules", ".next", ".git", "dist", "out", "coverage"];
const SKIP_FILES = ["package-lock.json", "pnpm-lock.yaml"];

function collectSourceFiles(
  dir,
  extensions = [".ts", ".tsx", ".mdx", ".css", ".json", ".mjs"]
) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.includes(entry)) continue;
    if (SKIP_FILES.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(full, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function readSourceSnapshot() {
  const files = collectSourceFiles(PROJECT_ROOT);
  const snapshot = {};
  for (const f of files) {
    const rel = relative(PROJECT_ROOT, f).replace(/\\/g, "/");
    try {
      snapshot[rel] = readFileSync(f, "utf8");
    } catch {
      // skip unreadable files
    }
  }
  return snapshot;
}

// ─── GitHub API ──────────────────────────────────────────────────────────────

async function getAllAutomatedIssues() {
  const all = [];
  for (const state of ["open", "closed"]) {
    const url = `https://api.github.com/repos/${OWNER}/${REPO_NAME}/issues?labels=bug,automated&state=${state}&per_page=100`;
    const resp = await fetch(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    });
    if (resp.ok) {
      const issues = await resp.json();
      all.push(...issues);
    }
  }
  return all;
}

async function createIssue(title, body, category) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO_NAME}/issues`;
  const labels = ["bug", "automated"];
  if (category) labels.push(category);

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body, labels }),
  });
  if (!resp.ok) {
    console.error("Failed to create issue:", title, await resp.text());
    return null;
  }
  return resp.json();
}

// ─── Dedup ───────────────────────────────────────────────────────────────────

function wordSet(str) {
  return new Set(
    str
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function isDuplicate(newTitle, existingIssues) {
  const lower = newTitle.toLowerCase();
  const newWords = wordSet(newTitle);
  return existingIssues.some((issue) => {
    if (issue.title.toLowerCase() === lower) return true;
    const existingWords = wordSet(issue.title);
    const overlap = [...newWords].filter((w) => existingWords.has(w)).length;
    return overlap / Math.max(newWords.size, existingWords.size) > 0.5;
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 paubartrina.cat — Code Quality Scanner\n");

  // 1. Run pnpm audit
  console.log("Running dependency audit...");
  const auditResult = run("pnpm audit --json 2>&1");
  let auditSummary = "";
  try {
    const audit = JSON.parse(auditResult.output);
    const vulns = audit.advisories ? Object.values(audit.advisories) : [];
    if (vulns.length > 0) {
      auditSummary = vulns
        .map(
          (v) =>
            `- **${v.severity}**: ${v.module_name}@${v.findings?.[0]?.version ?? "?"} — ${v.title} (${v.url})`
        )
        .join("\n");
    } else {
      auditSummary = "No known vulnerabilities found.";
    }
  } catch {
    auditSummary =
      auditResult.output.slice(0, 2000) ||
      "Audit completed (no parseable output).";
  }
  console.log("Audit summary:", auditSummary.slice(0, 200));

  // 2. Collect source files
  console.log("\nCollecting source files for analysis...");
  const sourceSnapshot = readSourceSnapshot();
  const fileList = Object.keys(sourceSnapshot)
    .map((f) => `- ${f}`)
    .join("\n");
  console.log(`Found ${Object.keys(sourceSnapshot).length} source file(s).`);

  // 3. Fetch existing issues (open + closed) for dedup
  const existingIssues = await getAllAutomatedIssues();
  console.log(
    `Found ${existingIssues.length} existing automated issue(s) (open + closed).`
  );

  const existingIssuesSummary = existingIssues
    .map(
      (i) =>
        `- [${i.state}] ${i.title}: ${(i.body || "").slice(0, 150).replace(/\n/g, " ")}`
    )
    .join("\n");

  // 4. Build source context
  const sourceContext = Object.entries(sourceSnapshot)
    .map(([path, content]) => {
      const capped =
        content.length > 3000
          ? content.slice(0, 3000) + "\n...[truncated]"
          : content;
      return `### ${path}\n\`\`\`\n${capped}\n\`\`\``;
    })
    .join("\n\n");

  // 5. Ask Claude to analyze
  console.log("\nAsking Claude to scan for issues...");
  const client = new Anthropic();

  const prompt = `You are a senior security and code quality auditor reviewing a Next.js 16 / TypeScript / Tailwind CSS v4 portfolio site (paubartrina.cat).

Stack: App Router, next-intl for i18n, Resend for email, deployed on Vercel free tier.

Scan the source code below for issues across these categories:

## 1. Security
- XSS: dangerouslySetInnerHTML with dynamic content, unsanitized user input interpolated into HTML strings
- Injection: SQL injection, command injection, header injection
- Missing security headers (CSP, X-Frame-Options, etc.)
- Exposed secrets or API key patterns in source code
- External links missing rel="noopener noreferrer"
- IMPORTANT: The theme init script in layout.tsx uses dangerouslySetInnerHTML with a HARDCODED string — this is a standard FOUC prevention pattern and is NOT a vulnerability. Do NOT report it.

## 2. Performance
- images: { unoptimized: true } in next.config (disables image optimization)
- Missing <Suspense> boundaries around async server components
- 'use client' on components that could be server components
- Large third-party imports without tree-shaking
- Missing lazy loading for below-the-fold content

## 3. Accessibility (a11y)
- Missing alt text on images
- Missing aria-label on interactive elements (buttons, links with only icons)
- Heading hierarchy gaps (e.g. h1 → h3, skipping h2)
- Missing form labels or label associations
- Focus management issues

## 4. SEO
- Missing structured data (JSON-LD) on key pages
- Missing or incomplete robots.txt / sitemap.xml
- Missing page-level metadata (title, description, og:image)
- Missing canonical URLs or hreflang for multilingual routes

## 5. Code Quality
- TODO / FIXME / HACK comments left in production code
- Dead exports or unused code
- Hardcoded user-facing strings that should use i18n (t() from next-intl)
- Inconsistent error handling (some errors swallowed silently)

## 6. Dependency Health
Here is the npm audit output — triage these findings (is the vulnerable package used in production or dev-only? Is it actually reachable?):

${auditSummary}

---

## Existing issues (DO NOT report these again — they are already tracked):
${existingIssuesSummary || "(none)"}

---

## Source files:

${sourceContext}

## File list:
${fileList}

---

## Instructions:
- Only report issues you can cite with a SPECIFIC file path. Do not speculate or guess.
- Prefer 3-5 high-confidence findings over many speculative ones.
- For each issue, assign a severity: critical, high, medium, low.
- Do NOT report issues already listed in the "Existing issues" section above.
- Do NOT report the theme init script dangerouslySetInnerHTML — it is intentional.
- Group related problems in the same file into one issue.

Return ONLY valid JSON (no markdown fences, no explanation) with this shape:
[
  {
    "title": "Short, specific issue title (max 80 chars)",
    "body": "## Category\\nsecurity|performance|a11y|seo|code-quality|dependency\\n\\n## Severity\\ncritical|high|medium|low\\n\\n## Problem\\nClear description of the issue.\\n\\n## Location\\nExact file path and line number(s).\\n\\n## Suggested fix\\nSpecific, actionable fix with code snippet if applicable.\\n\\n## Evidence\\nThe specific code that triggers this finding.",
    "category": "security|performance|a11y|seo|code-quality|dependency",
    "severity": "critical|high|medium|low"
  }
]

If there are no actionable issues, return an empty array: []`;

  const response = await client.messages
    .stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    })
    .finalMessage();

  let issues = [];
  try {
    let text = response.content[0].text.trim();
    // Strip markdown code fences if present
    const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fenceMatch) text = fenceMatch[1].trim();
    issues = JSON.parse(text);
  } catch (err) {
    console.error("Claude returned unexpected output:", response.content[0].text);
    console.error("Parse error:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(issues) || issues.length === 0) {
    console.log("✅ Claude found no actionable issues.");
    return;
  }

  console.log(`\nClaude identified ${issues.length} issue(s).`);

  // 6. Sort by severity and cap
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
  );
  issues = issues.slice(0, MAX_ISSUES);

  // 7. Dedup and create issues
  const severityEmoji = {
    critical: "\uD83D\uDD34",
    high: "\uD83D\uDFE0",
    medium: "\uD83D\uDFE1",
    low: "\uD83D\uDD35",
  };

  let created = 0;
  for (const issue of issues) {
    if (isDuplicate(issue.title, existingIssues)) {
      console.log(`  ⏭️  Skipping (duplicate): ${issue.title}`);
      continue;
    }

    const badge = severityEmoji[issue.severity] ?? "\u26AA";
    const fullBody = `${badge} **Severity: ${issue.severity}**\n\n${issue.body}\n\n---\n_Detected by automated code quality scanner_`;

    const result = await createIssue(issue.title, fullBody, issue.category);
    if (result) {
      console.log(`  ✅ Created #${result.number}: ${issue.title}`);
      created++;
    }
  }

  console.log(`\n🏁 Done — ${created} new issue(s) created.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
