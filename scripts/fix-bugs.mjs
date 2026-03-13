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
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { mkdirSync } from "fs";
import Anthropic from "@anthropic-ai/sdk";

const REPO = process.env.GITHUB_REPOSITORY ?? "PBartrina/paubartrina.cat";
const [OWNER, REPO_NAME] = REPO.split("/");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_ROOT = process.cwd();
const MAX_ISSUES_PER_RUN = 3; // avoid runaway fixes

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd, { throwOnError = false } = {}) {
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
    if (throwOnError) throw err;
    return {
      ok: false,
      output: (err.stdout ?? "") + (err.stderr ?? ""),
    };
  }
}

function collectSourceFiles(dir, extensions = [".ts", ".tsx", ".mdx", ".css", ".json"]) {
  const files = [];
  // .github excluded: the GitHub token lacks `workflows` permission, so any
  // fix touching CI files would fail to push. Keep it out of Claude's context.
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
      // skip
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
  // Discard any uncommitted changes and untracked files left by a failed fix,
  // so the next issue starts from a clean working tree.
  run("git checkout -- .");
  run("git clean -fd");
  run("git checkout main");
  run("git pull origin main");
}

function createBranch(name) {
  run(`git checkout -b ${name}`);
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

function applyFileChanges(changes) {
  // changes: Array<{ path: string, content: string }>
  for (const { path: filePath, content } of changes) {
    const abs = join(PROJECT_ROOT, filePath);

    // For i18n JSON files: if Claude included ALL existing keys, write as-is
    // (trusting Claude's intended value changes). If Claude dropped keys,
    // deep-merge to restore the missing ones while keeping Claude's changes.
    if (filePath.startsWith("src/i18n/messages/") && filePath.endsWith(".json")) {
      try {
        const original = JSON.parse(readFileSync(abs, "utf8"));
        const proposed = JSON.parse(content);
        const originalKeys = extractKeys(original);
        const proposedKeys = new Set(extractKeys(proposed));
        const droppedKeys = originalKeys.filter((k) => !proposedKeys.has(k));

        if (droppedKeys.length > 0) {
          // Claude dropped keys — merge to restore them
          const merged = deepMerge(original, proposed);
          mkdirSync(dirname(abs), { recursive: true });
          writeFileSync(abs, JSON.stringify(merged, null, 2) + "\n", "utf8");
          console.log(`    📝 Updated (merged, restored ${droppedKeys.length} dropped key(s)): ${filePath}`);
          continue;
        }
        // Claude included all keys — write as-is (trust Claude's values)
      } catch {
        // If original doesn't exist or isn't valid JSON, fall through to plain write
      }
    }

    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
    console.log(`    📝 Updated: ${filePath}`);
  }
}

function commitAndPush(branchName, message) {
  run("git add -A");
  // Write the commit message to a file to avoid shell-quoting issues with
  // special characters (quotes, newlines, etc.) in Claude's summary text.
  const msgPath = join(PROJECT_ROOT, ".git", "AUTOMATED_COMMIT_MSG");
  writeFileSync(msgPath, message, "utf8");
  const commitResult = run(`git commit -F ".git/AUTOMATED_COMMIT_MSG"`);
  if (!commitResult.ok) {
    console.warn("    Nothing to commit.");
    return false;
  }
  // Try force-push first (handles re-runs on the same branch),
  // then fall back to a regular push for a brand-new branch.
  const pushResult = run(`git push origin ${branchName} --force-with-lease`);
  if (!pushResult.ok) {
    const pushResult2 = run(`git push -u origin ${branchName}`);
    if (!pushResult2.ok) {
      console.warn("    ⚠️  Push failed:\n", pushResult2.output.slice(0, 500));
      return false;
    }
  }
  return true;
}

function verifyBuild(runTests = false) {
  console.log("    🔨 Verifying build...");
  const ts = run("npx tsc --noEmit 2>&1");
  if (!ts.ok) {
    console.warn("    ⚠️  TypeScript errors after fix:\n", ts.output.slice(0, 4000));
    return { ok: false, error: `TypeScript errors:\n${ts.output.slice(0, 6000)}` };
  }
  const build = run("npx next build 2>&1");
  if (!build.ok) {
    console.warn("    ⚠️  Build failed after fix:\n", build.output.slice(0, 4000));
    return { ok: false, error: `Build failed:\n${build.output.slice(0, 6000)}` };
  }
  if (runTests) {
    console.log("    🧪 Running tests...");
    // Run with --reporter=verbose so every test result is shown in the output
    const test = run("pnpm test -- --reporter=verbose 2>&1");
    if (!test.ok) {
      console.warn("    ⚠️  Tests failed after fix:\n", test.output.slice(0, 8000));
      return { ok: false, error: `Tests failed:\n${test.output.slice(0, 10000)}` };
    }
  }
  return { ok: true, error: null };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔧 paubartrina.cat — Auto Fixer\n");

  // Fetch both bug issues and approved enhancement issues
  const bugIssues = (await getOpenBugIssues()).map((i) => ({ ...i, _type: "bug" }));
  const enhIssues = (await getApprovedEnhancementIssues()).map((i) => ({ ...i, _type: "enhancement" }));
  const allIssues = [...bugIssues, ...enhIssues]; // bugs first

  if (allIssues.length === 0) {
    console.log("✅ No open automated bugs or approved enhancements found.");
    return;
  }

  console.log(`Found ${bugIssues.length} bug(s) and ${enhIssues.length} approved enhancement(s). Will process up to ${MAX_ISSUES_PER_RUN}.\n`);

  gitConfigureUser();

  const client = new Anthropic();
  let fixed = 0;

  for (const issue of allIssues.slice(0, MAX_ISSUES_PER_RUN)) {
    const isBug = issue._type === "bug";
    const prefix = isBug ? "fix" : "feat";
    const emoji = isBug ? "🐛" : "✨";
    console.log(`\n${emoji} Issue #${issue.number}: ${issue.title} [${issue._type}]`);

    // Read current source
    ensureOnMain();
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

    // Build type-aware prompt
    const task = isBug ? "fixing a bug" : "implementing an improvement";
    const extraRules = isBug
      ? ""
      : `\n- Include new test file(s) following the project's vitest patterns to verify the new behavior.\n- Be thorough: the improvement should be production-ready.`;

    // Ask Claude for a fix
    console.log(`    🤖 Asking Claude for a ${isBug ? "fix" : "implementation"}...`);
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
- Preserve all existing functionality.
- Keep the same coding style.${extraRules}
- If you modify any JSON translation file (src/i18n/messages/*.json), include the complete file with all existing keys plus any new ones you add.
- If the issue is not ${isBug ? "fixable" : "implementable"} (e.g. requires secret env vars or manual action), return { "summary": "NOT_FIXABLE", "changes": [] }`,
          },
        ],
      });

      if (response.stop_reason === "max_tokens") {
        throw new Error("Response truncated (max_tokens reached). The fix may be too large.");
      }
      let text = response.content[0].text.trim();
      // Strip markdown code fences if present (e.g. ```json ... ```)
      const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (fenceMatch) text = fenceMatch[1].trim();
      fixPlan = JSON.parse(text);
    } catch (err) {
      console.error("    ❌ Claude failed to return a valid response:", err.message);
      continue;
    }

    if (
      fixPlan.summary === "NOT_FIXABLE" ||
      !Array.isArray(fixPlan.changes) ||
      fixPlan.changes.length === 0
    ) {
      console.log(`    ⏭️  Issue not automatically ${isBug ? "fixable" : "implementable"}. Skipping.`);
      continue;
    }

    // Reject fixes that touch protected paths (e.g. workflow files require
    // a GitHub token with the `workflows` scope, which we don't have).
    const protectedPaths = [".github/"];
    const touchesProtected = fixPlan.changes.some((c) =>
      protectedPaths.some((p) => c.path.startsWith(p))
    );
    if (touchesProtected) {
      const blocked = fixPlan.changes.map((c) => c.path).join(", ");
      console.log(`    ⏭️  Changes touch protected path(s) [${blocked}] — skipping (needs manual intervention).`);
      continue;
    }

    // Create branch
    const branchName = `${prefix}/${issue.number}-${slugify(issue.title)}`;
    try {
      createBranch(branchName);
    } catch {
      console.warn(`    ⚠️  Branch ${branchName} may already exist. Continuing...`);
      run(`git checkout ${branchName}`);
    }

    // Apply changes
    console.log(`    Applying ${fixPlan.changes.length} file change(s)...`);
    applyFileChanges(fixPlan.changes);

    // Verify — run tests for enhancements, not just build
    let verification = verifyBuild(!isBug);

    // Retry once: if verification failed, ask Claude to fix the errors
    if (!verification.ok) {
      console.log("    🔄 Verification failed. Asking Claude to fix the errors (retry 1/1)...");

      // Read the current (broken) source state so Claude sees its own changes
      const retrySnapshot = readSourceSnapshot();
      const retryContext = Object.entries(retrySnapshot)
        .map(([path, content]) => {
          const capped = content.length > 3000
            ? content.slice(0, 3000) + "\n...[truncated]"
            : content;
          return `### ${path}\n\`\`\`\n${capped}\n\`\`\``;
        })
        .join("\n\n");

      try {
        const retryResponse = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 16384,
          messages: [
            {
              role: "user",
              content: `You are a senior software engineer. You just applied changes to a Next.js 16 / TypeScript / Tailwind CSS v4 project but verification failed.

## Original issue

**Title**: ${issue.title}

**Description**:
${issue.body ?? "(no body)"}

## Verification errors

\`\`\`
${verification.error}
\`\`\`

## Current source files (after your previous changes)

${retryContext}

## Your task

Fix the verification errors. Return ONLY valid JSON (no markdown, no explanation) with this shape:
{
  "summary": "One-sentence description of what you fixed",
  "changes": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "complete new file content (not a diff, the full file)"
    }
  ]
}

Rules:
- Only change files necessary to fix the verification errors.
- Preserve all existing functionality.
- Keep the same coding style.
- If you modify any JSON translation file (src/i18n/messages/*.json), include the complete file with all existing keys plus any new ones you add.
- If the errors are not fixable, return { "summary": "NOT_FIXABLE", "changes": [] }`,
            },
          ],
        });

        if (retryResponse.stop_reason === "max_tokens") {
          throw new Error("Retry response truncated (max_tokens reached).");
        }
        let retryText = retryResponse.content[0].text.trim();
        const retryFence = retryText.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        if (retryFence) retryText = retryFence[1].trim();
        const retryPlan = JSON.parse(retryText);

        if (
          retryPlan.summary === "NOT_FIXABLE" ||
          !Array.isArray(retryPlan.changes) ||
          retryPlan.changes.length === 0
        ) {
          console.log("    ❌ Claude could not fix the verification errors.");
        } else {
          console.log(`    Applying ${retryPlan.changes.length} retry fix(es)...`);
          applyFileChanges(retryPlan.changes);
          fixPlan.summary += ` — also: ${retryPlan.summary}`;
          fixPlan.changes = [...fixPlan.changes, ...retryPlan.changes.filter(
            (rc) => !fixPlan.changes.some((fc) => fc.path === rc.path)
          )];
          verification = verifyBuild(!isBug);
        }
      } catch (retryErr) {
        console.error("    ❌ Retry failed:", retryErr.message);
      }
    }

    if (!verification.ok) {
      console.log("    ❌ Changes did not pass verification after retry. Rolling back branch.");
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
