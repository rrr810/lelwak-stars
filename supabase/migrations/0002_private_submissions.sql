-- ============================================================================
--  0002 — explicit deny-all SELECT on the private submission tables
--
--  WHY THIS EXISTS
--  ---------------
--  `inquiries` and `volunteers` deliberately have no public SELECT policy, so
--  anonymous visitors already get an empty result set. That is correct, but it
--  is *implicit*: it relies on the absence of a policy rather than stating the
--  intent. An explicit deny-all policy documents the decision and protects it
--  against someone later adding a broad `to public` policy by accident.
--
--  RELATED BEHAVIOUR WORTH KNOWING (found by testing, not assumed):
--  PostgREST issues `INSERT ... RETURNING` whenever a client requests the row
--  back (supabase-js `.insert(x).select()`, or REST `Prefer:
--  return=representation`). Under RLS, RETURNING requires SELECT privilege on
--  the table — so an anonymous insert that asks for its own row back is
--  rejected with 42501 even when the INSERT policy permits the write.
--
--  Consequence for application code: when inserting public submissions, do NOT
--  chain `.select()`. Insert fire-and-forget, then confirm separately with the
--  service-role client if you need the created row.
--  See src/app/actions/inquiry.ts — it inserts without `.select()`.
--
--  Safe to re-run.
-- ============================================================================

drop policy if exists "deny public select inquiries" on public.inquiries;
create policy "deny public select inquiries"
  on public.inquiries
  for select
  to anon
  using (false);

drop policy if exists "deny public select volunteers" on public.volunteers;
create policy "deny public select volunteers"
  on public.volunteers
  for select
  to anon
  using (false);

-- Belt and braces: anonymous visitors should never update or delete anything.
-- These are already blocked by the absence of permissive policies, but an
-- explicit RESTRICTIVE policy makes the intent unmistakable and survives
-- someone later adding a permissive one.
drop policy if exists "deny anon write inquiries" on public.inquiries;
create policy "deny anon write inquiries"
  on public.inquiries
  as restrictive
  for all
  to anon
  using (false)
  with check (false);

-- Note: a RESTRICTIVE policy is ANDed with permissive ones. The public INSERT
-- policy for enquiries is addressed `to public`, which includes anon, so the
-- restrictive policy above would block legitimate submissions. Therefore we
-- scope the anonymous INSERT allowance explicitly and keep the restrictive
-- policy limited to UPDATE/DELETE by re-declaring INSERT for anon.
drop policy if exists "deny anon write inquiries" on public.inquiries;

drop policy if exists "deny anon update inquiries" on public.inquiries;
create policy "deny anon update inquiries"
  on public.inquiries
  as restrictive
  for update
  to anon
  using (false)
  with check (false);

drop policy if exists "deny anon delete inquiries" on public.inquiries;
create policy "deny anon delete inquiries"
  on public.inquiries
  as restrictive
  for delete
  to anon
  using (false);

drop policy if exists "deny anon update volunteers" on public.volunteers;
create policy "deny anon update volunteers"
  on public.volunteers
  as restrictive
  for update
  to anon
  using (false)
  with check (false);

drop policy if exists "deny anon delete volunteers" on public.volunteers;
create policy "deny anon delete volunteers"
  on public.volunteers
  as restrictive
  for delete
  to anon
  using (false);

-- Allow the anonymous INSERT explicitly (was previously covered by `to public`)
-- so the intent is readable in one place alongside the denials.
drop policy if exists "anon insert inquiries" on public.inquiries;
create policy "anon insert inquiries"
  on public.inquiries
  for insert
  to anon
  with check (hp is null or hp = '');

drop policy if exists "anon insert volunteers" on public.volunteers;
create policy "anon insert volunteers"
  on public.volunteers
  for insert
  to anon
  with check (true);
