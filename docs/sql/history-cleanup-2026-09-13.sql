-- History cleanup — run in the Supabase SQL editor, STEP 1 first, read it,
-- then STEP 2.
--
-- Why: finder_price_daily (the 90-day history) is a view over
-- finder_price_snapshots. Some snapshots recorded a pack or single price as a
-- box price, so the "cheapest box that day" is far below any real box. That
-- drags the median down and makes every honest price look "above usual".
-- On 13 Sep the board would have flagged 21 of 52 rows, against medians like
-- €53 for a box of 25 José L. Piedra Brevas.
--
-- Predicate: a snapshot is poisoned when its price is under 55% of the
-- median price for the SAME sku and pack_size across ALL retailers in the
-- window. Real cross-Europe spreads on Cuban boxes are 10-35%; nothing
-- honest is 45% under the median.

-- ─── STEP 1 · look before you delete ────────────────────────────────────────
with med as (
  select sku, pack_size,
         percentile_cont(0.5) within group (order by price_eur) as median_eur,
         count(*) as n
  from public.finder_price_snapshots
  where scraped_at >= now() - interval '90 days' and in_stock
  group by sku, pack_size
)
select s.id, s.sku, s.pack_size, s.retailer_id,
       s.price_eur, round(m.median_eur) as median_eur,
       round(100 * s.price_eur / m.median_eur) as pct_of_median,
       s.scraped_at::date as day, s.source_url
from public.finder_price_snapshots s
join med m on m.sku = s.sku and m.pack_size = s.pack_size
where s.scraped_at >= now() - interval '90 days'
  and m.n >= 5
  and s.price_eur < 0.55 * m.median_eur
order by s.sku, s.scraped_at;

-- Expect: rows clustered on a few retailers/URLs, each at ~20-45% of median
-- (a 5- or 10-pack priced as a box of 25). If you see a whole SKU where
-- EVERY retailer is "under median", the median itself is wrong — stop and
-- tell me which sku; do not run step 2 for it.

-- ─── STEP 2 · delete exactly those rows ─────────────────────────────────────
-- Same predicate. Nothing else.
with med as (
  select sku, pack_size,
         percentile_cont(0.5) within group (order by price_eur) as median_eur,
         count(*) as n
  from public.finder_price_snapshots
  where scraped_at >= now() - interval '90 days' and in_stock
  group by sku, pack_size
)
delete from public.finder_price_snapshots s
using med m
where m.sku = s.sku and m.pack_size = s.pack_size
  and s.scraped_at >= now() - interval '90 days'
  and m.n >= 5
  and s.price_eur < 0.55 * m.median_eur;

-- ─── STEP 3 · tell me the count it deleted and I flip HIGH_SIGNAL_ENABLED. ──
