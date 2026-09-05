# Lelwak Stars CBO — Website

> Youth-led. Community-rooted. Growing greener futures.

A sponsor-facing website and impact platform for **Lelwak Stars Community Based
Organisation** — built to attract sponsors and partners, showcase real field
activity, and make it easy for people to reach out.

Built with **Next.js 16 (App Router, Turbopack)** · **Tailwind CSS v4** ·
**Supabase** (Postgres + Auth + Storage) · **TypeScript**.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then fill in your Supabase keys
npm run dev                    # http://localhost:3000
```

The site runs **without** Supabase configured — it falls back to the seed
content in `src/lib/site.ts` so you can preview and review the design first.

---

## What's here

| Path | Purpose |
|---|---|
| `src/app/(site)/` | Public website pages (home, about, programs, impact, stories, gallery, partners, partner-with-us, contact) |
| `src/app/actions/inquiry.ts` | Server action that writes partner/sponsor enquiries to Supabase with honeypot + rate limiting |
| `src/components/` | Header, Footer, GalleryGrid (filterable lightbox), InquiryForm, homepage sections |
| `src/lib/site.ts` | **Single source of truth for copy, programmes, stats, tiers, nav.** Edit content here. |
| `src/lib/gallery.ts` | Data access layer — Supabase queries with graceful fallback |
| `src/lib/supabase/` | `client.ts` (browser), `server.ts` (SSR), `admin.ts` (service role, server-only) |
| `src/lib/database.types.ts` | Typed Supabase schema |
| `supabase/migrations/0001_init.sql` | Full database schema, RLS policies, storage buckets, seed data |
| `scripts/process-photos.mjs` | Photo pipeline: unzip → strip EXIF → WebP renditions → manifest + SQL |

---

## Design system

Brand tokens live in `src/app/globals.css` under `@theme`.

| Token | Hex | Use |
|---|---|---|
| `forest-800` | `#14532D` | Primary brand — header, buttons, key sections |
| `leaf-500` | `#22C55E` | Accent — CTAs, highlights, progress bars |
| `navy-700` | `#123047` | Headings, body text, dark sections |
| `cream-200` | `#F7F5ED` | Page background |
| `gold-500` | `#D89B32` | Statistics, partnership highlights |
| `sage-200` | `#DDEBDD` | Card and section backgrounds |
| `clay-500` | `#C2603F` | Capacity-building pillar accent |

Typography: **Manrope** (display) + **Inter** (body), loaded via `next/font`.

---

## Database

Ten tables, all with Row Level Security:

```
programs          the four pillars, editable from the admin dashboard
impact_stats      live figures for the homepage + /impact
stories           activity stories (challenge → action → outcome → next need)
gallery           the photo library, tagged by category and linked to stories
partners          organisations and individuals who support the work
inquiries         every form submission — PRIVATE, no public read policy
team_members      leadership shown on /about
events            upcoming planting days, trainings, visits
site_settings     contact details, socials, hero copy — one row
volunteers        volunteer sign-ups
```

**Security model**

- Public visitors: `SELECT` on published content only.
- Anonymous visitors: `INSERT` on `inquiries` / `volunteers` only — never read.
- Authenticated staff: full control via `public.is_staff()`.
- Storage: `gallery` bucket is public (optimised WebP), `originals` is private.

### Applying the schema

**Option A — Dashboard (no CLI):** Supabase Dashboard → SQL Editor → paste
`supabase/migrations/0001_init.sql` → Run. It's idempotent, safe to re-run.

**Option B — CLI:**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npm run db:migrate
npm run db:types     # regenerate src/lib/database.types.ts
```

---

## Photo pipeline

```bash
# point it at a zip or a folder of photos
npm run photos -- ./lelwak-photos.zip

# or force a category on the whole batch
npm run photos -- ./photos --category school-mentorship

# tune compression
npm run photos -- ./photos --quality 82 --width 1800
```

It produces:

```
out/gallery/webp/<slug>-1600.webp   ← upload to public  "gallery"   bucket
out/gallery/webp/<slug>-480.webp    ← upload to public  "gallery"   bucket
out/originals/<slug>.jpg            ← upload to private "originals" bucket
out/manifest.json                   ← metadata + compression report
out/insert-gallery.sql              ← paste into the Supabase SQL Editor
```

Every photo has **EXIF and GPS stripped** (important — many shots include
schoolchildren), is resized rather than upscaled, and lands as WebP at ~78
quality. A 1.2 GB phone archive typically becomes ~35 MB.

Photos are auto-categorised by folder name or filename keywords. Anything it
can't place confidently is inserted **unpublished** with `needs_review` so no
photo is ever mislabelled silently.

Valid categories: `tree-nurseries`, `tree-planting`, `school-mentorship`,
`youth-training`, `community-engagement`, `partnerships`.

---

## Environment variables

See `.env.example`. Only two are required for the public site:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` is **server-only** — needed for the admin
dashboard and enquiry notifications. Never prefix it with `NEXT_PUBLIC_`,
never import `src/lib/supabase/admin.ts` from a client component, never commit
it.

---

## Scripts

```bash
npm run dev         # local dev server
npm run build       # production build
npm run start       # serve the production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run photos      # photo pipeline
npm run db:migrate  # supabase db push
npm run db:types    # regenerate database types
```

---

## Content still needed from Lelwak Stars

Marked `TODO` throughout `src/lib/site.ts`:

- [ ] County / sub-county / ward and office address
- [ ] Phone number and WhatsApp line
- [ ] Real email address (currently a placeholder)
- [ ] Facebook, Instagram, X, LinkedIn, YouTube, TikTok links
- [ ] **CBO registration certificate number and issuing authority** — sponsors ask for this first
- [ ] Year founded
- [ ] Leadership / team names and roles with photos
- [ ] Logo files (SVG + PNG)
- [ ] **Absolute impact counts** to replace the portfolio percentages (e.g. "12,400 seedlings raised" rather than "48%")
- [ ] Verified activity records: dates, locations, participant numbers
- [ ] The photo archive
- [ ] Named partners and their logos
- [ ] M-Pesa till / paybill or donation link if direct giving is wanted

---

## Deployment

Vercel is the natural home for a Next.js app — free tier, automatic preview
deploys per pull request, and edge caching for the photo-heavy pages.

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
5. Deploy.

For a `.org`/`.ke` domain, point an `A` record at Vercel or use their
nameservers — they handle TLS automatically.
