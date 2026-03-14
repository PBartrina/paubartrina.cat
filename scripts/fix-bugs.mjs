#!/usr/bin/env node
/**
 * fix-bugs.mjs
 * Reads open automated bug issues AND approved enhancement issues from
 * GitHub, asks Claude to produce a fix/implementation for each one,
 * applies the changes, verifies they build, then opens a PR linked to
 * the issue.
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  - Anthropic API key
 *   GITHUB_TOKEN       - GitHub token with issues:write, contents:write, pull-requests:write
 *   GITHUB_REPOSITORY  - e.g. "PBartrina/paubartrina.cat"
 */

import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "fs";
import { join, relative, dirname } from "path";
import { mkdirSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";

const REPO = process.env.GITHUB_REPOSITORY ?? "PBartrina/paubartrina.cat";
const [OWNER, REPO_NAME] = REPO.split("/");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_ROOT = process.cwd();
const MAX_ISSUES_PER_RUN = 3;

// i18n JSON file paths (relative)
const I18N_DIR = "src/i18n/messages";
const I18N_FILES = ["ca.json", "es.json", "en.json"].map(
  (f) => `${I18N_DIR}/${f}`
);

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

function collectSourceFiles(
  dir,
  extensions = [".ts", ".tsx", ".mdx", ".css", ".json"]
) {
  const files = [];
  const skip = [
    "node_modules",
    ".next",
    ".git",
    ".github",
    "dist",
    "out",
    "coverage",
  ];
  const skipFiles = ["package-lock.json", "pnpm-lock.yaml"];
  for (const entry of readdirSync(dir)) {
    if (skip.includes(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(full, extensions));
    } else if (
      extensions.some((ext) => entry.endsWith(ext)) &&
      !skipFiles.includes(entry)
    ) {
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
      /* skip unreadable */
    }
  }
  return snapshot;
}

async function githubRequest(path, options = {}) {
  const resp = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GitHub API error ${resp.status} for ${path}: ${text}`);
  }
  return resp.json();
}

async function getOpenBugIssues() {
  return githubRequest(
    `/repos/${OWNER}/${REPO_NAME}/issues?labels=bug,automated&state=open&per_page=50`
  );
}

async function getApprovedEnhancementIssues() {
  return githubRequest(
    `/repos/${OWNER}/${REPO_NAME}/issues?labels=enhancement,automated,approved&state=open&per_page=50`
  );
}

async function createPR(title, body, head, base = "main") {
  return githubRequest(`/repos/${OWNER}/${REPO_NAME}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, body, head, base }),
  });
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
}

function gitConfigureUser() {
  run('git config user.email "github-actions[bot]@users.noreply.github.com"');
  run('git config user.name "github-actions[bot]"');
}

function ensureOnMain() {
  run("git checkout -- .");
  run("git clean -fd");
  run("git checkout main");
  run("git pull origin main");
}

function createBranch(name) {
  run(`git checkout -b ${name}`);
}

/**
 * Recursively extract all leaf-key paths from an object.
 * E.g. { a: { b: 1, c: 2 }, d: 3 } → ["a.b", "a.c", "d"]
 */
