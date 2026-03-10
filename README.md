# paubartrina.cat

Personal website of Pau Bartrina — developer, built with Next.js.

**Live:** [paubartrina.cat](https://paubartrina.cat)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Package manager | pnpm |
| Hosting | Vercel |
| Email | Resend API |

---

## Getting started

### Prerequisites

- Node.js ≥ 22
- pnpm ≥ 10

### Install & run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint on `src/` |
| `pnpm test` | Run all Vitest unit tests |
| `pnpm new-post` | Create a new blog post |

> **Note:** Always use `pnpm lint`, not `pnpm dlx eslint`. The project uses ESLint 9; `pnpm dlx` downloads the latest version which may be incompatible.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx               # Homepage (about, experience, skills)
│   ├── ara/                   # /ara — what I'm doing now
│   ├── blog/                  # /blog + /blog/[slug] — MDX posts
│   ├── contacte/              # /contacte — contact form
│   │   ├── page.tsx
│   │   ├── ContactForm.tsx
│   │   └── __tests__/         # ContactForm component tests
│   └── api/
│       └── contact/           # POST /api/contact — email handler
│           └── __tests__/     # API route tests
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ThemeToggle.tsx
└── lib/
    ├── blog.ts                # MDX post loading helpers
    ├── theme.tsx              # ThemeProvider + useTheme hook
    ├── utils.ts               # Shared utilities (slugify, etc.)
    └── __tests__/             # Unit tests for lib modules
content/
└── blog/                      # MDX blog posts (.mdx)
```

---

## Contact form

The `/contacte` page sends email via [Resend](https://resend.com) without exposing any address to visitors. It includes honeypot anti-spam and rate limiting (5 requests / IP / 15 min).

Resend is used instead of SMTP because Vercel's free tier blocks all outbound SMTP connections (ports 25, 465, 587).

### Setup

1. Create a free account at [resend.com](https://resend.com) (3,000 emails/month free)
2. Add and verify the domain `paubartrina.cat` under **Domains**
3. Create an API key under **API Keys**

### Environment variables

Create a `.env.local` file at the project root:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=hola@paubartrina.cat
```

Add the same variables as **Vercel Environment Variables** at:
`https://vercel.com/dashboard → Project → Settings → Environment Variables`

Then redeploy for the changes to take effect.

---

## Writing a blog post

```bash
pnpm new-post
```

This creates a new `.mdx` file in `content/blog/` with pre-filled frontmatter. Edit the file and the post will appear at `/blog/[slug]` automatically.

---

## Testing

The project uses [Vitest](https://vitest.dev/) with React Testing Library.

```bash
pnpm test        # run all tests once
pnpm test --watch  # watch mode during development
```

| Test file | What it covers |
|-----------|---------------|
| `src/lib/__tests__/utils.test.ts` | `slugify()` — lowercasing, diacritics, edge cases |
| `src/lib/__tests__/blog.test.ts` | `getAllPosts`, `getPostBySlug`, `getAllSlugs` (mocked `fs`) |
| `src/lib/__tests__/theme.test.tsx` | `ThemeProvider` mount, localStorage, toggle, `useTheme` |
| `src/app/contacte/__tests__/ContactForm.test.tsx` | Form render, submission, all error paths, sending state |
| `src/app/api/contact/__tests__/route.test.ts` | API validation, honeypot, rate limiting, Resend integration |

Component tests run in a `happy-dom` environment (declared via `@vitest-environment happy-dom` docblock). Utility and API tests run in Node.

---

## Deployment

Pushes to `main` are automatically deployed via Vercel. The CI pipeline (GitHub Actions) runs type check, lint, tests, and build before merging.

```bash
git push origin main   # triggers Vercel deploy + CI
```

---

## License

Private — all rights reserved.
