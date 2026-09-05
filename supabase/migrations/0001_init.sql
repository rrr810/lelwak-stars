-- ============================================================================
--  LELWAK STARS CBO — Initial schema
--  File: supabase/migrations/0001_init.sql
--
--  HOW TO RUN (pick one):
--   a) Supabase Dashboard → SQL Editor → paste this file → Run
--   b) CLI:  supabase db push
--
--  Safe to re-run: every statement is idempotent.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type gallery_category as enum (
    'tree-nurseries',
    'tree-planting',
    'school-mentorship',
    'youth-training',
    'community-engagement',
    'partnerships'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type program_id as enum (
    'tree-nurseries',
    'agripreneurship',
    'school-mentorship',
    'capacity-building'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_type as enum (
    'sponsorship',
    'partnership',
    'grant',
    'volunteer',
    'school',
    'media',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inquiry_status as enum (
    'new',
    'contacted',
    'in-discussion',
    'won',
    'lost',
    'archived'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type partner_tier as enum ('seed', 'grower', 'canopy', 'in-kind');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. CORE TABLES
-- ----------------------------------------------------------------------------

-- The four programme pillars (editable from the admin dashboard)
create table if not exists public.programs (
  id            program_id primary key,
  name          text        not null,
  slug          text        not null unique,
  short_name    text        not null,
  blurb         text        not null default '',
  body          text        not null default '',
  bullets       jsonb       not null default '[]'::jsonb,
  accent_color  text        not null default '#14532D',
  accent_soft   text        not null default '#DDEDDD',
  icon          text        not null default 'leaf',
  hero_image    text,
  partner_ask   text        not null default '',
  sort_order    integer     not null default 0,
  is_published  boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Live impact figures shown on the homepage and /impact
create table if not exists public.impact_stats (
  id            uuid primary key default gen_random_uuid(),
  key           text        not null unique,   -- 'seedlings', 'youth', ...
  label         text        not null,
  value         integer,                        -- absolute count (preferred)
  percent       numeric(5,2),                   -- fallback: portfolio %
  suffix        text        not null default '',
  note          text        not null default '',
  target_value  integer,                        -- enables a progress bar
  sort_order    integer     not null default 0,
  is_published  boolean     not null default true,
  as_of         date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Community activity stories — the sponsor-facing proof of work
create table if not exists public.stories (
  id              uuid primary key default gen_random_uuid(),
  title           text        not null,
  slug            text        not null unique,
  excerpt         text        not null default '',
  body            text        not null default '',   -- markdown
  program         program_id  references public.programs(id) on delete set null,
  location        text,
  activity_date   date,
  cover_image     text,
  people_reached  integer,
  challenge       text        not null default '',   -- the problem
  action          text        not null default '',   -- what we did
  outcome         text        not null default '',   -- who benefited / result
  next_need       text        not null default '',   -- the ask
  is_featured     boolean     not null default false,
  is_published    boolean     not null default true,
  published_at    timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- The photo library. Every image belongs to a category and optionally a story.
create table if not exists public.gallery (
  id            uuid primary key default gen_random_uuid(),
  story_id      uuid references public.stories(id) on delete set null,
  category      gallery_category not null,
  title         text        not null default '',
  caption       text        not null default '',
  location      text,
  shot_on       date,
  -- storage paths relative to the `gallery` bucket
  path_full     text        not null,   -- 1600w webp
  path_thumb    text        not null,   -- 480w  webp
  path_original text,                   -- untouched original (private)
  width         integer,
  height        integer,
  alt           text        not null default '',   -- accessibility + SEO
  credit        text,
  dominant_color text,      -- used for the blur-up placeholder
  is_featured   boolean     not null default false,
  is_published  boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Organisations / individuals who support Lelwak Stars
create table if not exists public.partners (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  slug          text        not null unique,
  tier          partner_tier not null default 'seed',
  logo_path     text,
  website       text,
  description   text        not null default '',
  contribution  text,          -- "Funded 3 nursery beds in 2025"
  period_start  date,
  period_end    date,
  is_published  boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Every contact / partner / volunteer / school form submission
create table if not exists public.inquiries (
  id             uuid primary key default gen_random_uuid(),
  inquiry_type   inquiry_type   not null default 'other',
  name           text           not null,
  email          text           not null,
  phone          text,
  organisation   text,
  role           text,
  country        text,
  message        text           not null,
  budget_range   text,
  -- anti-spam: honeypot + timestamp, validated server-side
  hp             text,
  submitted_at   timestamptz    not null default now(),
  user_agent     text,
  ip_hash        text,          -- hashed, never raw — privacy + rate limiting
  status         inquiry_status not null default 'new',
  is_priority    boolean        not null default false,
  notes          text,
  handled_by     uuid,
  handled_at     timestamptz,
  created_at     timestamptz    not null default now()
);

-- Team members / leadership shown on /about
create table if not exists public.team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  role          text        not null,
  bio           text        not null default '',
  photo_path    text,
  sort_order    integer     not null default 0,
  is_published  boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- Upcoming activities / planting days / trainings
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  title         text        not null,
  slug          text        not null unique,
  description   text        not null default '',
  program       program_id  references public.programs(id) on delete set null,
  location      text,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  cover_image   text,
  spots         integer,
  is_published  boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- Site-wide settings edited from the admin dashboard (single row, id = 1)
create table if not exists public.site_settings (
  id             smallint primary key default 1 check (id = 1),
  contact_email  text,
  contact_phone  text,
  whatsapp       text,
  facebook       text,
  instagram      text,
  x_twitter      text,
  linkedin       text,
  youtube        text,
  tiktok         text,
  address_line   text,
  region         text,
  registration_no text,
  issued_by      text,
  year_founded   integer,
  hero_image     text,
  hero_heading   text,
  hero_sub       text,
  donation_link  text,
  mpesa_till     text,
  updated_at     timestamptz not null default now()
);

-- Volunteer sign-ups
create table if not exists public.volunteers (
  id            uuid primary key default gen_random_uuid(),
  name          text        not null,
  email         text        not null,
  phone         text,
  location      text,
  interests     jsonb       not null default '[]'::jsonb,
  availability  text,
  message       text,
  status        inquiry_status not null default 'new',
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES (what the public site actually queries)
-- ----------------------------------------------------------------------------
create index if not exists stories_published_idx
  on public.stories (published_at desc) where is_published;
create index if not exists stories_program_idx
  on public.stories (program) where is_published;
create index if not exists stories_featured_idx
  on public.stories (is_featured) where is_published and is_featured;
create index if not exists gallery_category_idx
  on public.gallery (category, sort_order) where is_published;
create index if not exists gallery_story_idx
  on public.gallery (story_id) where is_published;
create index if not exists gallery_featured_idx
  on public.gallery (sort_order) where is_published and is_featured;
create index if not exists inquiries_status_idx
  on public.inquiries (status, submitted_at desc);
create index if not exists partners_tier_idx
  on public.partners (tier, sort_order) where is_published;
create index if not exists events_upcoming_idx
  on public.events (starts_at) where is_published;

-- ----------------------------------------------------------------------------
-- 4. updated_at TRIGGER
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['programs','impact_stats','stories','gallery','partners','inquiries','site_settings']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_updated_at', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_updated_at', t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 5. SLUG HELPER
-- ----------------------------------------------------------------------------
create or replace function public.slugify(input text)
returns text language sql immutable as $$
  select trim(both '-' from
    regexp_replace(
      regexp_replace(lower(coalesce(input,'')), '[^a-z0-9]+', '-', 'g'),
      '-{2,}', '-', 'g'
    )
  );
$$;

-- ----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY
--    Public site = read published content only.
--    Writes = authenticated staff only.
-- ----------------------------------------------------------------------------
alter table public.programs       enable row level security;
alter table public.impact_stats   enable row level security;
alter table public.stories        enable row level security;
alter table public.gallery        enable row level security;
alter table public.partners       enable row level security;
alter table public.inquiries      enable row level security;
alter table public.team_members   enable row level security;
alter table public.events         enable row level security;
alter table public.site_settings  enable row level security;
alter table public.volunteers     enable row level security;

-- ---- READ: anyone can see published content ----
drop policy if exists "public read programs" on public.programs;
create policy "public read programs" on public.programs
  for select using (is_published = true);

drop policy if exists "public read impact_stats" on public.impact_stats;
create policy "public read impact_stats" on public.impact_stats
  for select using (is_published = true);

drop policy if exists "public read stories" on public.stories;
create policy "public read stories" on public.stories
  for select using (is_published = true);

drop policy if exists "public read gallery" on public.gallery;
create policy "public read gallery" on public.gallery
  for select using (is_published = true);

drop policy if exists "public read partners" on public.partners;
create policy "public read partners" on public.partners
  for select using (is_published = true);

drop policy if exists "public read team" on public.team_members;
create policy "public read team" on public.team_members
  for select using (is_published = true);

drop policy if exists "public read events" on public.events;
create policy "public read events" on public.events
  for select using (is_published = true);

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select using (true);

-- ---- INSERT: anonymous visitors may submit an inquiry / volunteer ----
-- (hp honeypot must be empty; server action double-checks + rate limits)
drop policy if exists "public insert inquiries" on public.inquiries;
create policy "public insert inquiries" on public.inquiries
  for insert with check (hp is null or hp = '');

drop policy if exists "public insert volunteers" on public.volunteers;
create policy "public insert volunteers" on public.volunteers
  for insert with check (true);

-- ---- NO public read/update/delete on inquiries or volunteers ----
-- Deliberately absent: submissions are private by default.
-- Staff read them through the service-role client or the authenticated policies below.

-- ---- STAFF: full control for authenticated users ----
-- Replace `is_staff()` with your own check later (e.g. a `profiles.role`
-- table or an auth.jwt() claim). For now: any authenticated user in this
-- project = staff, because only your team has accounts.
create or replace function public.is_staff()
returns boolean language sql stable as $$
  select auth.role() = 'authenticated'
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'programs','impact_stats','stories','gallery','partners',
    'inquiries','team_members','events','site_settings','volunteers'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', 'staff all ' || t, t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      'staff all ' || t, t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- 7. STORAGE BUCKETS
--    `gallery`   — public, optimised WebP images the site serves
--    `originals` — private, untouched camera files (backup / re-processing)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 5242880, array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('originals', 'originals', false, 52428800)
on conflict (id) do nothing;

-- public read of the gallery bucket
drop policy if exists "public read gallery files" on storage.objects;
create policy "public read gallery files" on storage.objects
  for select using (bucket_id = 'gallery');

-- staff manage gallery + originals
drop policy if exists "staff manage gallery files" on storage.objects;
create policy "staff manage gallery files" on storage.objects
  for all to authenticated
  using (bucket_id in ('gallery','originals') and public.is_staff())
  with check (bucket_id in ('gallery','originals') and public.is_staff());

-- ----------------------------------------------------------------------------
-- 8. IMAGE URL HELPER
-- ----------------------------------------------------------------------------
create or replace function public.gallery_url(g public.gallery, kind text default 'full')
returns text language sql stable as $$
  select case
    when kind = 'thumb' then
      (select public_url from storage.buckets where id = 'gallery') || '/' || g.path_thumb
    else
      (select public_url from storage.buckets where id = 'gallery') || '/' || g.path_full
  end;
$$;

-- ----------------------------------------------------------------------------
-- 9. SEED — programme pillars + portfolio impact figures
--    Real values from `src/lib/site.ts`. Edit freely afterwards.
-- ----------------------------------------------------------------------------
insert into public.programs
  (id, name, slug, short_name, blurb, bullets, accent_color, accent_soft, icon, partner_ask, sort_order)
values
  ('tree-nurseries', 'Tree Nurseries & Reforestation', 'tree-nurseries', 'Tree Nurseries',
   'We establish and manage community tree nurseries that raise indigenous and fruit seedlings, restoring degraded land and increasing local tree cover.',
   '["Community-run seedling beds and nursery management","Indigenous, fruit and fodder species selection","Planting campaigns with schools and local administration","Seedling survival monitoring after planting"]'::jsonb,
   '#14532D', '#DDEDDD', 'leaf',
   'Sponsor a nursery bed, polythene seedling bags, shade netting, watering equipment or a planting campaign.', 1),

  ('agripreneurship', 'Agripreneurship Empowerment', 'agripreneurship', 'Agripreneurship',
   'We train young people to treat agriculture as a business — building green livelihoods and self-sustaining income from the land around them.',
   '["Agribusiness skills and record keeping","Value addition and market linkages","Climate-smart farming practice","Youth enterprise mentorship and start-up support"]'::jsonb,
   '#D89B32', '#FBF0DA', 'sprout',
   'Fund a training cohort, toolkits and inputs, or connect our youth agripreneurs to markets.', 2),

  ('school-mentorship', 'School Mentorship & Education', 'school-mentorship', 'School Mentorship',
   'We visit schools to mentor learners on environmental stewardship, personal responsibility, discipline and leadership.',
   '["In-school mentorship sessions and talks","Environmental clubs and tree planting at schools","Leadership, discipline and life-skills coaching","Career guidance for senior learners"]'::jsonb,
   '#123047', '#DCE7EF', 'book',
   'Adopt a school for a term, sponsor mentorship materials, or send your staff as guest mentors.', 3),

  ('capacity-building', 'Capacity Building', 'capacity-building', 'Capacity Building',
   'We equip local youth and community members with practical leadership, organisational and technical skills.',
   '["Leadership and governance training","Project planning, monitoring and reporting","Practical vocational and agri skills","Community sensitisation and mobilisation"]'::jsonb,
   '#C2603F', '#F7E4DC', 'users',
   'Support facilitator training, venue and materials, or co-design a curriculum with us.', 4)
on conflict (id) do nothing;

insert into public.impact_stats (key, label, percent, note, sort_order) values
  ('seedlings', 'Tree seedlings grown',                   48, 'Raised in our community nurseries',        1),
  ('youth',     'Youth trained',                          45, 'Agripreneurship & practical skills',       2),
  ('students',  'Students mentored',                      42, 'Across schools we have visited',           3),
  ('community', 'Community education',                    39, 'Barazas, campaigns & sensitisation',       4),
  ('air',       'Air pollution & environmental awareness',36, 'Focused awareness raising',                5)
on conflict (key) do nothing;

insert into public.site_settings (id, contact_email, region)
values (1, 'info@lelwakstars.org', 'Kenya')
on conflict (id) do nothing;

-- ============================================================================
--  DONE. Next: create the staff auth users in Dashboard → Authentication,
--  then run 0002_rls_profiles.sql if you want role-based staff permissions.
-- ============================================================================
