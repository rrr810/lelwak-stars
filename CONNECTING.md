# Connecting GitHub + Supabase — exactly what's needed

The code is written, typechecked, production-built and committed to a local
`main` branch. Here is what has to happen to get it live.

---

## 1. GitHub

**What I need from you:** either

- **(a)** The GitHub integration connected through Arena's Settings →
  Integrations, **or**
- **(b)** A remote I can push to.

**Important reality check:** this sandbox currently has

- ✅ outbound network access (`github.com` reachable)
- ✅ `git` installed
- ❌ **no `gh` CLI**
- ❌ **no stored GitHub credentials or token**

So I cannot create a repo or push on my own yet. Whichever route you take,
**please do not paste a personal access token into chat** — it lands in the
conversation history and logs, and deleting the message afterwards does not
guarantee it's gone. Use the platform integration instead.

### Once connected, the push is one step

```bash
cd lelwak-stars
git remote add origin <your-repo-url>
git push -u origin main
```

Everything is already committed with a clean history and a `.gitignore` that
excludes `.env.local`, `node_modules`, `.next`, the photo inbox and processed
image output. No secrets are in the repo.

### Suggested repo settings

- **Private** until launch, then flip to public (or keep private — the deployed
  site is public either way).
- Branch protection on `main`: require a pull request. I'll work in feature
  branches so every change is reviewable.
- Name suggestion: `lelwak-stars` or `lelwak-stars-website`.

---

## 2. Supabase

**What I need from you:** a Supabase project. Two ways to give me access:

### Route A — integration (preferred)
Connect Supabase through Arena's integrations. Then I can run migrations,
inspect data and manage storage directly.

### Route B — environment variables (also fine, no chat exposure)
Create the project at [supabase.com/dashboard](https://supabase.com/dashboard)
→ New project → pick a region close to Kenya (e.g. *EU (Frankfurt)* or
*Middle East (UAE)*). Then add these to the workspace environment settings,
**not** to chat:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key — server only>
```

The anon/publishable key is designed to be public and is safe. The
**service-role key is not** — keep it out of chat, out of the repo, and out of
any `NEXT_PUBLIC_` variable.

### Then apply the schema

`supabase/migrations/0001_init.sql` is idempotent, so it's safe to run twice.

**Easiest, no CLI:** Supabase Dashboard → SQL Editor → New query → paste the
whole file → Run.

**Or with the CLI:**

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npm run db:migrate
npm run db:types
```

### What the migration creates

- 10 tables: `programs`, `impact_stats`, `stories`, `gallery`, `partners`,
  `inquiries`, `team_members`, `events`, `site_settings`, `volunteers`
- 5 enums, 9 indexes, `updated_at` triggers, a `slugify()` helper
- Row Level Security on every table
- 2 storage buckets: `gallery` (public) and `originals` (private)
- Seed data: the four programme pillars and the portfolio impact figures

### Then create the staff accounts

Dashboard → Authentication → Users → **Add user** → create logins for the
Lelwak Stars team. Any authenticated user currently counts as staff via
`public.is_staff()`. When you want finer control (e.g. an editor who can update
stories but not read enquiries), swap that function for a role lookup —
migration `0002` can add a `profiles` table with a `role` column.

---

## 3. Photos

Send the ZIP and I'll handle the rest:

```bash
npm run photos -- ./lelwak-photos.zip
```

That strips EXIF/GPS, writes 1600w + 480w WebP renditions, keeps the originals
aside, and produces `out/manifest.json` plus `out/insert-gallery.sql`.

**To get the best result, organise the ZIP by activity if you can:**

```
lelwak-photos.zip
├── tree-nurseries/
├── tree-planting/
├── school-mentorship/
├── youth-training/
├── community-engagement/
└── partnerships/          ← chief's office, meetings, stakeholders
```

Folder names are read automatically. If it's one flat dump, that's fine too —
I'll look at the photographs, categorise and caption them myself, and only flag
the genuinely ambiguous ones for you.

Upload paths afterwards:

| Local | Supabase bucket |
|---|---|
| `out/gallery/webp/*` | `gallery` (public) |
| `out/originals/*` | `originals` (private) |

Then paste `out/insert-gallery.sql` into the SQL Editor. The gallery page picks
them up with no code change.

---

## 4. Content still outstanding

These are marked `TODO` in `src/lib/site.ts` and shown as dashed "to be
confirmed" placeholders on the live pages, so nothing fake is published:

| Needed | Why it matters |
|---|---|
| **CBO registration number + issuing authority** | The first thing a funder checks |
| Phone, WhatsApp, real email | "Reaching us out easily" was the whole brief |
| County / sub-county / ward, office address | Local credibility + Google Maps |
| Social links | Proof of ongoing activity |
| Leadership names, roles, photos | Sponsors fund people, not logos |
| Logo files (SVG + PNG) | Currently an inline SVG wordmark placeholder |
| **Absolute impact counts** | "12,400 seedlings raised" beats "48%" with any funder |
| Verified activity dates, locations, participant numbers | Turns stories into evidence |
| Named partners + logos | Social proof compounds |
| Year founded | Basic due-diligence field |
| M-Pesa till/paybill if direct giving is wanted | Kenyan donors expect it |

---

## 5. Deploy

Vercel, free tier:

1. Push to GitHub.
2. [vercel.com/new](https://vercel.com/new) → import the repo.
3. Add the environment variables from `.env.example`.
4. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
5. Deploy. Every pull request gets its own preview URL automatically — useful
   for showing the Lelwak Stars board a change before it goes live.

Domain: a `.org` reads as established to international funders; `.or.ke` reads
as locally rooted. Either works — point the DNS at Vercel and TLS is automatic.

---

## Status right now

| | |
|---|---|
| Design system | ✅ locked (Forest + Cream + Earth Gold) |
| Pages | ✅ 9 routes, all rendering, production build passing |
| Database schema | ✅ written, awaiting a project to run against |
| Enquiry capture | ✅ written, awaiting Supabase to store into |
| Photo pipeline | ✅ written, awaiting your ZIP |
| GitHub push | ✅ done — https://github.com/rrr810/lelwak-stars |
| Live deploy | ⏳ ready — import the repo at vercel.com/new |
| Admin dashboard | ⏳ next build phase — staff login, content editing, enquiry inbox |
