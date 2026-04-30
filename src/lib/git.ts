import { execSync } from "child_process";

/**
 * Returns the ISO date string of the most recent git commit, optionally
 * scoped to specific file paths.
 *
 * Runs at BUILD TIME only (server component / `next build`).
 * Returns null if git is unavailable (e.g. CI without git history).
 */
export function getLastCommitDate(files?: string[]): string | null {
  try {
    const fileArgs = files ? `-- ${files.join(" ")}` : "";
    const result = execSync(
      `git log -1 --format=%ci ${fileArgs}`,
      { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    ).trim();
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Formats an ISO date string for display, using the given locale.
 * Returns a human-readable string like "April 2025" or "Abril 2025".
 */
export function formatCommitDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(date);
}
