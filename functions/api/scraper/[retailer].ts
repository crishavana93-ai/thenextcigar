// Cloudflare Pages Function — POST /api/scraper/[retailer]
// ---------------------------------------------------------------------------
// Manual-trigger scraper endpoint. POST here with retailer ID in path to
// scrape that retailer's startUrls, parse offers, and upsert into
// finder_price_snapshots. Used during development to validate parsers before
// the production cron Worker is wired up.
//
// Auth: requires X-Scraper-Token header matching SCRAPER_ADMIN_TOKEN env var.
//       This is a Cris-only endpoint until cron is in place.
//
// Example:
//   curl -X POST https://thenextcigar.com/api/scraper/de-noblego \
//     -H "X-Scraper-Token: <secret>"

// Note: this Function imports the parser registry at runtime. Cloudflare Pages
// Functions bundle the imported modules so /src/lib/scrapers/ is available.

interface Env {
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SCRAPER_ADMIN_TOKEN: string;
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// FX rates — duplicated here from finder-data.ts because Pages Functions
// can't reliably import .ts files outside /functions in all Cloudflare builds.
// In a follow-up commit we'll move this to a shared edge-safe module.
const FX_TO_EUR: Record<string, number> = {
  EUR: 1.000, CHF: 1.050, SEK: 0.087, GBP: 1.190, DKK: 0.134, NOK: 0.087,
};

// Map each scrape-grade retailer id to a config object. We hard-code the
// startUrls + country here so the Function doesn't have to import the parser
// registry (which keeps the Function's bundle size tiny).
type ScraperConfig = {
  country: string;
  startUrls: string[];
};
const SCRAPERS: Record<string, ScraperConfig> = {
  "de-noblego": {
    country: "de",
    startUrls: [
      "https://www.noblego.de/cohiba/",
      "https://www.noblego.de/montecristo/",
      "https://www.noblego.de/partagas/",
      "https://www.noblego.de/romeo-y-julieta/",
      "https://www.noblego.de/hoyo-de-monterrey/",
      "https://www.noblego.de/trinidad/",
      "https://www.noblego.de/bolivar/",
    ],
  },
  "de-cigarworld": {
    country: "de",
    startUrls: [
      "https://www.cigarworld.de/zigarren/kuba/cohiba/",
      "https://www.cigarworld.de/zigarren/kuba/montecristo/",
      "https://www.cigarworld.de/zigarren/kuba/partagas/",
      "https://www.cigarworld.de/zigarren/kuba/romeo-y-julieta/",
      "https://www.cigarworld.de/zigarren/kuba/hoyo-de-monterrey/",
      "https://www.cigarworld.de/zigarren/kuba/trinidad/",
      "https://www.cigarworld.de/zigarren/kuba/bolivar/",
    ],
  },
};

// ─── schema.org JSON-LD parser (inlined for edge-safety) ────────────────────
function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const rx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    try { blocks.push(JSON.parse(m[1].trim())); }
    catch { try { blocks.push(JSON.parse(m[1].trim().replace(/,(\s*[}\]])/g, "$1"))); } catch {} }
  }
  return blocks;
}
function* iterateProducts(node: unknown): Generator<Record<string, unknown>> {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) { for (const n of node) yield* iterateProducts(n); return; }
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  const isProduct = t === "Product" || (Array.isArray(t) && t.includes("Product"));
  if (isProduct) yield obj;
  if (Array.isArray(obj["@graph"])) yield* iterateProducts(obj["@graph"]);
}

