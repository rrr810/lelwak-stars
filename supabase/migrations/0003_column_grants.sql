-- ============================================================================
--  0003 — column-level INSERT grants: stop anonymous mass assignment
--
--  THE BUG THIS FIXES (found by testing, not assumed)
--  --------------------------------------------------
--  Migration 0001 gave anon/authenticated full table-level INSERT, and the RLS
--  policy only constrained the `hp` honeypot column. A WITH CHECK expression
--  restricts the ROW, not the SET OF COLUMNS a writer may supply. So anyone
--  calling the REST API directly — bypassing our form entirely — could POST:
--
--      { "name": "...", "message": "...", "status": "won",
--        "is_priority": true, "notes": "approved by me" }
--
--  and the row would be accepted with a fabricated pipeline status. Verified:
--  an anonymous request set its own status to 'won' and it stored.
--
--  THE FIX
--  -------
--  Revoke table-level INSERT from anon and re-grant it per column. Postgres
--  then rejects any insert that names a column the role can't write — before
--  RLS is even consulted. Columns with defaults (status, submitted_at) still
--  populate normally because the writer simply isn't allowed to mention them.
--
--  Deliberately NOT writable by anon:
--    status, is_priority, notes, handled_by, handled_at   (our pipeline state)
--    user_agent, ip_hash                                  (set server-side only)
--    id, submitted_at, created_at                         (defaults)
--
--  Safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------- inquiries
revoke insert on public.inquiries from anon, authenticated;

grant insert (
  inquiry_type,
  name,
  email,
  phone,
  organisation,
  role,
  country,
  message,
  budget_range,
  hp
) on public.inquiries to anon, authenticated;

-- ---------------------------------------------------------------- volunteers
revoke insert on public.volunteers from anon, authenticated;

grant insert (
  name,
  email,
  phone,
  location,
  interests,
  availability,
  message
) on public.volunteers to anon, authenticated;

-- ---------------------------------------------------------------- read access
-- Staff need to read submissions. service_role bypasses RLS and holds full
-- grants already; authenticated staff go through the service-role client in
-- src/lib/supabase/admin.ts, so no extra grants are needed here. We explicitly
-- make sure anon has NO select on the private tables (0002 added the deny
-- policies; this removes the table-level privilege underneath them too).
revoke select, update, delete, truncate, references, trigger
  on public.inquiries  from anon;
revoke select, update, delete, truncate, references, trigger
  on public.volunteers from anon;

-- ---------------------------------------------------------------- audit trail
-- Record who can write what, so this is verifiable rather than assumed.
comment on table public.inquiries is
  'Partner/sponsor/volunteer enquiries. Anonymous INSERT is column-restricted '
  '(see migration 0003): status, is_priority, notes, handled_by, handled_at, '
  'user_agent and ip_hash cannot be supplied by a public caller. Never '
  'chain .select() after an anonymous insert — RETURNING needs SELECT '
  'privilege under RLS and will be rejected.';

comment on table public.volunteers is
  'Volunteer sign-ups. Anonymous INSERT is column-restricted (migration 0003): '
  'status cannot be supplied by a public caller.';
