-- The Finder — retailer listings (feeds "Newly listed" + release-watch emails)
--
-- One row per product URL ever seen on a tracked retailer's Cuban-cigar
-- listing pages. The listings crawler (functions/api/scraper/listings.ts)
-- upserts every run; a URL whose first_seen is this run — and the retailer
-- already had rows before — is a new listing.
--
-- Apply in the Supabase SQL editor.

create table if not exists public.finder_listings (
  retailer_id   text not null,
  url           text not null,
  title         text not null,
  brand         text,                        -- matched Habanos brand, if any
  country_code  text not null,
  price         numeric(10,2),
  currency      text,
  first_seen    timestamptz not null default now(),
  last_seen     timestamptz not null default now(),
  alerted_at    timestamptz,
  primary key (retailer_id, url)
);

create index if not exists finder_listings_first_seen_idx
  on public.finder_listings (first_seen desc);

grant select on public.finder_listings to anon, authenticated;
