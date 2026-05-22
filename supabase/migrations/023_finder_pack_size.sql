-- ============================================================================
-- The Finder — add pack_size + price_per_cigar to snapshots (Block 4 follow-up)
-- ============================================================================
-- Migration 022 stored `price` and `price_eur` but assumed the price applied
-- to a canonical box of 25. Real-world scraping showed retailers carry
-- multiple pack sizes per SKU (3, 5, 10, 24, 25, 50) and Cuban packaging
-- itself isn't always 25 — Cohiba Behike ships in 10s, Trinidad in 12s/24s.
--
-- Storing pack_size makes the comparison engine valid:
--   - User comparing prices needs same-pack-size apples-to-apples
--   - Per-cigar normalization makes cross-pack comparison possible
--   - Alert thresholds can target a specific pack size
--
-- price_per_cigar is a generated column: always = price_eur / pack_size.
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Add columns
-- ────────────────────────────────────────────────────────────────────────────
alter table public.finder_price_snapshots
  add column if not exists pack_size integer;

-- Backfill existing rows (the 12 Noblego rows from the first successful scrape).
-- They were all written assuming preferredPackSize=25 even when the actual pack
-- the scraper picked differed. Mark them as 25 for now — they'll be overwritten
-- on the next scrape with correct pack_size from the parser.
update public.finder_price_snapshots
  set pack_size = 25
  where pack_size is null;

-- Now enforce NOT NULL.
alter table public.finder_price_snapshots
  alter column pack_size set not null;

-- Reasonable bounds — Cuban cigar packaging is 1 to 50 cigars per box/pack.
alter table public.finder_price_snapshots
  add constraint finder_snap_pack_size_chk
  check (pack_size between 1 and 100);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. Generated column — price per cigar in EUR (always consistent with the row)
-- ────────────────────────────────────────────────────────────────────────────
alter table public.finder_price_snapshots
  add column if not exists price_per_cigar_eur numeric(10,2)
  generated always as (round(price_eur / nullif(pack_size, 0), 2)) stored;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Indexes — per-cigar sort is the main "cheapest in country" query
-- ────────────────────────────────────────────────────────────────────────────
create index if not exists finder_snap_sku_pack_idx
  on public.finder_price_snapshots (sku, pack_size, retailer_id, scraped_at desc);

create index if not exists finder_snap_country_ppc_idx
  on public.finder_price_snapshots (country_code, price_per_cigar_eur)
  where in_stock = true;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Update helper view to expose pack_size + price_per_cigar
-- ────────────────────────────────────────────────────────────────────────────
drop view if exists public.finder_latest_snapshots_v;

create or replace view public.finder_latest_snapshots_v as
  select distinct on (sku, retailer_id, pack_size)
    id, sku, retailer_id, pack_size, price, currency, price_eur,
    price_per_cigar_eur, original_price, in_stock, source_url, country_code,
    scraped_at
  from public.finder_price_snapshots
  order by sku, retailer_id, pack_size, scraped_at desc;

comment on column public.finder_price_snapshots.pack_size
  is 'Number of cigars in the priced unit (3, 5, 10, 24, 25, 50). Different from canonical box size — captures what the retailer actually sells.';
comment on column public.finder_price_snapshots.price_per_cigar_eur
  is 'price_eur / pack_size, generated. Use this for cross-pack-size comparison.';
