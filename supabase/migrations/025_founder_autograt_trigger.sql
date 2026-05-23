-- ============================================================================
-- Founder Member auto-grant trigger
-- ============================================================================
-- Migration 024 backfilled the first 100 existing profiles. This trigger keeps
-- the promise alive for NEW signups: every new public.profiles row created
-- while the founder count is < 100 automatically receives founder_member = true
-- and the next available founder_number.
--
-- Once 100 founders exist, this trigger no-ops (new signups get default
-- founder_member = false). At that point the cohort is closed.
--
-- BEFORE INSERT (not AFTER) so we set founder_member + founder_number on the
-- row itself; no second UPDATE round-trip. Atomic per insert.
-- ============================================================================

create or replace function public.grant_founder_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
  next_number   int;
begin
  -- Skip if the row already has founder_member set explicitly (e.g. admin
  -- promotion via the dashboard). Protects manual overrides.
  if NEW.founder_member = true then
    return NEW;
  end if;

  -- Count existing founders. The unique index on founder_number ensures
  -- no two concurrent inserts can collide (one will fail and the client
  -- can retry), so this read-then-write pattern is safe under load.
  select count(*) into current_count
  from public.profiles
  where founder_member = true;

  if current_count >= 100 then
    return NEW;  -- cohort closed; row keeps default founder_member = false
  end if;

  -- Assign the next sequential founder_number. Using max()+1 instead of
  -- current_count+1 in case admins ever delete-and-restore a founder row,
  -- which would leave gaps we should fill rather than duplicate.
  select coalesce(max(founder_number), 0) + 1 into next_number
  from public.profiles
  where founder_number is not null;

  -- If max+1 collides with an existing number (rare race), the unique
  -- index on founder_number rolls back the insert; the application's
  -- retry path handles it.
  NEW.founder_member     := true;
  NEW.founder_number     := next_number;
  NEW.founder_granted_at := now();
  return NEW;
end;
$$;

-- Drop-and-create so the migration is idempotent on re-runs.
drop trigger if exists trg_grant_founder_on_signup on public.profiles;

create trigger trg_grant_founder_on_signup
  before insert on public.profiles
  for each row
  execute function public.grant_founder_on_signup();

comment on function public.grant_founder_on_signup
  is 'BEFORE INSERT on profiles: auto-grants Founder Member status to the first 100 new signups. No-ops once the cohort is full.';
