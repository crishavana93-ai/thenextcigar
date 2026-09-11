-- The Finder — daily price history view (feeds the sparkline on SKU pages)
--
-- One row per (sku, pack_size, day): the cheapest in-stock EUR price seen
-- anywhere in Europe that day. The site reads this at build time via
-- src/data/finder-live.ts → fetchHistory(). Until this view exists the
-- build simply omits the history chart — nothing breaks.
--
-- Apply in the Supabase SQL editor (or `supabase db push`).

create or replace view public.finder_price_daily as
select
  sku,
  pack_size,
  (scraped_at at time zone 'utc')::date as day,
  min(price_eur)                        as min_eur,
  count(distinct retailer_id)           as offers
from public.finder_price_snapshots
where in_stock
group by sku, pack_size, (scraped_at at time zone 'utc')::date;

grant select on public.finder_price_daily to anon, authenticated;
