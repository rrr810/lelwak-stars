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
| `supabase/migrations/0001_init.sql` | Schema: 10 tables, enums, indexes, RLS, storage buckets, seed data |
| `supabase/migrations/0002_private_submissions.sql` | Explicit deny-all SELECT + no update/delete for anon on enquiries |
| `supabase/migrations/0003_column_grants.sql` | Column-level INSERT grants — blocks anonymous mass assignment |
| `supabase/migrations/0004_grant_audit_columns.sql` | Allows the server-set `user_agent` / `ip_hash` audit columns |
| `supabase/migrations/0005_derive_priority.sql` | BEFORE INSERT trigger derives `is_priority`, pins `status` |
| `scripts/process-photos.mjs` | Photo pipeline: unzip → strip EXIF → WebP renditions → manifest + SQL |
| `scripts/e2e-form.mjs` | Playwright end-to-end test of the partner enquiry form → Supabase |

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

### Two Postgres/PostgREST gotchas this schema works around

Both were found by testing, and both are documented in the migrations so nobody
re-introduces them.

**1. `INSERT ... RETURNING` needs SELECT privilege under RLS.**
PostgREST emits `RETURNING` whenever a client asks for the row back — in
supabase-js that is `.insert(x).select()`. An anonymous caller with an INSERT
policy but no SELECT policy is rejected with `42501` even though the write
itself is permitted. So: **never chain `.select()` after a public insert.**
Insert fire-and-forget, then confirm with the service-role client if needed.

**2. A `WITH CHECK` expression constrains the row, not the column set.**
The original public INSERT policy only validated the `hp` honeypot column,
which left every *other* column writable — an anonymous caller hitting the REST
API directly could set `status: "won"` or `is_priority: true` on their own
enquiry. Migration 0003 closes this with column-level GRANTs, and 0005 moves
the priority rule into a BEFORE INSERT trigger so neither application code nor
a public caller can forge an enquiry's place in the pipeline.

Also note: after any `GRANT` or trigger change, PostgREST's schema cache must
be reloaded or the old permissions keep being enforced:

```sql
notify pgrst, 'reload schema';
```

### Applying the schema

Run the migrations **in order** — 0002 through 0005 fix issues found while
testing 0001 against a live project.

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
npm run e2e:form    # Playwright end-to-end test of the enquiry form
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

### GitHub Pages (live now)

Every push to `main` triggers `.github/workflows/deploy-pages.yml`, which
builds a fully static export (`output: "export"`) and publishes it to

    https://rrr810.github.io/lelwak-stars/

The workflow carries only the **public** Supabase URL and anon key — safe by
design. The service-role key is never in the repo or the workflow.

Because project sites live under a sub-path, the build sets
`NEXT_PUBLIC_BASE_PATH=/lelwak-stars`; `asset()` in `src/lib/site.ts` prefixes
raw `<img src>` values so images resolve there. Locally, run plain
`npm run dev` with no base path.

Static export has no server, so the enquiry form submits from the browser
through the anon key. That is safe because the database is the authority:
column grants limit what anon may write, the honeypot `WITH CHECK` rejects
filled traps, and the BEFORE INSERT trigger pins `status` and derives
`is_priority`.

### Vercel (optional, later)

For the staff admin dashboard — which needs real server code — import the same
repo at [vercel.com/new](https://vercel.com/new), add the variables from
`.env.example`, and deploy with `NEXT_PUBLIC_BASE_PATH` left empty. Pull
requests get their own preview URLs automatically.


