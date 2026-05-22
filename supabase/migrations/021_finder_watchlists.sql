-- ============================================================================
-- The Finder — price watchlist + email capture
-- Block 3 of the Finder launch sprint. Turns blog traffic into email subs.
-- ============================================================================
-- Tables:
--   finder_email_subscribers — anonymous email-capture (no auth required)
--   finder_watchlists        — SKUs a user wants to be alerted about
-- RLS: anon users get their own rows via a signed cookie token (no Supabase
--      auth session needed). Lounge members get full row-level access via
--      their auth.uid().
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. FINDER EMAIL SUBSCRIBERS
-- One row per email address. Two sources:
--   a) anonymous Save-to-Watchlist flow (no Lounge account needed)
--   b) Lounge members linking their existing profile to a finder subscription
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.finder_email_subscribers (
  id                   uuid primary key default gen_random_uuid(),
  email                text unique not null,
  -- If the subscriber is also a Lounge member, link the profile so we can show
  -- their watchlist in /lounge/app/finder/.
  profile_id           uuid references public.profiles(id) on delete set null,
  -- Plain-text token shipped via cookie + double-opt-in email. Lets anon users
  -- prove ownership of an email without a full Supabase auth session.
  confirm_token        text not null default replace(gen_random_uuid()::text, '-', ''),
  confirmed_at         timestamptz,                    -- null until they click the email link
  -- Free tier: 1 active alert. Lounge members get unlimited.
  free_alerts_used     int default 0,
  -- Marketing opt-in (separate from transactional alerts).
  marketing_opt_in     boolean default true,
  -- Soft delete / unsubscribe.
  unsubscribed_at      timestamptz,
  created_at           timestamptz default now(),
  last_seen_at         timestamptz default now(),
  ip_country           text,                           -- "DE" (set by edge fn — optional)
  source               text default 'finder_save'      -- 'finder_save' | 'newsletter_footer' | 'lounge_link'
);

create index if not exists finder_subs_email_idx on public.finder_email_subscribers (lower(email));
create index if not exists finder_subs_profile_idx on public.finder_email_subscribers (profile_id) where profile_id is not null;
create index if not exists finder_subs_confirm_idx on public.finder_email_subscribers (confirm_token);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. FINDER WATCHLISTS
-- One row per (subscriber, SKU). target_price_eur is optional — null means
-- "alert me on ANY price drop below the current best EU price".
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.finder_watchlists (
  id                   uuid primary key default gen_random_uuid(),
  subscriber_id        uuid not null references public.finder_email_subscribers(id) on delete cascade,
  sku                  text not null,                  -- 'cohiba-robustos' (matches finder-data.ts canonical slugs)
  target_price_eur     numeric(8,2),                   -- null = any drop below current best
  -- Snapshot of best price at moment of save — so the alert knows the baseline.
  baseline_price_eur   numeric(8,2),
  -- Track if/when we've fired an alert for this watchlist (avoid spam).
  last_alert_sent_at   timestamptz,
  alert_count          int default 0,
  -- Soft delete (lets us keep history for re-onboarding).
  archived_at          timestamptz,
  created_at           timestamptz default now(),
  unique (subscriber_id, sku)                          -- one watch per SKU per subscriber
);

create index if not exists finder_watch_sub_idx on public.finder_watchlists (subscriber_id) where archived_at is null;
create index if not exists finder_watch_sku_idx on public.finder_watchlists (sku) where archived_at is null;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RLS — anonymous flow goes through a server-side API (service role), so
-- direct anon access is fully locked. Lounge members can read/manage their
-- own watchlist rows from the browser using auth.uid().
-- ────────────────────────────────────────────────────────────────────────────
alter table public.finder_email_subscribers enable row level security;
alter table public.finder_watchlists       enable row level security;

-- Subscribers: a Lounge member can SELECT their own subscriber row (via profile_id).
drop policy if exists "finder_subs_own_select" on public.finder_email_subscribers;
create policy "finder_subs_own_select"
  on public.finder_email_subscribers
  for select
  using (profile_id = auth.uid());

-- Subscribers: a Lounge member can UPDATE their own subscriber row (toggle marketing opt-in, etc.)
drop policy if exists "finder_subs_own_update" on public.finder_email_subscribers;
create policy "finder_subs_own_update"
  on public.finder_email_subscribers
  for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Watchlists: a Lounge member can read their own rows.
drop policy if exists "finder_watch_own_select" on public.finder_watchlists;
create policy "finder_watch_own_select"
  on public.finder_watchlists
  for select
  using (
    subscriber_id in (
      select id from public.finder_email_subscribers where profile_id = auth.uid()
    )
  );

-- Watchlists: a Lounge member can insert rows tied to their subscriber row.
drop policy if exists "finder_watch_own_insert" on public.finder_watchlists;
create policy "finder_watch_own_insert"
  on public.finder_watchlists
  for insert
  with check (
    subscriber_id in (
      select id from public.finder_email_subscribers where profile_id = auth.uid()
    )
  );

-- Watchlists: a Lounge member can delete (archive) their own rows.
drop policy if exists "finder_watch_own_delete" on public.finder_watchlists;
create policy "finder_watch_own_delete"
  on public.finder_watchlists
  for delete
  using (
    subscriber_id in (
      select id from public.finder_email_subscribers where profile_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 4. HELPER VIEW — joined watchlist + subscriber email for the alert worker.
-- The service role reads this from a Cloudflare Worker that runs the
-- price-check job hourly. Not exposed to public.
-- ────────────────────────────────────────────────────────────────────────────
create or replace view public.finder_active_watchlist_v as
  select
    w.id            as watchlist_id,
    w.sku,
    w.target_price_eur,
    w.baseline_price_eur,
    w.last_alert_sent_at,
    s.id            as subscriber_id,
    s.email,
    s.confirmed_at,
    s.unsubscribed_at,
    s.profile_id
  from public.finder_watchlists w
  join public.finder_email_subscribers s on s.id = w.subscriber_id
  where w.archived_at is null
    and s.unsubscribed_at is null
    and s.confirmed_at is not null;

comment on table public.finder_email_subscribers
  is 'Finder email-capture list. Anonymous OR linked to a Lounge profile.';
comment on table public.finder_watchlists
  is 'Saved SKUs a Finder user wants price alerts on. One row per (subscriber, sku).';
