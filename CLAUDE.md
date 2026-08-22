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
- `.npmrc` sets `legacy-peer-deps=true` and deploys need it. The build command
  is `npx @cloudflare/next-on-pages@1`, whose last release (Sep 2025) pins
  `@cloudflare/workers-types@^4` while every current wrangler requires `^5`;
  without the flag npm refuses to install the tool and the build dies before it
  reads the project. Cloudflare deprecated next-on-pages in favour of the
  OpenNext adapter, so this is a stay of execution, not a fix.

## The chatbot

Visitors ask questions; `app/api/chat/route.ts` answers them from
`content/resume.json` — a Markdown transcription of Rizky's Google Doc resume,
including everything written inside the scanned certificate images.

**The resume is transcribed when the document changes, never per request.**
Sending the PDF to Gemini on every message used to cost ~40s a reply for a
reading that came out the same every time. `scripts/sync-resume.mjs` downloads
the doc, hashes it, and re-transcribes only on a change; the hourly GitHub
Actions job in `.github/workflows/sync-resume.yml` runs it and commits the
result. Rizky updates the resume by pasting into the Google Doc — that stays
his only manual step. To force a sync now, use the workflow's *Run workflow*
button, or run `npm run resume:sync` locally.

Two constraints worth keeping in mind before changing this route:

- **Free-tier Gemini quota is per project PER MODEL, and it is small** —
  measured at 20 requests/day for `gemini-2.5-flash`. `MODELS` lists two models
  precisely so a spent quota falls through to a second bucket instead of taking
  the chatbot offline until midnight. Note the app's own rate limit (15/min per
  IP) is far looser than the daily ceiling, so one visitor can still exhaust a
  day.
- **Redis is optional at runtime by design.** The rate limiter fails open, so an
  Upstash outage costs the rate limit, not the chatbot. Don't turn that back
  into a hard dependency — a deleted free-tier database took the whole chatbot
  down once. If the route 500s, resolve the Upstash host with `dig` before
  suspecting Gemini.

Gemini is called over plain REST, not `@google/generative-ai`. That SDK is
end-of-life and has no `thinkingConfig`, and disabling thinking is what makes
replies land in ~2s instead of ~6s.

## Environment

Copy `.env.example` to `.env.local` and fill it in. Without these the site still
renders; only the chatbot fails.

- `GEMINI_API_KEY` — from Google AI Studio. Used by the route and by the sync
  script; CI needs it as a repository secret too.
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — rate limiting only.
- `GOOGLE_DOC_ID` — the resume doc, which must stay publicly readable. Only
  `scripts/sync-resume.mjs` reads it; the request path never touches Google Docs.

## Performance constraints

Mobile PageSpeed is 98/100/96/100 with LCP 2.3s. Three things hold it there and
are easy to undo by accident:

- **The hero heading and subtitle use `.animate-rise`, not `.animate-fade-up`.**
  The subtitle is the measured LCP element, and `fade-up` starts at `opacity: 0`
  with `animation-fill-mode: both`, which disqualifies it until the animation
  starts. `.animate-rise` moves without ever hiding. Never put an opacity fade,
  or an `animationDelay`, on an above-the-fold text element.
- **`experimental.inlineCss` is on.** The stylesheets were render-blocking for
  ~750ms and the LCP breakdown was almost all "element render delay" waiting on
  them. Inlining halved first paint (1064ms -> 508ms measured locally).
- **The chatbot waits for `requestIdleCallback`.** Mounting it right after
  hydration put its chunk on the wire during first paint and cost ~700ms.

Measure before and after anything touching the hero, fonts, or above-the-fold
images. A local production build plus a throttled Playwright profile is enough
to see a regression; PageSpeed varies by several hundred ms between runs, so
compare medians, not single runs.

The one remaining Best Practices deduction is Cloudflare's own Web Analytics
beacon (`cloudflareinsights.com/cdn-cgi/rum`) failing with
`ERR_BLOCKED_BY_CLIENT`. It is not our code; turning Web Analytics off in the
Cloudflare dashboard would make it 100 at the cost of losing analytics.

## Current focus

Content updates and performance/SEO. Recent commits were LCP work — check the
build output and Lighthouse before and after anything that touches the hero,
fonts, or above-the-fold images.
