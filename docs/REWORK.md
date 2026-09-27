# Rework plan

Editorial redesign with a generative twist. Warm and personal, three locales,
Next.js 16, Vercel with a `staging` branch, bots retired, incremental page by
page, four quality gates, hybrid auto-log + essays. No deadline: milestones,
not dates.

Tracking: one GitHub milestone per phase, one issue per PR, all labelled
`rework`. Board: GitHub Projects (see repo → Projects).

> **Closing issues:** PRs merge into `staging`, and GitHub only auto-closes
> `Closes #N` on merges to the default branch. Close the issue by hand after
> each staging merge; the board moves it to Done on close.

**The one structural rule:** every milestone leaves the live site complete.
Nothing is half-built on `main`; the redesign is visible on `staging` until
each page is ready.

## Decisions (settled)

| Question | Answer |
|---|---|
| Flashy = ? | Editorial with a twist that does things. Nothing from home/LAN. |
| Visitor should think | "This person has taste" + "this is a real human" |
| Keep | `/ara`, `/uses`, three locales, a lighter CV/experience, the 4 posts as essays |
| Stack | Stay on Next.js 16 |
| Deploy | Vercel free tier + long-lived `staging` branch with stable preview URL |
| Bots | Retire. Delete the three cron workflows, close the backlog. |
| Gates | Lighthouse CI with budgets, Playwright e2e, visual regression, bundle budget |
| Migration | Incremental, one route per PR, URLs never change |
| The twist | Generative visual identity: seeded SVG, no library |
| Logs | Hybrid: auto entries from merged PRs + the essays highlighted in the same stream |
| Look | New type pairing, mono demoted to accents, new palette, keep dark/light |

## Milestone 0 — Clear the deck

One PR, no design work. Makes everything after it safe.

- Retire bots: delete `.github/workflows/{bug-detection,bug-fixer,improvement-proposer}.yml`
  and `scripts/{detect-bugs,fix-bugs,propose-improvements}.mjs`. Keep
  `translate-post.ts` (still uses `@anthropic-ai/sdk`).
- Close the backlog: all open `automated` issues + PR #189, one `gh` loop with a
  "retired with the automation experiment" comment.
- Protect `main`: require PR + `build` check, no direct push. `main` is
  currently unprotected and the bots had `contents: write`.
- Vercel: assign a stable domain to `staging` (optional, one setting).
- Delete cruft: `public/{file,globe,next,vercel,window}.svg` (create-next-app
  defaults), the two bot lines in `CLAUDE.md`.

**Done when:** staging URL resolves, `main` refuses a direct push, bot workflows gone.

## Milestone 1 — Gates before paint

Establish the baseline *before* changing anything visual, or the cost of the
redesign can't be measured.

- **Lighthouse CI** — `@lhci/cli` as a step in `ci.yml`, run against `next start`
  on the runner (the Vercel preview sits behind Deployment Protection, and a
  local server needs no bypass secret and shares the build with Playwright).
  `lighthouserc.json`: performance ≥ 90, accessibility ≥ 90, plus
  `resource-summary:script:size` ≤ 190 kB and `:total:size` ≤ 480 kB as
  assertions — **those two lines are the bundle-size gate**. No `size-limit`,
  and no `budget.json` (LHCI 0.15 refuses budgets alongside assertions).
  Thresholds start at the measured baseline (a11y 91, script 178 kB) so the
  gate catches regressions from day one; M4 tightens them.
- **Playwright** — `@playwright/test`, one spec per flow: locale switch, theme
  toggle, blog nav, contact form (mock Resend). Runs against `next start` in
  CI, deterministic.
- **Visual regression** — same Playwright, `toHaveScreenshot()` in
  `visual.spec.ts` over routes × 3 locales × 2 themes. Snapshots committed.
  No Percy/Chromatic. **Capture the baseline of the current site in this PR**
  so milestone 2's first visual PR shows the full before/after.
  Snapshots are **Linux renders generated only in CI**: run the *Visual
  snapshots* workflow on the branch, then
  `gh run download -n visual-snapshots -D e2e/visual.spec.ts-snapshots` and
  commit. That is also the refresh procedure for every intentional design
  change in M2/M3 — never `--update-snapshots` locally.

**Done when:** a PR that adds 100 kB of JS or drops perf below 90 fails CI.

## Milestone 2 — Identity

**PR 2a — Tokens and type.** The existing token layer in `globals.css`
(`--color-*`, `--font-display`, `--expo-out`) is the migration seam: change the
*values* in `:root` and `[data-theme=dark]`, keep the *names*, and all 27
components re-skin in one diff with zero component edits. Swap `Raleway` for
the new display face in `layout.tsx` via `next/font/google` — two lines; the
CSP's `font-src 'self'` already covers it because `next/font` self-hosts.

Proposed pairing: **Fraunces** (display) / **Inter** (body) / **JetBrains
Mono** (code and metadata only). Palette: warm off-white / near-black neutrals
with one saturated accent that shifts *hue* between themes, not just lightness.
Three candidate palettes go in the PR for review on staging.

**PR 2b — The generative mark.** `<GenerativeMark />`: inline SVG from a seeded
PRNG (mulberry32, ~10 lines, no library). Seed = today's date, so every visitor
on a given day sees the same composition and it changes overnight. Honours
`prefers-reduced-motion`. Server-rendered, ~2 kB, zero CSP changes. The same
function generates OG images in milestone 4.

**Done when:** staging looks like a different site and the visual diff is the
full before/after.

## Milestone 3 — Pages, one PR each

| # | Route | Change |
|---|---|---|
| 3.1 | `/` | New hero with the generative mark, short intro, latest log entries. Drops Services/Skills/Experience stack. |
| 3.2 | `/ara` | Same content model, new layout. Git-derived "last updated" stays. |
| 3.3 | `/log` (new) | Build-time fetch of merged PRs from GitHub REST (server-side → no `connect-src` change; `GITHUB_TOKEN` env in Vercel). One entry per PR. The 4 MDX posts appear as highlighted essay entries in the same stream. Optional `content/log-notes.json` adds a one-liner to any entry by PR number. PR titles stay English in all locales; only chrome is translated. |
| 3.4 | `/blog/*` | **URLs don't change.** Listing becomes a filtered view of `/log` (essays only). JSON-LD and inbound links survive. |
| 3.5 | `/uses` | Reskin only. |
| 3.6 | `/about` (new) | Absorbs CV: bio, compact timeline (trimmed `experience` JSON), two testimonials. `/cv` stays as the printable route but leaves the nav. |
| 3.7 | `/contacte` | Reskin. |

Each PR: three locale JSON entries, visual snapshot update, gates green.

**Done when:** every route on staging is on the new design; `staging → main`
is one clean PR.

## Milestone 4 — Launch polish

- OG images via the generative function → cards match the site.
- `sitemap.ts` / `robots.ts` pick up `/log` and `/about`.
- Tighten Lighthouse budgets to what the redesign actually achieves.
- Three-locale read-through of every page.
- Merge `staging → main`. That merge is the launch.

## Deliberately out

- **No motion library.** CSS transitions + `--expo-out` + View Transitions API.
  Add Motion only when a specific interaction proves it needs one.
- **No CMS, no database.** MDX + one JSON notes file. The log writes itself.
- **No `/blog → /log` redirect.** Both exist; nothing to break.
- **No design-system package, no Storybook.** 27 components, one site; tokens
  in one CSS file *is* the design system.
