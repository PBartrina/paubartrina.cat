import fs from "fs";
import path from "path";
import { getAllPosts, type BlogPostMeta } from "@/lib/blog";

/**
 * The hybrid log (docs/REWORK.md, 3.3): every merged pull request plus the
 * essays from content/blog, one stream, newest first. PRs come from the GitHub
 * REST API at build time; content/log-notes.json adds an optional one-liner
 * to any PR by number.
 */

const REPO = "PBartrina/paubartrina.cat";

export interface LogEntry {
  kind: "pr" | "essay";
  date: string; // ISO
  title: string;
  href: string;
  external: boolean;
  number?: number;
  description?: string;
  note?: string;
}

export interface MergedPR {
  number: number;
  title: string;
  mergedAt: string;
  url: string;
}

export type LogNotes = Record<string, string>;

export function readLogNotes(): LogNotes {
  const file = path.join(process.cwd(), "content", "log-notes.json");
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf-8")) as LogNotes;
}

/**
 * Up to 300 most recently updated closed PRs, merged ones only. Unauthenticated
 * GitHub allows 60 requests/hour per IP — set GITHUB_TOKEN in Vercel so shared
 * build IPs don't get rate-limited. A failed fetch logs and yields no PR
 * entries rather than failing the build; the essays still render.
 */
export async function fetchMergedPRs(): Promise<MergedPR[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const out: MergedPR[] = [];
  for (let page = 1; page <= 3; page++) {
    let res: Response;
    try {
      res = await fetch(
        `https://api.github.com/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`,
        { headers, cache: "force-cache" }
      );
    } catch (err) {
      // A thrown fetch (network) during prerender would fail the whole build.
      console.warn(`[log] GitHub API unreachable on page ${page}; PR entries omitted`, err);
      break;
    }
    if (!res.ok) {
      console.warn(`[log] GitHub API ${res.status} on page ${page}; PR entries omitted`);
      break;
    }
    const prs = (await res.json()) as Array<{
      number: number;
      title: string;
      merged_at: string | null;
      html_url: string;
    }>;
    for (const pr of prs) {
      if (pr.merged_at) out.push({ number: pr.number, title: pr.title, mergedAt: pr.merged_at, url: pr.html_url });
    }
    if (prs.length < 100) break;
  }
  return out;
}

/** Pure merge + sort so it can be unit-tested without the network. */
export function mergeEntries(prs: MergedPR[], posts: BlogPostMeta[], notes: LogNotes): LogEntry[] {
  const entries: LogEntry[] = [
    ...prs.map<LogEntry>((pr) => ({
      kind: "pr",
      date: pr.mergedAt,
      title: pr.title,
      href: pr.url,
      external: true,
      number: pr.number,
      note: notes[String(pr.number)],
    })),
    ...posts.map<LogEntry>((post) => ({
      kind: "essay",
      date: post.date,
      title: post.title,
      href: `/blog/${post.slug}`,
      external: false,
      description: post.description,
    })),
  ];
  return entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export async function getLogEntries(locale: string): Promise<LogEntry[]> {
  return mergeEntries(await fetchMergedPRs(), getAllPosts(locale), readLogNotes());
}
