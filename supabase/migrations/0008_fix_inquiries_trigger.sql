-- ============================================================================
--  0008 — drop the broken updated_at trigger on public.inquiries
--
--  The BEFORE UPDATE trigger `inquiries_updated_at` called set_updated_at(),
--  which assigns NEW.updated_at — a column inquiries does not have. Every
--  admin update (status change, notes) therefore failed with:
--      record "new" has no field "updated_at"
--  Audited at 2026-09-06: inquiries is the ONLY table with this mismatch;
--  every other set_updated_at() trigger sits on a table that has the column.
-- ============================================================================

drop trigger if exists inquiries_updated_at on public.inquiries;

-- safety net: if anyone re-attaches a generic updated_at trigger later,
-- make the helper defensive instead of fatal.
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  if to_jsonb(new) ? 'updated_at' then
    new.updated_at := now();
  end if;
  return new;
end $$;
