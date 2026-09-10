// ============================================================================
// The Finder — live layer (build time only)
// ============================================================================
// finder-data.ts is the hand-verified seed (May 2026) and stays a pure,
// browser-safe module. This module runs at `astro build` on the server: it
// pulls the scraper's latest observations from Supabase and lays them over
// the seed, so pages show a scraped price when we have a fresh one and the
// dated seed price when we don't.
//
// Rules
//   • A scraped row replaces the seed row for the same (sku, retailer) when it
//     matches the SKU's canonical box size and is younger than FRESH_DAYS.
//   • Anything older than FRESH_DAYS is not "live": it keeps its scrapedAt so
//     the page can print "checked <date>" honestly.
//   • If Supabase is unreachable or the env is missing, the build still
//     succeeds on seed data (with a console warning) — never a blank Finder.
//
// Pages import everything from here instead of finder-data.ts so the query
// helpers (bestPriceForSku, snapshotsForCountry …) see the merged table.
// ============================================================================

import * as seed from "./finder-data";
import type { PriceSnapshot, Currency, CountryCode, Country, Retailer } from "./finder-data";

export * from "./finder-data";

export interface LiveSnapshot extends PriceSnapshot {
  /** True when the row came from the scraper within FRESH_DAYS. */
  live?: boolean;
  /** Pack size the scraped price applies to (seed rows = the SKU's boxSize). */
  packSize?: number;
}

const FRESH_DAYS = 14;
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

interface Row {
  sku: string;
  retailer_id: string;
  price: number | string;
  currency: string;
  original_price: number | string | null;
  in_stock: boolean;
  source_url: string;
  pack_size: number | null;
  scraped_at: string;
}

async function fetchLiveRows(): Promise<Row[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.warn("[finder-live] PUBLIC_SUPABASE_URL / ANON_KEY missing — seed prices only");
    return [];
  }
  const since = new Date(Date.now() - FRESH_DAYS * 86400e3).toISOString();
  const params = new URLSearchParams({
    select: "sku,retailer_id,price,currency,original_price,in_stock,source_url,pack_size,scraped_at",
    scraped_at: `gte.${since}`,
    order: "scraped_at.desc",
    limit: "5000",
  });
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/finder_price_snapshots?${params}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) {
      console.warn(`[finder-live] Supabase ${res.status} — seed prices only`);
      return [];
    }
    return (await res.json()) as Row[];
  } catch (err) {
    console.warn("[finder-live] fetch failed — seed prices only", err);
    return [];
  }
}

function merge(rows: Row[]): LiveSnapshot[] {
  const skuById = new Map(seed.SKUS.map((s) => [s.id, s]));
  const retailerIds = new Set(seed.RETAILERS.map((r) => r.id));
  const currencies = new Set<string>(["EUR", "CHF", "SEK", "GBP", "DKK", "NOK"]);

  // Newest row per (sku, retailer) that matches the canonical box size.
  const latest = new Map<string, Row>();
  for (const r of rows) {
    const sku = skuById.get(r.sku);
    if (!sku || !retailerIds.has(r.retailer_id) || !currencies.has(r.currency)) continue;
    const box = (sku as any).boxSize as number | undefined;
    if (box && r.pack_size && r.pack_size !== box) continue;
    const key = `${r.sku}|${r.retailer_id}`;
    if (!latest.has(key)) latest.set(key, r); // rows arrive newest first
  }

  const out: LiveSnapshot[] = seed.PRICE_SNAPSHOTS.map((s) => ({
    ...s,
    packSize: (skuById.get(s.skuId) as any)?.boxSize,
  }));
  let replaced = 0, added = 0;
  for (const [key, r] of latest) {
    const snap: LiveSnapshot = {
      skuId: r.sku,
      retailerId: r.retailer_id,
      price: Number(r.price),
      currency: r.currency as Currency,
      originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
      inStock: !!r.in_stock,
      scrapedAt: r.scraped_at,
      sourceUrl: r.source_url,
      live: true,
      packSize: r.pack_size ?? undefined,
    };
    const i = out.findIndex((s) => `${s.skuId}|${s.retailerId}` === key);
    if (i >= 0) { out[i] = snap; replaced++; } else { out.push(snap); added++; }
  }
  console.log(`[finder-live] ${rows.length} rows ≤${FRESH_DAYS}d → ${replaced} seed prices replaced, ${added} added, ${out.length} total`);
  return out;
}

export const PRICE_SNAPSHOTS: LiveSnapshot[] = merge(await fetchLiveRows());
export const LIVE_COUNT = PRICE_SNAPSHOTS.filter((s) => s.live).length;
export const NEWEST_SCRAPE = PRICE_SNAPSHOTS.map((s) => s.scrapedAt).sort().at(-1) || "";

// ---- Query helpers, bound to the merged table ------------------------------
const RETAILER_BY_ID: Record<string, Retailer> = Object.fromEntries(seed.RETAILERS.map((r) => [r.id, r]));

export function snapshotsForSku(skuId: string): LiveSnapshot[] {
  return PRICE_SNAPSHOTS.filter((s) => s.skuId === skuId);
}

export function snapshotsForCountry(country: CountryCode): LiveSnapshot[] {
  const ids = new Set(seed.RETAILERS.filter((r) => r.country === country).map((r) => r.id));
  return PRICE_SNAPSHOTS.filter((s) => ids.has(s.retailerId));
}

export function bestPriceForSku(skuId: string): { snap: LiveSnapshot; eur: number } | undefined {
  const candidates = snapshotsForSku(skuId).filter((s) => s.inStock);
  if (!candidates.length) return undefined;
  let best = candidates[0];
  let bestEur = seed.toEUR(best.price, best.currency);
  for (const c of candidates.slice(1)) {
    const eur = seed.toEUR(c.price, c.currency);
    if (eur < bestEur) { best = c; bestEur = eur; }
  }
  return { snap: best, eur: bestEur };
}

export function bestPriceInCountry(skuId: string, country: CountryCode): LiveSnapshot | undefined {
  const ids = new Set(seed.RETAILERS.filter((r) => r.country === country).map((r) => r.id));
  const candidates = snapshotsForSku(skuId).filter((s) => ids.has(s.retailerId) && s.inStock);
  if (!candidates.length) return undefined;
  return candidates.reduce((a, b) => (seed.toEUR(b.price, b.currency) < seed.toEUR(a.price, a.currency) ? b : a));
}

export function countriesWithCoverage(): Country[] {
  const covered = new Set(PRICE_SNAPSHOTS.map((s) => RETAILER_BY_ID[s.retailerId]?.country).filter(Boolean));
  return seed.COUNTRIES.filter((c) => covered.has(c.code));
}

/** "checked 15 May" / "live · 10 Sep" label for a row. */
export function checkedLabel(s: LiveSnapshot): string {
  const d = new Date(s.scrapedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return s.live ? `live · ${d}` : `checked ${d}`;
}
