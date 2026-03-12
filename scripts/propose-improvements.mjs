#!/usr/bin/env node
/**
 * propose-improvements.mjs
 * Analyzes the paubartrina.cat source code and uses Claude to suggest
 * visual, technical, or feature improvements. Creates GitHub issues
 * with labels ["enhancement", "automated"] for the user to review.
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  - Anthropic API key
 *   GITHUB_TOKEN       - GitHub token with issues:write permission
 *   GITHUB_REPOSITORY  - e.g. "PBartrina/paubartrina.cat"
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import Anthropic from "@anthropic-ai/sdk";

const REPO = process.env.GITHUB_REPOSITORY ?? "PBartrina/paubartrina.cat";
const [OWNER, REPO_NAME] = REPO.split("/");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_ROOT = process.cwd();
const MAX_SUGGESTIONS = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function collectSourceFiles(dir, extensions = [".ts", ".tsx", ".mdx", ".css", ".json"]) {
  const files = [];
  const skip = ["node_modules", ".next", ".git", ".github", "dist", "out", "coverage"];
  const skipFiles = ["package-lock.json", "pnpm-lock.yaml"];
  for (const entry of readdirSync(dir)) {
    if (skip.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(full, extensions));
    } else if (extensions.some((ext) => entry.endsWith(ext)) && !skipFiles.includes(entry)) {
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
  const url = `https://api.github.com/repos/${OWNER}/${REPO_NAME}/issues?labels=enhancement,automated&state=open&per_page=100`;
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
      labels: ["enhancement", "automated"],
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
  console.log("💡 paubartrina.cat — Improvement Proposer\n");

  // 1. Collect source files
  console.log("Collecting source files for analysis...");
  const sourceSnapshot = readSourceSnapshot();
  const fileList = Object.keys(sourceSnapshot)
    .map((f) => `- ${f}`)
    .join("\n");

  // 2. Build source context (cap each file)
  const cap = (s, max) => (s.length > max ? s.slice(0, max) + "\n...[truncated]" : s);

  const sourceContext = Object.entries(sourceSnapshot)
    .map(([path, content]) => `### ${path}\n\`\`\`\n${cap(content, 3000)}\n\`\`\``)
    .join("\n\n");

  // 3. Ask Claude for improvement suggestions
  console.log("Asking Claude for improvement suggestions...");
  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a senior software engineer and UX expert reviewing a personal portfolio website.

## Project context

- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, next-intl for i18n (ca/es/en)
- **Purpose**: Portfolio for a Senior Frontend Engineer (Angular specialist, 15+ years experience)
- **Hosting**: Vercel
- **Status**: All CI checks pass. The code works correctly. You are NOT looking for bugs.

## Source files

${sourceContext}

## File list

${fileList}

## Your task

Suggest up to ${MAX_SUGGESTIONS} impactful improvements across these categories:

- **visual**: UI/UX polish, accessibility (a11y), responsive design gaps, animations, design consistency
- **technical**: Performance optimization, code quality, refactoring, bundle size, SEO improvements
- **feature**: New functionality that adds value to a portfolio site (e.g., project showcase, testimonials, RSS feed, search)

Return ONLY valid JSON (no markdown, no explanation) with this shape:
[
  {
    "title": "Short, specific title (max 80 chars)",
    "body": "## Category\\nvisual | technical | feature\\n\\n## Description\\nDetailed explanation of the improvement.\\n\\n## Implementation hints\\nSpecific files to modify and approach.",
    "category": "visual | technical | feature"
  }
]

Rules:
- Be specific and actionable. Include file paths and concrete implementation details.
- Do NOT suggest things that are already implemented in the code.
- Focus on genuinely impactful improvements, not trivial nitpicks.
- Each suggestion must be independently implementable.
- If you have fewer than ${MAX_SUGGESTIONS} meaningful suggestions, return fewer. Quality over quantity.
- If you have no meaningful suggestions, return an empty array: []`,
      },
    ],
  });

  let suggestions = [];
  try {
    let text = response.content[0].text.trim();
    const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    if (fenceMatch) text = fenceMatch[1].trim();
    suggestions = JSON.parse(text);
  } catch (err) {
    console.error("Claude returned unexpected output:", response.content[0].text);
    console.error("Parse error:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    console.log("✅ Claude has no improvement suggestions at this time.");
    return;
  }

  console.log(`\nClaude suggested ${suggestions.length} improvement(s).`);

  // 4. Fetch existing open improvement issues to avoid duplicates
  const existing = await getExistingIssues();
  const existingTitles = new Set(existing.map((i) => i.title.toLowerCase()));

  // 5. Create GitHub issues
  let created = 0;
  for (const suggestion of suggestions.slice(0, MAX_SUGGESTIONS)) {
    const lowerTitle = suggestion.title.toLowerCase();
    if (existingTitles.has(lowerTitle)) {
      console.log(`  ⏭️  Skipping (already open): ${suggestion.title}`);
      continue;
    }
    const result = await createIssue(suggestion.title, suggestion.body);
    if (result) {
      console.log(`  ✅ Created #${result.number}: ${suggestion.title} [${suggestion.category}]`);
      created++;
    }
  }

  console.log(`\n🏁 Done — ${created} new improvement issue(s) created.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
