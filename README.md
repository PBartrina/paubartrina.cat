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
| i18n | next-intl |
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
│   ├── layout.tsx              # Minimal root layout (returns children)
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale layout (html lang, fonts, providers)
│   │   ├── page.tsx            # Homepage (hero, about, skills, experience)
│   │   ├── ara/page.tsx        # /[locale]/ara — now page
│   │   ├── blog/
│   │   │   ├── page.tsx        # /[locale]/blog — blog listing
│   │   │   └── [slug]/page.tsx # /[locale]/blog/[slug] — blog post
│   │   └── contacte/
│   │       ├── page.tsx        # /[locale]/contacte — contact form
│   │       ├── ContactForm.tsx
│   │       └── __tests__/      # ContactForm component tests
│   └── api/
│       └── contact/            # POST /api/contact — email handler
│           └── __tests__/      # API route tests
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ThemeToggle.tsx
│   ├── LanguageSwitcher.tsx    # CA / ES / EN locale switcher
│   └── BlogCard.tsx
├── i18n/
│   ├── config.ts              # Locale constants (ca, es, en)
│   ├── routing.ts             # next-intl routing config
│   ├── navigation.ts          # Locale-aware Link, useRouter, etc.
│   ├── request.ts             # Server request config
│   ├── messages/
│   │   ├── ca.json            # Catalan translations (primary)
│   │   ├── es.json            # Spanish translations
│   │   └── en.json            # English translations
│   └── __tests__/             # i18n config + translation key parity tests
└── lib/
    ├── blog.ts                # MDX post loading (locale-aware)
    ├── theme.tsx              # ThemeProvider + useTheme hook
    ├── utils.ts               # Shared utilities (slugify, etc.)
    └── __tests__/             # Unit tests for lib modules
content/
└── blog/
    ├── ca/                    # Catalan blog posts (originals)
    ├── es/                    # Spanish translations
    └── en/                    # English translations
```

---

## Internationalization (i18n)

The site supports three languages with prefix-based routing:

| Language | URL prefix | Example |
|----------|-----------|---------|
| Catalan (primary) | `/ca/` | `/ca/blog` |
| Spanish | `/es/` | `/es/blog` |
| English | `/en/` | `/en/blog` |

- Root `/` redirects to `/ca/` (default locale)
- Route segments are kept in Catalan across all languages (e.g. `/en/contacte`, `/en/ara`)
- All UI strings are stored in JSON files under `src/i18n/messages/`
- Blog posts live in locale subdirectories: `content/blog/ca/`, `content/blog/es/`, `content/blog/en/`
- Posts in non-Catalan locales show a translation warning banner with a link to the original

### Adding translations

1. Edit the corresponding JSON file in `src/i18n/messages/`
2. Ensure all three files have the same keys (the `config.test.ts` will catch mismatches)

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

The script asks for a locale (defaults to `ca`) and creates a new `.mdx` file in `content/blog/{locale}/` with pre-filled frontmatter. Use the same slug across locales to link translations together.

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
| `src/lib/__tests__/blog.test.ts` | `getAllPosts`, `getPostBySlug`, `getAllSlugs`, `getAvailableLocales` (mocked `fs`) |
| `src/lib/__tests__/theme.test.tsx` | `ThemeProvider` mount, localStorage, toggle, `useTheme` |
| `src/i18n/__tests__/config.test.ts` | Locale config, translation key parity across all languages |
| `src/app/[locale]/contacte/__tests__/ContactForm.test.tsx` | Form render, submission, all error paths, sending state |
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
