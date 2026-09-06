-- ============================================================================
--  0009 — self-serve gallery categories
--
--  gallery.category was a Postgres ENUM, so adding a category needed a
--  database migration (developer action). Owners asked to add categories
--  themselves from the dashboard, so:
--    * new table public.gallery_categories (id slug, label, sort_order)
--    * gallery.category becomes plain TEXT with an FK to that table
--    * anon can READ categories (public filter chips), staff can manage them
--  Existing enum values are carried over as the seed rows.
-- ============================================================================

create table if not exists public.gallery_categories (
  id         text primary key,
  label      text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.gallery_categories (id, label, sort_order) values
  ('tree-nurseries',       'Tree nurseries',       1),
  ('tree-planting',        'Tree planting',        2),
  ('school-mentorship',    'School mentorship',    3),
  ('youth-training',       'Youth training',       4),
  ('community-engagement', 'Community engagement', 5),
  ('partnerships',         'Partnerships',         6)
on conflict (id) do nothing;

alter table public.gallery
  alter column category type text using category::text,
  alter column category set not null;

alter table public.gallery
  add constraint gallery_category_fk
  foreign key (category) references public.gallery_categories (id)
  on update cascade on delete restrict;

-- RLS ----------------------------------------------------------------------
alter table public.gallery_categories enable row level security;

drop policy if exists "anon read categories" on public.gallery_categories;
create policy "anon read categories" on public.gallery_categories
  for select using (true);

drop policy if exists "staff manage categories" on public.gallery_categories;
create policy "staff manage categories" on public.gallery_categories
  for all using (is_staff()) with check (is_staff());

-- the old enum is now dead weight
drop type if exists public.gallery_category;
