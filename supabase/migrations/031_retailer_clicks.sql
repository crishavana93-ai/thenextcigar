-- ─────────────────────────────────────────────────────────────
-- Migration 031 · retailer_clicks
-- Counts outbound clicks from thenextcigar.com to each retailer, per day,
-- per page. This exists for one reason: to be able to tell a retailer, with
-- a number, how many readers we sent them last month before asking them to
-- pay for a featured slot.
--
-- Deliberately aggregate-only. No IP, no user id, no cookie, no user agent,
-- no referrer beyond our own page path. A row is (day, retailer host, page)
-- and an integer. There is nothing here that identifies a person.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.retailer_clicks (
  day   date not null default (now() at time zone 'utc')::date,
  host  text not null,                 -- e.g. 'www.noblego.de'
  page  text not null,                 -- our path, e.g. '/finder/' or '/blog/where-to-buy-…/'
  n     integer not null default 0,
  primary key (day, host, page)
);

alter table public.retailer_clicks enable row level security;
-- No policies on purpose: nothing reads or writes this through the anon key.
-- Writes go through the RPC below (service role from a Pages Function);
-- reads are the dashboard / SQL editor.

-- Atomic increment. ON CONFLICT so the first click of the day creates the row
-- and every later one bumps it; no read-modify-write race.
create or replace function public.bump_retailer_click(p_host text, p_page text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.retailer_clicks (day, host, page, n)
  values ((now() at time zone 'utc')::date, lower(p_host), left(p_page, 200), 1)
  on conflict (day, host, page) do update set n = retailer_clicks.n + 1;
$$;

revoke all on function public.bump_retailer_click(text, text) from public, anon, authenticated;
-- service_role bypasses RLS and keeps execute by default.

-- What you will actually look at:
--   select host, sum(n) as clicks from retailer_clicks
--   where day >= current_date - 30 group by host order by clicks desc;
