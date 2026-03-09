# paubartrina.cat

Personal website and blog for Pau Bartrina. Built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 with custom theme variables
- **Blog**: MDX files in `content/blog/` with gray-matter frontmatter
- **Package Manager**: pnpm
- **Hosting**: Vercel (free tier)
- **CI**: GitHub Actions

## Commands

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm lint         # ESLint
pnpm new-post     # Create a new blog post (interactive CLI)
```

## Project Structure

- `src/app/` - Next.js App Router pages (home, ara, blog)
- `src/components/` - React components (Navbar, Footer, Hero, Services, ThemeToggle, BlogCard)
- `src/lib/` - Utilities (blog.ts for MDX reading, theme.tsx for dark/light toggle)
- `content/blog/` - MDX blog posts with frontmatter (title, date, description, tags, published)
- `scripts/` - CLI tools (new-post.ts)

## Conventions

- All user-facing content is in **Catalan**
- Monospace font (JetBrains Mono) throughout
- Color scheme: dark navy headers/footers, light gray body, blue accent (#63b3ed)
- Theme toggle supports dark/light mode via CSS custom properties + `data-theme` attribute

## Git Workflow

- `main` branch is production (auto-deploys to Vercel)
- PRs for all changes, CI must pass before merge
- Automated bug detection creates issues labeled `bug, automated`
- Automated bug fixer creates PRs labeled `automated-fix`
