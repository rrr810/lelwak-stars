-- ============================================================================
--  0006 — admin consolidation + analytics cleanup
--
--  The earlier hardening phase created two membership tables (admin_users for
--  is_admin(), admin_members for is_staff()) and two analytics tables
--  (page_views, pageviews). Each admin account ended up in only ONE membership
--  table, so each passed only half the policies. Mirror both accounts into
--  both tables, keep page_views as the single analytics table, and index it.
-- ============================================================================

-- both admin accounts are full members of both membership tables
insert into public.admin_users (id, email)
select m.user_id, a.email
from public.admin_members m
join auth.users a on a.id = m.user_id
where not exists (select 1 from public.admin_users u where u.id = m.user_id)
on conflict (id) do nothing;

insert into public.admin_members (user_id, role)
select u.id, 'owner' from public.admin_users u
where not exists (select 1 from public.admin_members m where m.user_id = u.id)
on conflict (user_id) do nothing;

-- single analytics table
drop policy if exists "pageviews beacon insert" on public.pageviews;
drop policy if exists "pageviews admin select" on public.pageviews;
drop policy if exists "pageviews admin delete" on public.pageviews;
drop table if exists public.pageviews;

create index if not exists page_views_day_idx  on public.page_views (view_day);
create index if not exists page_views_path_idx on public.page_views (path);
create index if not exists inquiries_submitted_idx on public.inquiries (submitted_at desc);

notify pgrst, 'reload schema';
