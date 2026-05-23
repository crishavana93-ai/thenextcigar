-- ============================================================================
-- OG Member — recast the Founder tier from "first 100" to date-based
-- ============================================================================
-- The original Founder Member design (migrations 024 + 025) capped the cohort
-- at 100 members. That creates a fairness wound between member 100 and 101 +
-- forces every announcement email to dance around "you missed the cap".
--
-- This migration reframes the tier as a TIME-BASED credential:
--   pre_launch — joined before 2026-06-01 (the public launch date)
--   earned     — joined after, but completed the engagement filter within
--                their first 90 days (profile + 1 directory post + 1 event
--                submission OR referral). Implementation TBD; column added
--                now so the path is consistent.
--
-- All existing founder_member = true rows convert to founder_path = 'pre_launch'.
-- The auto-grant trigger from migration 025 is replaced: it now grants
-- founder_member based on joined_at, not founder count.
--
-- Public UI surfaces this as "OG Member" with NO ordinal number — so a member
-- who joins on day 500 doesn't see "#007" and feel small. The badge is binary:
-- you're an OG, or you're on the Earned path.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. New column — which path granted the OG Member status
-- ────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists founder_path text;

-- Constrain to known values. Allow NULL for non-OG-members.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_founder_path_chk'
  ) then
    alter table public.profiles
      add constraint profiles_founder_path_chk
      check (founder_path is null or founder_path in ('pre_launch', 'earned'));
  end if;
end $$;

-- Backfill: every existing founder_member becomes pre_launch (they joined
-- before this migration ran, by definition).
update public.profiles
   set founder_path = 'pre_launch'
 where founder_member = true
   and founder_path is null;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Replace the auto-grant trigger function
--    Old: "grant founder if current count < 100"
--    New: "grant founder if joined_at < 2026-06-01" (pre_launch cutoff)
-- ────────────────────────────────────────────────────────────────────────────
create or replace function public.grant_founder_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  pre_launch_cutoff timestamptz := '2026-06-01 00:00:00+00';
begin
  -- Respect existing flags (admin can manually promote any member).
  if NEW.founder_member = true then
    return NEW;
  end if;

  -- Pre-launch path: granted automatically based on signup time.
  -- joined_at may be NULL on freshly-inserted rows; coalesce to NOW().
  if coalesce(NEW.joined_at, now()) < pre_launch_cutoff then
    NEW.founder_member     := true;
    NEW.founder_path       := 'pre_launch';
    NEW.founder_granted_at := now();
  end if;

  -- Earned path: NOT granted at signup. Instead, a separate scheduled
  -- function (or admin action) flips it once the 90-day engagement filter
  -- is satisfied. The path string + granted_at columns let us audit.
  return NEW;
end;
$$;

comment on function public.grant_founder_on_signup
  is 'BEFORE INSERT on profiles: grants OG Member (pre_launch path) to anyone joining before the launch cutoff date. Earned-path grants happen separately.';

-- Make sure the trigger still points to the (now updated) function. It was
-- already created in migration 025 — this is idempotent.
drop trigger if exists trg_grant_founder_on_signup on public.profiles;
create trigger trg_grant_founder_on_signup
  before insert on public.profiles
  for each row
  execute function public.grant_founder_on_signup();

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Helper view — OG Members ordered by signup
-- ────────────────────────────────────────────────────────────────────────────
-- The previous version of this view (from migration 024/025) selected
-- founder_number. PostgreSQL doesn't allow CREATE OR REPLACE VIEW to rename
-- columns, so we drop and recreate.
drop view if exists public.founder_members_v;
create view public.founder_members_v as
  select
    id, display_name, full_name, founder_path,
    founder_granted_at, joined_at
  from public.profiles
  where founder_member = true
  order by joined_at asc nulls last, id asc;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Deprecate founder_number — keep the column for now (avoid breaking
--    existing UI that selects it) but it's no longer the source of truth.
--    UI rendering should switch to using founder_path. A future migration
--    can drop founder_number entirely.
-- ────────────────────────────────────────────────────────────────────────────
comment on column public.profiles.founder_number
  is 'DEPRECATED — use founder_path. Was previously the 1-100 cap ordinal; kept for backwards compat until UI fully migrates to founder_path.';
comment on column public.profiles.founder_path
  is 'How this member became an OG Member: pre_launch (joined before 2026-06-01) or earned (completed 90-day engagement filter post-launch). NULL for non-OGs.';
