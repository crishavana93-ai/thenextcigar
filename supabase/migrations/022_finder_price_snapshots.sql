-- ============================================================================
-- The Finder — price snapshot pipeline (Block 4 step D)
-- ============================================================================
-- Live scraper writes price observations into finder_price_snapshots on cron.
-- The alert engine diffs newest vs. second-newest snapshots to detect:
--   1. price_drop  — price below baseline OR below target_price_eur
--   2. back_in_stock — in_stock transitioned false -> true
-- and writes deliveries into finder_alert_deliveries for dedupe.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. PRICE SNAPSHOTS — one row per (sku, retailer, scrape).
-- Written by the Cloudflare Worker. Indexed for "latest per (sku, retailer)".
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.finder_price_snapshots (
  id                uuid primary key default gen_random_uuid(),
  -- Canonical SKU slug from src/data/finder-data.ts (e.g. "cohiba-robustos").
  sku               text not null,
  -- Canonical retailer id from src/data/finder-data.ts (e.g. "de-noblego").
  retailer_id       text not null,
  -- Native-currency price for the canonical box size (sku.boxSize).
  price             numeric(10,2) not null,
  currency          text not null check (currency in ('EUR','CHF','SEK','GBP','DKK','NOK')),
  -- EUR-normalized price (recomputed at scrape time using daily FX feed).
  price_eur         numeric(10,2) not null,
  -- "Was X" strikethrough if the retailer flagged a sale.
  original_price    numeric(10,2),
  in_stock          boolean not null default true,
  -- The retailer's product URL the price was scraped from (for the Shop button).
  source_url        text not null,
  -- ISO country code of the retailer (denormalized for fast country filters).
  country_code      text not null,
  -- Optional: which scraper parser produced this snapshot (for debugging).
  parser            text default 'schema_org',
  scraped_at        timestamptz default now()
);

-- Fast lookup of latest snapshot per (sku, retailer) — what the SKU page renders.
create index if not exists finder_snap_sku_retailer_idx
  on public.finder_price_snapshots (sku, retailer_id, scraped_at desc);

-- Country page query — all live snapshots for a country sorted by price.
create index if not exists finder_snap_country_idx
  on public.finder_price_snapshots (country_code, scraped_at desc) where in_stock = true;

-- Alert engine query — newest snapshots for a SKU across all retailers.
create index if not exists finder_snap_sku_recent_idx
  on public.finder_price_snapshots (sku, scraped_at desc);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. WATCHLIST EXTENSIONS — alert type + country scope (Block 4 plan).
-- ────────────────────────────────────────────────────────────────────────────
alter table public.finder_watchlists
  add column if not exists alert_type text default 'price_drop'
    check (alert_type in ('price_drop','back_in_stock','both')),
  add column if not exists country_scope text[] default null,           -- null = EU-wide
  add column if not exists last_in_stock_state boolean default true;     -- for transition diff

-- ────────────────────────────────────────────────────────────────────────────
-- 3. RELEASE WATCHLISTS — "alert me when ANY new Cuban arrival hits Sweden"
-- Distinct from finder_watchlists because there's no fixed SKU — the trigger
-- is "a never-before-seen SKU appears in a snapshot for one of these retailers".
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.finder_release_watchlists (
  id                  uuid primary key default gen_random_uuid(),
  subscriber_id       uuid not null references public.finder_email_subscribers(id) on delete cascade,
  country_scope       text[] default null,        -- ['se'] or ['se','no','dk']; null = EU
  brand_filter        text[] default null,        -- ['cohiba','montecristo'] or null for any
  archived_at         timestamptz,
  created_at          timestamptz default now()
);

create index if not exists finder_release_sub_idx
  on public.finder_release_watchlists (subscriber_id) where archived_at is null;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ALERT DELIVERIES — dedupe table (don't email the same drop twice).
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.finder_alert_deliveries (
  id                  uuid primary key default gen_random_uuid(),
  -- Either watchlist_id (price/restock) OR release_watchlist_id (new release).
  watchlist_id        uuid references public.finder_watchlists(id) on delete cascade,
  release_watchlist_id uuid references public.finder_release_watchlists(id) on delete cascade,
  subscriber_id       uuid not null references public.finder_email_subscribers(id) on delete cascade,
  alert_type          text not null check (alert_type in ('price_drop','back_in_stock','new_release')),
  -- The snapshot that triggered the alert.
  snapshot_id         uuid references public.finder_price_snapshots(id) on delete cascade,
  -- For ranking + dedup: the SKU + retailer the alert was about.
  sku                 text not null,
  retailer_id         text not null,
  -- The price + currency that was emailed (so we can verify the user's link).
  alert_price_eur     numeric(10,2),
  delivered_at        timestamptz default now(),
  -- Email transport status: 'sent' | 'failed' | 'bounced'.
  delivery_status     text default 'sent'
);

create index if not exists finder_alert_sub_idx
  on public.finder_alert_deliveries (subscriber_id, delivered_at desc);
-- Dedup index: a watchlist gets at most one alert per snapshot.
create unique index if not exists finder_alert_dedup_idx
  on public.finder_alert_deliveries (watchlist_id, snapshot_id)
  where watchlist_id is not null and snapshot_id is not null;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. RLS — snapshots are public-readable (renders on /finder/ pages anonymously),
-- writes are service-role only. Watchlist tables RLS already set in 021.
-- ────────────────────────────────────────────────────────────────────────────
alter table public.finder_price_snapshots     enable row level security;
alter table public.finder_release_watchlists  enable row level security;
alter table public.finder_alert_deliveries    enable row level security;

drop policy if exists "finder_snap_public_read" on public.finder_price_snapshots;
create policy "finder_snap_public_read"
  on public.finder_price_snapshots for select using (true);

drop policy if exists "finder_release_own_select" on public.finder_release_watchlists;
create policy "finder_release_own_select"
  on public.finder_release_watchlists for select
  using (
    subscriber_id in (
      select id from public.finder_email_subscribers where profile_id = auth.uid()
    )
  );

drop policy if exists "finder_alert_own_select" on public.finder_alert_deliveries;
create policy "finder_alert_own_select"
  on public.finder_alert_deliveries for select
  using (
    subscriber_id in (
      select id from public.finder_email_subscribers where profile_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 6. HELPER VIEW — latest snapshot per (sku, retailer) for fast SKU-page reads.
-- This is what /finder/sku/[sku].astro queries to render the offer table.
-- ────────────────────────────────────────────────────────────────────────────
create or replace view public.finder_latest_snapshots_v as
  select distinct on (sku, retailer_id)
    id, sku, retailer_id, price, currency, price_eur, original_price,
    in_stock, source_url, country_code, scraped_at
  from public.finder_price_snapshots
  order by sku, retailer_id, scraped_at desc;

comment on table public.finder_price_snapshots
  is 'Live scraper observations of retailer prices. One row per scrape per (sku, retailer). Use finder_latest_snapshots_v for SKU-page reads.';
comment on table public.finder_release_watchlists
  is 'Alert me when ANY new Cuban arrival hits a country/brand scope.';
comment on table public.finder_alert_deliveries
  is 'Dedupe + audit table for fired alerts. Unique on (watchlist_id, snapshot_id).';
