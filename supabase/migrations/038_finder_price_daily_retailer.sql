-- The Habanos Index — per-retailer daily history.
--
-- One row per (sku, retailer, pack_size, day): the last in-stock EUR price
-- that retailer showed that day. The index page chains day-over-day changes
-- of the SAME retailer's price for the SAME cigar, so a retailer selling out
-- (or a scrape failing) moves nothing — only a price that actually changed
-- moves the index. finder_price_daily (028) stays as it is for the SKU-page
-- sparkline.
--
-- Apply in the Supabase SQL editor.

create or replace view public.finder_price_daily_retailer as
select
  sku,
  retailer_id,
  pack_size,
  (scraped_at at time zone 'utc')::date as day,
  min(price_eur)                        as min_eur
from public.finder_price_snapshots
where in_stock
group by sku, retailer_id, pack_size, (scraped_at at time zone 'utc')::date;

grant select on public.finder_price_daily_retailer to anon, authenticated;
