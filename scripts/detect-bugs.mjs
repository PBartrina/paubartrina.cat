#!/usr/bin/env node
/**
 * detect-bugs.mjs
 * Runs TypeScript, ESLint, and build checks on paubartrina.cat,
 * then uses Claude to analyze the results and create GitHub issues
 * for any bugs or issues found.
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

function collectSourceFiles(dir, extensions = [".ts", ".tsx", ".mdx"]) {
  const files = [];
  const skip = ["node_modules", ".next", ".git", "dist", "out", "coverage"];
  for (const entry of readdirSync(dir)) {
    if (skip.includes(entry)) continue;
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

async function getExistingIssues() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO_NAME}/issues?labels=bug,automated&state=open&per_page=100`;
  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!resp.ok) {
    console.warn("Could not fetch existing issues:", await resp.text());
    return [];
  }
  return resp.json();
}

async function createIssue(title, body) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO_NAME}/issues`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      body,
      labels: ["bug", "automated"],
    }),
  });
  if (!resp.ok) {
    console.error("Failed to create issue:", title, await resp.text());
    return null;
  }
  return resp.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔍 paubartrina.cat — Bug Detector\n");

  // 1. Run checks
  console.log("Running TypeScript type check...");
  const tsResult = run("npx tsc --noEmit 2>&1");

  console.log("Running ESLint...");
  const lintResult = run("pnpm lint 2>&1");

  console.log("Running tests...");
  const testResult = run("pnpm test 2>&1");

  console.log("Running next build...");
  const buildResult = run("npx next build 2>&1");

  const allPassed = tsResult.ok && lintResult.ok && testResult.ok && buildResult.ok;

  if (allPassed) {
    console.log("✅ All checks passed — no issues to report.");
    return;
  }

  // 2. Collect source files
  console.log("\nCollecting source files for analysis...");
  const sourceSnapshot = readSourceSnapshot();
  const fileList = Object.keys(sourceSnapshot)
    .map((f) => `- ${f}`)
    .join("\n");

  // 3. Summarise check output (cap length to avoid huge payloads)
  const cap = (s) => (s.length > 8000 ? s.slice(0, 8000) + "\n...[truncated]" : s);

  const checkReport = `
## TypeScript (${tsResult.ok ? "✅ PASS" : "❌ FAIL"})
\`\`\`
${cap(tsResult.output.trim() || "(no output)")}
\`\`\`

## ESLint (${lintResult.ok ? "✅ PASS" : "❌ FAIL"})
\`\`\`
${cap(lintResult.output.trim() || "(no output)")}
\`\`\`

## Tests (${testResult.ok ? "✅ PASS" : "❌ FAIL"})
\`\`\`
${cap(testResult.output.trim() || "(no output)")}
\`\`\`

## Build (${buildResult.ok ? "✅ PASS" : "❌ FAIL"})
\`\`\`
${cap(buildResult.output.trim() || "(no output)")}
\`\`\`
`.trim();

  // 4. Build source context (cap each file)
  const sourceContext = Object.entries(sourceSnapshot)
    .map(([path, content]) => {
      const capped = content.length > 3000 ? content.slice(0, 3000) + "\n...[truncated]" : content;
      return `### ${path}\n\`\`\`\n${capped}\n\`\`\``;
    })
    .join("\n\n");

  // 5. Ask Claude to analyze
  console.log("\nAsking Claude to analyze issues...");
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a senior software engineer reviewing a Next.js 16 / TypeScript / Tailwind CSS v4 personal website (paubartrina.cat).

The automated CI checks have just run and produced the following output:

${checkReport}

Here are all the source files in the project:

${sourceContext}

Project file list:
${fileList}

Please analyze the errors and produce a JSON array of GitHub issues to create.
Each issue should be distinct, actionable, and specific.
Deduplicate — do not create multiple issues for the same root cause.
If an error has multiple instances in the same file, group them into one issue.

Return ONLY valid JSON (no markdown, no explanation) with this shape:
[
  {
    "title": "Short, specific issue title (max 80 chars)",
    "body": "Markdown body with:\\n## Problem\\n...\\n## Location\\nFile path and line if known.\\n## Suggested fix\\n..."
  }
]

If there are no actionable issues, return an empty array: []`,
      },
    ],
  });

  let issues = [];
  try {
    let text = response.content[0].text.trim();
    // Strip markdown code fences if present (e.g. ```json ... ```)
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

  // 6. Fetch existing open automated issues to avoid duplicates
  const existing = await getExistingIssues();
  const existingTitles = new Set(existing.map((i) => i.title.toLowerCase()));

  // 7. Create GitHub issues
  let created = 0;
  for (const issue of issues) {
    const lowerTitle = issue.title.toLowerCase();
    if (existingTitles.has(lowerTitle)) {
      console.log(`  ⏭️  Skipping (already open): ${issue.title}`);
      continue;
    }
    const result = await createIssue(issue.title, issue.body);
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
