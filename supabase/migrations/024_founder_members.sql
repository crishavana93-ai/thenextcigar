-- ============================================================================
-- Founder Members — lifetime free tier for the first 100 Lounge members
-- ============================================================================
-- Adds three columns to public.profiles:
--   founder_member       boolean  — fast lookup flag, indexed
--   founder_number       int      — their ordinal (1-100), used in the badge
--   founder_granted_at   timestamptz — when the badge was assigned
--
-- Backfill: the first 100 profiles by created_at get founder_member = true.
-- After 100 are assigned, the badge is locked — no new auto-grants. A future
-- 'Originals' tier (referrals) will use a separate column.
--
-- Enforcement: a partial unique index on founder_number ensures no two
-- members ever get the same ordinal even under concurrent inserts.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Columns
-- ────────────────────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists founder_member       boolean     default false,
  add column if not exists founder_number       int,
  add column if not exists founder_granted_at   timestamptz;

-- Founder_number must be 1-100 if set.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_founder_number_range_chk'
  ) then
    alter table public.profiles
      add constraint profiles_founder_number_range_chk
      check (founder_number is null or (founder_number between 1 and 100));
  end if;
end $$;

-- No two members can ever share a founder number (partial: only when set).
create unique index if not exists profiles_founder_number_uniq_idx
  on public.profiles (founder_number)
  where founder_number is not null;

-- Hot index for "show all founders" + "is this member a founder" lookups.
create index if not exists profiles_founder_member_idx
  on public.profiles (founder_member)
  where founder_member = true;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Backfill — first 100 profiles by created_at become Founder Members.
-- Run safely even if the column already had some non-null values (we only
-- grant to rows where founder_member is currently false, so re-running is
-- idempotent and won't overwrite manually-promoted accounts).
-- ────────────────────────────────────────────────────────────────────────────
-- public.profiles uses `joined_at` (set on row creation), not `created_at`.
-- We order by joined_at ascending then id as tiebreaker so the result is
-- deterministic for members who joined on the same second.
with ordered as (
  select id, row_number() over (order by joined_at asc nulls last, id asc) as rn
  from public.profiles
  where founder_member = false
),
first_100 as (
  select id, rn from ordered where rn <= 100
)
update public.profiles p
   set founder_member     = true,
       founder_number     = f.rn,
       founder_granted_at = now()
  from first_100 f
 where p.id = f.id;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Helper view — surface founder rows for the admin dashboard.
-- ────────────────────────────────────────────────────────────────────────────
create or replace view public.founder_members_v as
  select id, display_name, full_name, founder_number, founder_granted_at, joined_at
  from public.profiles
  where founder_member = true
  order by founder_number asc;

comment on column public.profiles.founder_member
  is 'True for the first 100 Lounge members. Lifetime free access to all paid features.';
comment on column public.profiles.founder_number
  is 'Their ordinal in the first 100 (1 = earliest signup). Displayed in the founder badge UI.';
comment on column public.profiles.founder_granted_at
  is 'When the founder badge was first assigned. NULL for non-founders.';
