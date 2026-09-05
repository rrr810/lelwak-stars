-- ============================================================================
--  0005 — derive is_priority and force status in the database
--
--  WHY
--  ---
--  src/app/actions/inquiry.ts was computing
--
--      is_priority = inquiry_type in ('sponsorship','grant')
--
--  in application code and sending it in the INSERT. But 0003 deliberately
--  made is_priority non-writable by anon, so Postgres rejected the whole row:
--
--      [inquiry] insert failed: permission denied for table inquiries
--
--  Granting anon INSERT on is_priority would be the wrong fix — it would let
--  any caller who bypasses the form flag their own enquiry as priority and
--  jump the queue.
--
--  Instead the rule now lives in the database as a BEFORE INSERT trigger.
--  Application code stops sending the column, the database computes it, and
--  the priority flag cannot be forged by anyone writing as anon.
--
--  The same trigger pins status to 'new' and clears the staff-only handling
--  fields, so a public caller cannot influence its own place in the pipeline
--  even if a future grant widens by accident. Defence in depth: these columns
--  are already not in anon's INSERT grant list, so this is a second lock.
--
--  Safe to re-run.
-- ============================================================================

create or replace function public.inquiries_before_insert()
returns trigger
language plpgsql
as $$
begin
  -- Pipeline state is always server-decided.
  new.status := 'new';

  -- Sponsorship and grant enquiries go to the top of the queue.
  new.is_priority := new.inquiry_type in ('sponsorship', 'grant');

  -- Handling fields belong to staff and start empty.
  new.notes       := null;
  new.handled_by  := null;
  new.handled_at  := null;

  -- The honeypot is only ever a rejection signal; don't store what a bot typed.
  if new.hp is not null and new.hp <> '' then
    new.hp := 'filled';
  end if;

  return new;
end;
$$;

drop trigger if exists inquiries_derive on public.inquiries;
create trigger inquiries_derive
  before insert on public.inquiries
  for each row
  execute function public.inquiries_before_insert();

-- Same treatment for volunteer sign-ups: status is never caller-controlled.
create or replace function public.volunteers_before_insert()
returns trigger
language plpgsql
as $$
begin
  new.status := 'new';
  return new;
end;
$$;

drop trigger if exists volunteers_derive on public.volunteers;
create trigger volunteers_derive
  before insert on public.volunteers
  for each row
  execute function public.volunteers_before_insert();

comment on function public.inquiries_before_insert() is
  'Pins status to new, derives is_priority from inquiry_type '
  '(sponsorship/grant), and clears staff-only handling fields. Runs on every '
  'INSERT so neither a public caller nor application code can forge an '
  'enquiry''s place in the pipeline.';
