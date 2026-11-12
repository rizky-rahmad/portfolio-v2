# Rizky — Portfolio, AI Assistant & Interactive Demos

Personal portfolio site with an AI assistant that answers visitors' questions
about my background, and working front-end replicas of the products I built —
all running in the browser. Next.js on Cloudflare Pages.

[![Live site](https://img.shields.io/badge/Live%20Site-rizky--portfolio.pages.dev-14b8a6?style=flat-square)](https://rizky-portfolio.pages.dev/)
[![PageSpeed Mobile 98](https://img.shields.io/badge/PageSpeed%20Mobile-98-34d399?style=flat-square)](https://pagespeed.web.dev/analysis/https-rizky-portfolio-pages-dev/3739kdk2w9?form_factor=mobile)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-8b5cf6?style=flat-square)](https://ai.google.dev/)

![The portfolio homepage](docs/preview.jpg)

## Contents

- [Try it](#try-it)
- [An AI assistant that answers from my actual resume](#an-ai-assistant-that-answers-from-my-actual-resume)
- [Performance treated as a measured problem](#performance-treated-as-a-measured-problem)
- [Try the work, not just read about it](#try-the-work-not-just-read-about-it)
- [Resilience where it actually failed](#resilience-where-it-actually-failed)
- [Built with](#built-with)
- [Running it locally](#running-it-locally)
- [Contact](#contact)

## Try it

- **Live site:** [rizky-portfolio.pages.dev](https://rizky-portfolio.pages.dev/)
- **Interactive demos:** [/demos](https://rizky-portfolio.pages.dev/demos) — inbox,
  booking, HR flows, CMS playground, and a live voice call with the agent.
- **Locally:** `npm run dev`, then `npm run demo:audit` checks every demo with
  Playwright and fails on console errors or broken flows.

## What is interesting here

### An AI assistant grounded in approved information

The chatbot uses approved information stored in `content/knowledge.json`. A local index of embeddings selects relevant sections for each visitor question before Gemini writes an answer. When embeddings are unavailable or the index is out of date, the chatbot falls back to all approved information. If a fact is absent, the assistant is instructed to say it does not know.

Update the knowledge file and run `npm run knowledge:index` to regenerate the index. The previous Google Docs synchronization is disabled in this checkout. The index and query embeddings use the Gemini API and may consume quota or incur charges.

### Performance treated as a measured problem

[![PageSpeed Insights scores for the mobile run: Performance 98, Accessibility 100, Best Practices 96, SEO 100, Agentic Browsing 3/3](docs/pagespeed.png)](https://pagespeed.web.dev/analysis/https-rizky-portfolio-pages-dev/3739kdk2w9?form_factor=mobile)

That is the mobile run — LCP 2.3s, CLS 0, Speed Index 1.2s — and the report
behind it is public, so the image links to it. Best Practices sits at 96 because
Cloudflare's own analytics beacon fails with `ERR_BLOCKED_BY_CLIENT`; turning it
off would buy the last four points at the cost of having no analytics at all.

Getting there meant measuring rather than guessing, and being wrong twice. The
chatbot's latency looked like a payload problem — 2.2MB going over the wire per
message — but that transfer turned out to be under 5% of the time. Later, mobile
LCP sat at 3.5s while desktop was already perfect; the cause was not the network
either, but the hero subtitle's own fade-in animation, which starts at
`opacity: 0` and therefore does not count as painted. The metric was waiting on
a CSS animation.

The remaining fixes came from reading the LCP breakdown instead of the summary:
render-blocking stylesheets accounted for most of what was left.

### Try the work, not just read about it

Each featured project has an **Interactive Demo** link that opens a working mock
at `/demos`. These are rebuilt front-end replicas with fictional data — the
production code stays private, but the interactions are the real ones. They are
covered by a Playwright audit (`npm run demo:audit`, needs `npm run dev` on
:3000) that fails on console errors or broken flows.

| Channelflow — AI inbox | PeopleOS — HR overview | Unicorn CMS — page builder |
|---|---|---|
| ![Channelflow AI inbox: agent draft awaiting staff approval](docs/demos-channelflow.jpg) | ![PeopleOS HR overview dashboard with headcount charts](docs/demos-peopleos.jpg) | ![Unicorn CMS visual editor canvas with add palette](docs/demos-unicorn-cms.jpg) |
| Approve an AI draft, watch a sensitive chat hand off to a human. | Two-step leave approvals, shift schedule with GPS clock-in, hiring pipeline. | Click to add blocks, drag to reorder, switch devices, undo anything. |

The one exception is the Voice tab: a live call with the agent over Gemini Live
(single-use token per call, 5 calls per hour per visitor, mic required).

### Resilience where it actually failed

The chatbot once went down completely because its Upstash Redis database had
disappeared, and the rate limiter — a guard rail, not a feature — threw before
Gemini was ever reached. Redis is now optional at runtime: the rate limiter fails
open, and a spent Gemini quota or a busy model falls through to a second model
rather than surfacing as an error.

## Built with

| Layer | Technology | Note |
|---|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript | Path alias `@/*` → repo root |
| UI | Tailwind CSS v4 · shadcn/ui · Framer Motion | `m`, never `motion` (see `components/lazy-motion-provider.tsx`) |
| AI | Gemini over plain REST · Gemini Live for voice | Thinking disabled → replies in ~2s instead of ~6s |
| Data | Upstash Redis | Rate limiting only; optional at runtime by design |
| Hosting | Cloudflare Pages | `images.unoptimized: true`, edge runtime on API routes |

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

| Variable | Used by | Without it |
|---|---|---|
| `GEMINI_API_KEY` | Chat route and semantic index | The chatbot and index generation need the key |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting | Limiter fails open; everything works |

`npm run build` is the check before pushing (TypeScript errors are not ignored).
`npm run knowledge:index` refreshes the semantic index, `npm test` runs the unit tests,
and `npm run demo:audit` (with the dev server running) checks the interactive
demos.

## Contact

- Email: rizky.business7@gmail.com
- [LinkedIn](https://www.linkedin.com/in/rahmad-rizki/) · [GitHub](https://github.com/rizky-rahmad) · [WhatsApp](https://wa.me/6282365434655)
