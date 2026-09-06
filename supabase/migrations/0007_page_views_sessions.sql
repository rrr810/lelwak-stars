-- sessions + viewport for the analytics overview (unique visitors, device mix)
alter table public.page_views add column if not exists session_id uuid;
alter table public.page_views add column if not exists viewport_w integer;
create index if not exists page_views_session_idx on public.page_views (session_id);
notify pgrst, 'reload schema';
