# Finder · Block 3 deploy runbook

Block 3 = price-alert watchlist + email capture. Lives in the Finder.

## What ships in this commit

- Supabase migration `021_finder_watchlists.sql` — two tables + a view + RLS policies
- Cloudflare Pages Function `functions/api/watchlist/save.ts` — POST endpoint
- `<PriceAlertModal />` + `<SaveAlertButton />` components
- SaveAlertButton wired into the SKU detail page best-value card
- Lounge `/lounge/app/finder/` hydrates from Supabase when a member is signed in

## One-time setup before the feature works in production

1. Open Supabase Dashboard -> SQL Editor -> paste & run
   `supabase/migrations/021_finder_watchlists.sql`.
2. Open Cloudflare Pages -> `thenextcigar` project -> Settings -> Environment
   variables -> Production. Add:
   - `SUPABASE_SERVICE_ROLE_KEY` = the service_role JWT from Supabase
     (Dashboard -> Settings -> API). Server-only; do NOT prefix with PUBLIC_.
   - `PUBLIC_SUPABASE_URL` -- should already be set from the Lounge work.
3. Redeploy (any push to `main` triggers it).

## Quick test once deployed

1. Visit https://thenextcigar.com/finder/sku/cohiba-robustos/
2. Click "Save price alert" inside the best-value card
3. Modal opens -> enter email -> submit
4. Check Supabase Dashboard -> Tables -> `finder_email_subscribers` for the row
5. Check `finder_watchlists` for the SKU row

## Free tier guard

Anonymous email subscribers (no Lounge account) are limited to 1 active
watchlist row. Attempting to save a second SKU returns HTTP 402 and the modal
flips to the "upgrade to The Lounge" upsell state.

## Next steps (NOT in this commit)

- Cloudflare Worker on a cron: scrape latest snapshots, fire alert emails when
  `target_price_eur` is hit
- Double-opt-in confirmation email (currently we just store the row)
- Profile-linking flow: when a Lounge member signs up with the same email
  already used for anon Save, automatically link `profile_id`
