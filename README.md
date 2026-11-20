# ResCommand Marketing Website

The marketing site for **ResCommand** — one app for restaurant scheduling, inventory, recipes, prep, and compliance, built for small restaurants and priced for them, too.

Built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**, using the Scramblers Golf dark/moody aesthetic (navy `#010D17` + sky blue `#6BB3DE`).

## Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + CSS custom properties (design tokens) |
| Fonts | Fraunces (display) + Hanken Grotesk (body) via `next/font` |
| Icons | lucide-react |
| Blog | MDX files in `content/blog` (`gray-matter` + `next-mdx-remote`) |
| Forms | React Hook Form + Zod |
| Analytics | Vercel Web Analytics + Google Analytics 4 (optional) |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values as needed
npm run dev                  # http://localhost:3000
```

### Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

```
app/                 App Router pages (home, features, pricing, demo, blog, about, help, privacy, terms)
  api/demo/          Demo booking endpoint (Zod-validated)
  sitemap.ts         Dynamic sitemap   robots.ts   manifest.ts   icon.svg
components/
  layout/            Header, Footer, Logo
  ui/                Button, Card, Badge, Section, Accordion, form fields, YouTubeEmbed, …
  home/              Homepage sections (Hero, Problem, Solution, Features, Video, Testimonials, Pricing)
  features/  pricing/  blog/  demo/  seo/
content/blog/        5 MDX blog posts (frontmatter + body)
lib/                 constants, content data, blog helpers, utils, analytics, demo schema
styles/              globals.css + theme.css (design tokens)
```

## Pages

`/` · `/features` · `/pricing` · `/demo` · `/blog` · `/blog/[slug]` · `/about` · `/help` · `/privacy` · `/terms`

## Configuration

All integrations are optional and driven by environment variables (see `.env.example`):

- **`NEXT_PUBLIC_GA_ID`** — Google Analytics 4 (no-ops when unset).
- **`NEXT_PUBLIC_CALENDLY_URL`** — when set, the demo page swaps the custom form for an inline Calendly embed.
- **`NEXT_PUBLIC_YOUTUBE_DEMO_ID` / `NEXT_PUBLIC_YOUTUBE_WALKTHROUGH_ID`** — YouTube video IDs for the homepage and `/demo` embeds. When unset, those pages play the self-hosted demo in `public/videos/`.
- **`RESEND_API_KEY` / `DEMO_NOTIFY_EMAIL`** — wire up booking confirmation + notification emails in `app/api/demo/route.ts` (currently stubbed; the form flow works without them).

## Blog

Add a `.mdx` file to `content/blog/` with frontmatter:

```yaml
---
title: "Post title"
excerpt: "One-line summary"
author: "ResCommand Team"
date: "2025-06-01"
category: "Operations"   # Scheduling | Food Cost | Compliance | Operations
readTime: "5"
featured: false
---
```

Routes, the sitemap, and category filters pick it up automatically.

## Deployment

Designed for **Vercel**: connect the GitHub repo, set environment variables, and deploys run on every push to `main`. Vercel Web Analytics works out of the box.

## SEO

Per-page metadata via `generateMetadata`, Open Graph + Twitter cards, JSON-LD (Organization, SoftwareApplication, FAQPage, Article), dynamic `sitemap.xml`, and `robots.txt`.

---

ResCommand is built by [Venturio Studios](https://venturiostudios.com).
