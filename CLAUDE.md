# CLAUDE.md

Personal portfolio site for Rahmad Rizki — single-page Next.js app with an
AI chatbot that answers visitor questions from his resume.

## Commands

```bash
npm run dev     # dev server on :3000
npm run build   # production build — run this before pushing, TS errors are NOT ignored
npm start       # serve the production build
```

`npm run lint` is defined but eslint is not installed; it will prompt to install
a config. Use `npm run build` as the check instead.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui
(new-york, neutral base) · framer-motion · Gemini + Upstash Redis for the chatbot.

Path alias: `@/*` → repo root.

## Layout

- `app/page.tsx` — the whole site: section components stacked in order.
- `components/portfolio/*` — one file per section (hero, about, education,
  experience, certifications, projects, contact, footer, navbar).
- `components/chatbot/*` — chat widget, loaded client-only after hydration.
- `components/ui/*` — shadcn primitives. Generated; don't hand-edit unless fixing
  a real bug. Add new ones with `npx shadcn@latest add <name>`.
- `app/globals.css` — Tailwind v4 setup + the theme tokens (oklch). Dark theme
  only; `:root` and `.dark` hold the same values.
- `public/images/{projects,certificates}/` — section imagery.

## Content lives in the components

There is no CMS and no data directory. Each section holds its own typed array at
the top of the file — edit those to update the site:

| What | Where |
|---|---|
| Skills, bio facts | `components/portfolio/about.tsx` — `skills`, `bioInfo` |
| Degrees, hackathons | `components/portfolio/education.tsx` — `education`, `hackathons` |
| Work history | `components/portfolio/experience.tsx` — `experiences` |
| Certificates | `components/portfolio/certifications.tsx` — `featuredCertification`, `otherCertifications` |
| Projects | `components/portfolio/projects.tsx` — `featuredProjects`, `portfolioProjects` |
| Contact links | `components/portfolio/contact.tsx`, `footer.tsx` |

Adding a project or certificate means adding the array entry **and** dropping the
image into the matching `public/images/` folder.

## Conventions

- **framer-motion: import `m`, never `motion`.** The app wraps everything in
  `<LazyMotion features={domMax} strict>` (`components/lazy-motion-provider.tsx`);
  `strict` makes `motion.*` throw at runtime, and it keeps the initial bundle at
  ~30kb instead of ~110kb. Scroll reveals use `useInView` + `m.div`.
- Sections are client components (`"use client"`) because of the animations;
  keep anything that doesn't animate on the server.
- Comments and identifiers in English.

## Deploy: Cloudflare Pages

Two constraints that are easy to break:

- `images.unoptimized: true` in `next.config.mjs` — Cloudflare can't run Next's
  image optimizer. Compress and size images before committing them; don't turn
  optimization back on.
- API routes must be edge runtime (`export const runtime = "edge"` in
  `app/api/chat/route.ts`). Node-only APIs will fail the build there.

## Environment

Copy `.env.example` to `.env.local` and fill it in. Without these the site still
renders; only the chatbot fails.

- `GEMINI_API_KEY` — Google AI Studio, model is `gemini-2.5-flash`.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — rate limit (15 req/min
  per IP) and the 1-hour resume PDF cache.
- `GOOGLE_DOC_ID` — Google Doc holding the resume. The route exports it as PDF so
  Gemini reads the certificate images too, so the doc must be publicly readable.

Redis is optional at runtime by design: the rate limiter fails open and both
cache calls are best-effort, so an Upstash outage costs speed, not the chatbot.
Don't "fix" that back into a hard dependency. If the route 500s, resolve the
Upstash host with `dig` before suspecting Gemini — a deleted free-tier database
has caused exactly this once.

Replies take ~60s with the cache cold, because the whole resume PDF (~2.2MB
base64) goes to Gemini on every message. That is the current design, not a bug.

## Current focus

Content updates and performance/SEO. Recent commits were LCP work — check the
build output and Lighthouse before and after anything that touches the hero,
fonts, or above-the-fold images.