// ─── SKU matcher (inlined) ─────────────────────────────────────────────────
const CANONICAL_SKUS = [
  { slug: "cohiba-behike-52",       brand: "cohiba",      tokens: ["behike"],            mustContain: ["52"] },
  { slug: "cohiba-siglo-iv",        brand: "cohiba",      tokens: ["siglo"],             mustContain: ["iv","4"] },
  { slug: "cohiba-esplendidos",     brand: "cohiba",      tokens: ["esplendidos","espléndidos"] },
  { slug: "cohiba-robustos",        brand: "cohiba",      tokens: ["robusto"] },
  { slug: "montecristo-no-2",       brand: "montecristo", tokens: [],                    mustContain: ["2"] },
  { slug: "montecristo-no-4",       brand: "montecristo", tokens: [],                    mustContain: ["4"] },
  { slug: "montecristo-petit-edmundo", brand: "montecristo", tokens: ["petit","edmundo"] },
  { slug: "partagas-serie-d-no-4",  brand: "partag",      tokens: ["serie","d"],         mustContain: ["4"] },
  { slug: "romeo-y-julieta-petit-coronas", brand: "romeo", tokens: ["petit","corona"] },
  { slug: "hoyo-de-monterrey-epicure-no-2", brand: "hoyo", tokens: ["epicure"],          mustContain: ["2"] },
  { slug: "trinidad-reyes",         brand: "trinidad",    tokens: ["reyes"] },
  { slug: "bolivar-belicosos-finos", brand: "bol",        tokens: ["belicoso"] },
];
function normalize(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function matchSku(title: string): string | null {
  const t = normalize(title);
  if (!t) return null;
  for (const sku of CANONICAL_SKUS) {
    if (!t.includes(sku.brand)) continue;
    const allTokens = sku.tokens.every((tok) => t.includes(normalize(tok)));
    if (!allTokens) continue;
    if (sku.mustContain) {
      const ok = sku.mustContain.every((m) => new RegExp(`\\b${m}\\b`).test(t));
      if (!ok) continue;
    }
    return sku.slug;
  }
  return null;
}

// ─── Endpoint ──────────────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env, "retailer"> = async (ctx) => {
  const { env, params, request } = ctx;

  // Auth gate
  const token = request.headers.get("x-scraper-token");
  if (!env.SCRAPER_ADMIN_TOKEN || token !== env.SCRAPER_ADMIN_TOKEN) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const retailerId = String(params.retailer || "").toLowerCase();
  const config = SCRAPERS[retailerId];
  if (!config) return json({ ok: false, error: "unknown retailer", retailerId }, 404);

  const scrapedAt = new Date().toISOString();
  const offers: Array<Record<string, unknown>> = [];
  const errors: string[] = [];
  let bytesDownloaded = 0;

  for (const url of config.startUrls) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "TheNextCigar-Finder/1.0 (+https://thenextcigar.com/finder/)" },
        cf: { cacheTtl: 0 }, // do not cache
      });
      if (!res.ok) { errors.push(`${url}: HTTP ${res.status}`); continue; }
      const html = await res.text();
      bytesDownloaded += html.length;

      for (const block of extractJsonLdBlocks(html)) {
        for (const product of iterateProducts(block)) {
          const title = String((product.name as string) || "");
          if (!title) continue;
          const offerList = Array.isArray(product.offers) ? product.offers : product.offers ? [product.offers] : [];
          for (const o of offerList) {
            if (!o || typeof o !== "object") continue;
            const offer = o as Record<string, unknown>;
            const price = parseFloat(String(offer.price ?? offer.lowPrice ?? ""));
            if (Number.isNaN(price) || price <= 0) continue;
            const currency = String(offer.priceCurrency ?? "EUR").toUpperCase();
            if (!FX_TO_EUR[currency]) continue;
            const availability = String(offer.availability ?? "").toLowerCase();
            const inStock = !availability || availability.includes("instock");
            const sourceUrl = String(offer.url ?? product.url ?? url);
            const skuSlug = matchSku(title);
            offers.push({
              sku: skuSlug, raw_title: title, retailer_id: retailerId,
              price, currency, price_eur: Math.round(price * FX_TO_EUR[currency] * 100) / 100,
              in_stock: inStock, source_url: sourceUrl, country_code: config.country,
              parser: "schema_org", scraped_at: scrapedAt,
            });
          }
        }
      }
    } catch (e: any) {
      errors.push(`${url}: ${e?.message || "fetch failed"}`);
    }
  }

  // Filter to offers where we could classify the SKU (others go to a triage log).
  const classified = offers.filter((o) => o.sku);
  const unclassified = offers.filter((o) => !o.sku);

  // Upsert classified offers into finder_price_snapshots.
  let inserted = 0;
  if (classified.length) {
    // Strip raw_title from rows we insert (the column is sku-classified only).
    const rows = classified.map(({ raw_title, ...rest }) => rest);
    const r = await fetch(
      `${env.PUBLIC_SUPABASE_URL}/rest/v1/finder_price_snapshots`,
      {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(rows),
      }
    );
    if (r.ok) inserted = rows.length;
    else errors.push(`supabase insert failed: HTTP ${r.status} ${await r.text()}`);
  }

  return json({
    ok: errors.length === 0,
    retailerId,
    scrapedAt,
    stats: {
      pagesFetched: config.startUrls.length,
      bytesDownloaded,
      offersTotal: offers.length,
      classified: classified.length,
      unclassified: unclassified.length,
      inserted,
    },
    errors,
    sampleClassified: classified.slice(0, 5),
    sampleUnclassified: unclassified.slice(0, 10).map((o) => ({ raw_title: o.raw_title, price: o.price, currency: o.currency })),
  });
};

export const onRequestGet: PagesFunction<Env> = async () =>
  json({ ok: false, error: "POST only (with X-Scraper-Token header)" }, 405);