function extractKeys(obj, prefix = "") {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys.push(...extractKeys(obj[key], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

/**
 * Deep-merge two plain objects. `overlay` values win for shared keys;
 * keys that exist only in `base` are preserved (never dropped).
 * Arrays are replaced wholesale (not merged element-by-element).
 */
function deepMerge(base, overlay) {
  const result = { ...base };
  for (const key of Object.keys(overlay)) {
    if (
      typeof overlay[key] === "object" &&
      overlay[key] !== null &&
      !Array.isArray(overlay[key]) &&
      typeof base[key] === "object" &&
      base[key] !== null &&
      !Array.isArray(base[key])
    ) {
      result[key] = deepMerge(base[key], overlay[key]);
    } else {
      result[key] = overlay[key];
    }
  }
  return result;
}

// ─── Snapshot & restore i18n files ──────────────────────────────────────────

/** Read all i18n JSON files from disk and return { path: parsedObject } */
function snapshotI18n() {
  const snapshot = {};
  for (const relPath of I18N_FILES) {
    const abs = join(PROJECT_ROOT, relPath);
    if (existsSync(abs)) {
      try {
        snapshot[relPath] = JSON.parse(readFileSync(abs, "utf8"));
      } catch {
        console.warn(`    ⚠️  Could not parse ${relPath} for snapshot`);
      }
    }
  }
  return snapshot;
}

/**
 * After applying all file changes, validate every i18n JSON file:
 *  - If the file on disk is invalid JSON → restore original entirely.
 *  - If valid JSON but missing original keys → deep-merge to restore them.
 *  - If valid JSON with all keys → leave as-is.
 */
function validateAndFixI18n(originalSnapshot) {
  for (const [relPath, originalObj] of Object.entries(originalSnapshot)) {
    const abs = join(PROJECT_ROOT, relPath);
    if (!existsSync(abs)) continue; // file wasn't modified

    let currentText;
    try {
      currentText = readFileSync(abs, "utf8");
    } catch {
      continue;
    }

    // Try to parse what's on disk now
    let currentObj;
    try {
      currentObj = JSON.parse(currentText);
    } catch (parseErr) {
      // File on disk is NOT valid JSON — restore original entirely
      console.warn(
        `    ⚠️  ${relPath} is invalid JSON after apply (${parseErr.message}). Restoring original.`
      );
      writeFileSync(
        abs,
        JSON.stringify(originalObj, null, 2) + "\n",
        "utf8"
      );
      continue;
    }

    // Check for dropped keys
    const originalKeys = extractKeys(originalObj);
    const currentKeys = new Set(extractKeys(currentObj));
    const droppedKeys = originalKeys.filter((k) => !currentKeys.has(k));

    if (droppedKeys.length > 0) {
      console.warn(
        `    ⚠️  ${relPath} lost ${droppedKeys.length} key(s): ${droppedKeys.slice(0, 5).join(", ")}${droppedKeys.length > 5 ? "..." : ""}`
      );
      console.log(`    🔧 Restoring missing keys via deep-merge...`);
      const restored = deepMerge(originalObj, currentObj);
      writeFileSync(
        abs,
        JSON.stringify(restored, null, 2) + "\n",
        "utf8"
      );
      console.log(`    ✅ ${relPath} fixed (${droppedKeys.length} key(s) restored)`);
    }
  }
}

// ─── Apply changes ──────────────────────────────────────────────────────────

function applyFileChanges(changes) {
  for (const { path: filePath, content } of changes) {
    const abs = join(PROJECT_ROOT, filePath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
    console.log(`    📝 Updated: ${filePath}`);
  }
}

function commitAndPush(branchName, message) {
  run("git add -A");
  const msgPath = join(PROJECT_ROOT, ".git", "AUTOMATED_COMMIT_MSG");
  writeFileSync(msgPath, message, "utf8");
  const commitResult = run(`git commit -F ".git/AUTOMATED_COMMIT_MSG"`);
  if (!commitResult.ok) {
    console.warn("    Nothing to commit.");
    return false;
  }
  const pushResult = run(
    `git push origin ${branchName} --force-with-lease`
  );
  if (!pushResult.ok) {
    const pushResult2 = run(`git push -u origin ${branchName}`);
    if (!pushResult2.ok) {
      console.warn(
        "    ⚠️  Push failed:\n",
        pushResult2.output.slice(0, 500)
      );
      return false;
    }
  }
  return true;
}

function verifyBuild(runTests = false) {
  console.log("    🔨 Verifying build...");
  const ts = run("npx tsc --noEmit 2>&1");
  if (!ts.ok) {
    console.warn(
      "    ⚠️  TypeScript errors after fix:\n",
      ts.output.slice(0, 4000)
    );
    return { ok: false, error: `TypeScript errors:\n${ts.output.slice(0, 6000)}` };
  }
  const build = run("npx next build 2>&1");
  if (!build.ok) {
    console.warn(
      "    ⚠️  Build failed after fix:\n",
      build.output.slice(0, 4000)
    );
    return { ok: false, error: `Build failed:\n${build.output.slice(0, 6000)}` };
  }
  if (runTests) {
    console.log("    🧪 Running tests...");
    const test = run("pnpm test -- --reporter=verbose 2>&1");
    if (!test.ok) {
      console.warn(
        "    ⚠️  Tests failed after fix:\n",
        test.output.slice(0, 8000)
      );
      return { ok: false, error: `Tests failed:\n${test.output.slice(0, 10000)}` };
    }
  }
  return { ok: true, error: null };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔧 paubartrina.cat — Auto Fixer\n");

  const bugIssues = (await getOpenBugIssues()).map((i) => ({
    ...i,
    _type: "bug",
  }));
  const enhIssues = (await getApprovedEnhancementIssues()).map((i) => ({
    ...i,
    _type: "enhancement",
  }));
  const allIssues = [...bugIssues, ...enhIssues];

  if (allIssues.length === 0) {
    console.log("✅ No open automated bugs or approved enhancements found.");
    return;
  }

  console.log(
    `Found ${bugIssues.length} bug(s) and ${enhIssues.length} approved enhancement(s). Will process up to ${MAX_ISSUES_PER_RUN}.\n`
  );

  gitConfigureUser();

  const client = new Anthropic();
  let fixed = 0;

  for (const issue of allIssues.slice(0, MAX_ISSUES_PER_RUN)) {
    const isBug = issue._type === "bug";
    const prefix = isBug ? "fix" : "feat";
    const emoji = isBug ? "🐛" : "✨";
    console.log(
      `\n${emoji} Issue #${issue.number}: ${issue.title} [${issue._type}]`
    );

    // Ensure clean state
    ensureOnMain();

    // Snapshot i18n files BEFORE changes so we can restore dropped keys later
    const i18nSnapshot = snapshotI18n();

    const sourceSnapshot = readSourceSnapshot();
    const sourceContext = Object.entries(sourceSnapshot)
      .map(([path, content]) => {
        const capped =
          content.length > 3000
            ? content.slice(0, 3000) + "\n...[truncated]"
            : content;
        return `### ${path}\n\`\`\`\n${capped}\n\`\`\``;
      })
      .join("\n\n");

    const task = isBug ? "fixing a bug" : "implementing an improvement";
    const extraRules = isBug
      ? ""
      : `\n- Include new test file(s) following the project's vitest patterns to verify the new behavior.\n- Be thorough: the improvement should be production-ready.`;

    console.log(
      `    🤖 Asking Claude for a ${isBug ? "fix" : "implementation"}...`
    );
    let fixPlan;
    try {
      const response = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 16384,
        messages: [
          {
            role: "user",
            content: `You are a senior software engineer ${task} in a Next.js 16 / TypeScript / Tailwind CSS v4 personal website.

## Issue to ${isBug ? "fix" : "implement"}

**Title**: ${issue.title}

**Description**:
${issue.body ?? "(no body)"}

## Current source files

${sourceContext}

## Your task

Provide a ${isBug ? "fix" : "complete implementation"} for this issue. Return ONLY valid JSON (no markdown, no explanation) with this shape:
{
  "summary": "One-sentence description of what you changed",
  "changes": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "complete new file content (not a diff, the full file)"
    }
  ]
}

Rules:
- Only change files that are necessary to ${isBug ? "fix the issue" : "implement the improvement"}.
- Do not change unrelated code.
- Preserve all existing functionality — do NOT remove, rename or restructure existing translation keys.
- Keep the same coding style.${extraRules}
- CRITICAL: If you include a translation file (src/i18n/messages/*.json), you MUST include EVERY existing key with its original value intact. Only ADD new keys or change values you explicitly intend to modify. Never restructure, rename, or reorganize the JSON — keep the exact same nesting structure.
- If the issue is not ${isBug ? "fixable" : "implementable"} (e.g. requires secret env vars or manual action), return { "summary": "NOT_FIXABLE", "changes": [] }`,
          },
        ],
      });

      if (response.stop_reason === "max_tokens") {
        throw new Error(
          "Response truncated (max_tokens reached). The fix may be too large."
        );
      }
      let text = response.content[0].text.trim();
      const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (fenceMatch) text = fenceMatch[1].trim();
      fixPlan = JSON.parse(text);
    } catch (err) {
      console.error(
        "    ❌ Claude failed to return a valid response:",
        err.message
      );
      continue;
    }

    if (
      fixPlan.summary === "NOT_FIXABLE" ||
      !Array.isArray(fixPlan.changes) ||
      fixPlan.changes.length === 0
    ) {
      console.log(
        `    ⏭️  Issue not automatically ${isBug ? "fixable" : "implementable"}. Skipping.`
      );
      continue;
    }

    // Reject fixes that touch protected paths
    const protectedPaths = [".github/"];
    const touchesProtected = fixPlan.changes.some((c) =>
      protectedPaths.some((p) => c.path.startsWith(p))
    );
    if (touchesProtected) {
      const blocked = fixPlan.changes.map((c) => c.path).join(", ");
      console.log(
        `    ⏭️  Changes touch protected path(s) [${blocked}] — skipping.`
      );
      continue;
    }

    // Create branch
    const branchName = `${prefix}/${issue.number}-${slugify(issue.title)}`;
    try {
      createBranch(branchName);
    } catch {
      console.warn(
        `    ⚠️  Branch ${branchName} may already exist. Continuing...`
      );
      run(`git checkout ${branchName}`);
    }

    // Apply changes (plain writes)
    console.log(`    Applying ${fixPlan.changes.length} file change(s)...`);
    applyFileChanges(fixPlan.changes);

    // Post-apply: validate i18n JSON files and restore any dropped keys
    console.log("    🔍 Validating i18n translation files...");
    validateAndFixI18n(i18nSnapshot);

    // Verify build (+ tests for enhancements)
    const verification = verifyBuild(!isBug);

    if (!verification.ok) {
      console.log(
        "    ❌ Changes did not pass verification. Rolling back branch."
      );
      ensureOnMain();
      run(`git branch -D ${branchName} 2>/dev/null || true`);
      continue;
    }

    // Commit and push
    const commitMsg = `${prefix}: ${fixPlan.summary} (closes #${issue.number})`;
    const pushed = commitAndPush(branchName, commitMsg);
    if (!pushed) {
      ensureOnMain();
      continue;
    }

    // Create PR
    const prBody = `## Summary

${fixPlan.summary}

## Changes

${fixPlan.changes.map((c) => `- \`${c.path}\``).join("\n")}

## Closes

Closes #${issue.number}

---
🤖 *Automated ${isBug ? "fix" : "improvement"} generated by [Claude](https://claude.ai)*`;

    try {
      const pr = await createPR(
        `${prefix}: ${issue.title}`,
        prBody,
        branchName
      );
      console.log(`    ✅ PR #${pr.number} created: ${pr.html_url}`);
      fixed++;
    } catch (err) {
      console.error("    ❌ Failed to create PR:", err.message);
    }

    ensureOnMain();
  }

  console.log(`\n🏁 Done — ${fixed} issue(s) processed and PR(s) opened.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
