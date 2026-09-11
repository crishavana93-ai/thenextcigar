-- ============================================================================
-- The humidor ledger — what a member owns, and what it's worth today
-- ============================================================================
-- Private by design. A humidor is an inventory of valuable goods tied to a
-- person and a city, so RLS is owner-only on every operation: no member can
-- read, count or even detect another member's rows, and there is no sharing
-- flag to get wrong later. If sharing is ever wanted it should be a separate,
-- deliberate table of what the owner chose to publish — never a boolean on
-- this one.
--
-- Valuation is computed at read time on the site from the Markets board; we
-- store only what the member told us (what they bought, when, what they paid)
-- so that a change in our price data can never silently rewrite their record.
-- ============================================================================

create table if not exists public.humidor_entries (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid not null references public.profiles(id) on delete cascade,

  -- Canonical SKU slug from src/data/finder-data.ts when the cigar is on the
  -- board (that's what makes it valuable); free text when it isn't.
  sku           text,
  label         text,                       -- used when sku is null
  check (sku is not null or nullif(btrim(coalesce(label,'')), '') is not null),

  quantity      integer not null default 1 check (quantity >= 0 and quantity <= 10000),
  -- Singles or a sealed box: changes how the reader thinks about it, and how
  -- we price it (box price ÷ box size vs. the box itself).
  form          text not null default 'singles' check (form in ('singles','box')),

  -- What the member paid, in their own currency, for the whole line.
  paid          numeric(10,2) check (paid is null or paid >= 0),
  currency      text check (currency is null or currency in ('EUR','CHF','SEK','GBP','DKK','NOK','USD')),
  acquired_on   date,
  retailer      text,                       -- free text; where they bought it

  -- Straight off the box: decoded by /tools/box-code/ into a fill date.
  box_code      text,
  -- The decoded fill month, stored as the first of the month so ageing is a
  -- plain date subtraction. Written by the client from the decoder.
  filled_on     date,

  notes         text check (notes is null or length(notes) <= 2000),
  archived_at   timestamptz,                -- smoked, sold or given away
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists humidor_member_idx
  on public.humidor_entries (member_id, created_at desc) where archived_at is null;
create index if not exists humidor_member_sku_idx
  on public.humidor_entries (member_id, sku) where archived_at is null;

alter table public.humidor_entries enable row level security;

drop policy if exists "humidor_own_select" on public.humidor_entries;
create policy "humidor_own_select" on public.humidor_entries
  for select to authenticated using (member_id = auth.uid());

drop policy if exists "humidor_own_insert" on public.humidor_entries;
create policy "humidor_own_insert" on public.humidor_entries
  for insert to authenticated with check (member_id = auth.uid());

drop policy if exists "humidor_own_update" on public.humidor_entries;
create policy "humidor_own_update" on public.humidor_entries
  for update to authenticated using (member_id = auth.uid()) with check (member_id = auth.uid());

drop policy if exists "humidor_own_delete" on public.humidor_entries;
create policy "humidor_own_delete" on public.humidor_entries
  for delete to authenticated using (member_id = auth.uid());

-- Keep updated_at honest.
create or replace function public.touch_humidor_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists humidor_touch on public.humidor_entries;
create trigger humidor_touch before update on public.humidor_entries
  for each row execute function public.touch_humidor_updated_at();
