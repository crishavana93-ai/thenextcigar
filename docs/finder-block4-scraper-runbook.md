# Finder · Block 4 scraper runbook

## What's shipped in this commit

1. `supabase/migrations/022_finder_price_snapshots.sql` — snapshot table +
   release watchlists + alert deliveries dedup table + RLS + helper view
   `finder_latest_snapshots_v`.
2. `src/lib/scrapers/` — parser library
   - `types.ts` — shared interfaces
   - `schema-org.ts` — schema.org Product JSON-LD parser (the workhorse)
   - `sku-matcher.ts` — canonical SKU slug classifier
   - `retailers/noblego.ts` + `retailers/cigarworld.ts` — first two parsers
   - `index.ts` — parser registry
3. `functions/api/scraper/[retailer].ts` — Cloudflare Pages Function manual
   trigger endpoint. Auth via `X-Scraper-Token` header.

## Pre-deploy steps

1. Run `022_finder_price_snapshots.sql` in Supabase Dashboard → SQL Editor.
2. Generate a scraper admin token:
   ```bash
   openssl rand -hex 32
   ```
3. Set it as `SCRAPER_ADMIN_TOKEN` in Cloudflare Pages → Settings → Environment
   variables → Production (NOT prefixed with `PUBLIC_` — server-only).

## Manual scrape trigger

After deploy, trigger a scrape for a single retailer:

```bash
curl -X POST https://thenextcigar.com/api/scraper/de-noblego \
  -H "X-Scraper-Token: <your-token>" | jq
```

Response shape:

```json
{
  "ok": true,
  "retailerId": "de-noblego",
  "scrapedAt": "2026-05-22T19:00:00.000Z",
  "stats": {
    "pagesFetched": 7,
    "bytesDownloaded": 3145728,
    "offersTotal": 42,
    "classified": 38,
    "unclassified": 4,
    "inserted": 38
  },
  "errors": [],
  "sampleClassified": [...],
  "sampleUnclassified": [...]
}
```

`sampleUnclassified` shows offer titles the SKU matcher couldn't classify —
useful for adding new patterns to `sku-matcher.ts`.

## Adding a new retailer parser

1. Create `src/lib/scrapers/retailers/<retailer-id>.ts` exporting a
   `RetailerParser` const.
2. If it uses schema.org JSON-LD (most do), just point its `parse` at
   `parseSchemaOrgPage`. If not, write a custom parser for the stack.
3. Register it in `src/lib/scrapers/index.ts`.
4. Add its config to the `SCRAPERS` map in
   `functions/api/scraper/[retailer].ts` (with `country` + `startUrls`).

## Next steps (NOT in this commit)

- **Cron Worker** (separate Cloudflare Worker, not Pages Function) to call
  every retailer's scraper hourly. Cron uses Cloudflare Workers' built-in
  cron triggers via `wrangler.toml`.
- **Alert engine Worker** — diffs newest vs. second-newest snapshots per
  watchlist, fires emails for matching alert types, writes to
  `finder_alert_deliveries` for dedup.
- **More parsers** — expand to Vabajo, Selected Cigars, Casa Benden,
  Cigarmust, JJ Fox, Sigaren-Online, Cigarrspecialisten.
- **SKU page integration** — replace the static `PRICE_SNAPSHOTS` array in
  `src/data/finder-data.ts` reads with `finder_latest_snapshots_v` queries
  (this is the move that flips the Finder from static seed data to live).
