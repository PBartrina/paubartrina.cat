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
| `pnpm new-post` | Create a new blog post |

> **Note:** Always use `pnpm lint`, not `pnpm dlx eslint`. The project uses ESLint 9; `pnpm dlx` downloads the latest version which may be incompatible.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx          # Homepage (about, experience, skills)
│   ├── ara/              # /ara — what I'm doing now
│   ├── blog/             # /blog + /blog/[slug] — MDX posts
│   ├── contacte/         # /contacte — contact form
│   └── api/
│       └── contact/      # POST /api/contact — email handler
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ThemeToggle.tsx
content/
└── blog/                 # MDX blog posts (.mdx)
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

## Deployment

Pushes to `main` are automatically deployed via Vercel. The CI pipeline (GitHub Actions) runs lint, type check, and build before merge.

```bash
git push origin main   # triggers Vercel deploy + CI
```

---

## License

Private — all rights reserved.
