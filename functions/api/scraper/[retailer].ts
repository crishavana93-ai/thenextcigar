// Cloudflare Pages Function — POST /api/scraper/[retailer]
// ---------------------------------------------------------------------------
// Manual-trigger scraper endpoint. POST here with retailer ID in path to
// scrape that retailer's startUrls, parse offers, and upsert into
// finder_price_snapshots.
//
// Auth: requires X-Scraper-Token header matching SCRAPER_ADMIN_TOKEN env var.
//
// Example:
//   curl -X POST https://thenextcigar.com/api/scraper/de-noblego \
//     -H "X-Scraper-Token: <secret>"
//
// Per-retailer parsing dispatches on `stack` field in SCRAPERS config.

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

const FX_TO_EUR: Record<string, number> = {
  EUR: 1.000, CHF: 1.050, SEK: 0.087, GBP: 1.190, DKK: 0.134, NOK: 0.087,
};

// ─── Scraper configs ─────────────────────────────────────────────────────────
type ParserStack = "schema_org_jsonld" | "noblego_html" | "cigarworld_html";

interface PdpUrl {
  url: string;
  // Override SKU classification if the title regex isn't reliable enough.
  skuHint?: string;
}

interface ScraperConfig {
  country: string;
  stack: ParserStack;
  // Pack size to scrape — typically 25 for box-of-25 Cuban premium SKUs.
  // The parser will pick that pack out of multi-pack PDPs.
  preferredPackSize: number;
  // PDPs to scrape. One product page per canonical SKU we want priced.
  pdps: PdpUrl[];
}

const SCRAPERS: Record<string, ScraperConfig> = {
  "de-noblego": {
    country: "de",
    stack: "noblego_html",
    preferredPackSize: 25,
    pdps: [
      { url: "https://www.noblego.de/cohiba-robusto-zigarre/", skuHint: "cohiba-robustos" },
      { url: "https://www.noblego.de/cohiba-behike-bhk-52/",    skuHint: "cohiba-behike-52" },
      { url: "https://www.noblego.de/cohiba-siglo-iv/",         skuHint: "cohiba-siglo-iv" },
      { url: "https://www.noblego.de/cohiba-esplendidos/",      skuHint: "cohiba-esplendidos" },
      { url: "https://www.noblego.de/montecristo-no-4/",        skuHint: "montecristo-no-4" },
      { url: "https://www.noblego.de/montecristo-no-2/",        skuHint: "montecristo-no-2" },
      { url: "https://www.noblego.de/montecristo-petit-edmundo/", skuHint: "montecristo-petit-edmundo" },
      { url: "https://www.noblego.de/partagas-serie-d-no-4/",   skuHint: "partagas-serie-d-no-4" },
      { url: "https://www.noblego.de/romeo-y-julieta-petit-coronas/", skuHint: "romeo-y-julieta-petit-coronas" },
      { url: "https://www.noblego.de/hoyo-de-monterrey-epicure-no-2/", skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://www.noblego.de/trinidad-reyes/",          skuHint: "trinidad-reyes" },
      { url: "https://www.noblego.de/bolivar-belicosos-finos/", skuHint: "bolivar-belicosos-finos" },
    ],
  },
  "de-cigarworld": {
    country: "de",
    stack: "schema_org_jsonld",  // verify on first scrape; may need custom too
    preferredPackSize: 25,
    pdps: [
      { url: "https://www.cigarworld.de/zigarren/kuba/cohiba/cohiba-robustos.html",     skuHint: "cohiba-robustos" },
      { url: "https://www.cigarworld.de/zigarren/kuba/cohiba/cohiba-behike-52.html",    skuHint: "cohiba-behike-52" },
      { url: "https://www.cigarworld.de/zigarren/kuba/cohiba/cohiba-siglo-iv.html",     skuHint: "cohiba-siglo-iv" },
      { url: "https://www.cigarworld.de/zigarren/kuba/montecristo/montecristo-no-4.html", skuHint: "montecristo-no-4" },
      { url: "https://www.cigarworld.de/zigarren/kuba/montecristo/montecristo-no-2.html", skuHint: "montecristo-no-2" },
      { url: "https://www.cigarworld.de/zigarren/kuba/partagas/partagas-serie-d-no-4.html", skuHint: "partagas-serie-d-no-4" },
      { url: "https://www.cigarworld.de/zigarren/kuba/hoyo-de-monterrey/hoyo-de-monterrey-epicure-no-2.html", skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://www.cigarworld.de/zigarren/kuba/trinidad/trinidad-reyes.html",    skuHint: "trinidad-reyes" },
      { url: "https://www.cigarworld.de/zigarren/kuba/bolivar/bolivar-belicosos-finos.html", skuHint: "bolivar-belicosos-finos" },
    ],
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────
function germanPriceToNumber(s: string): number {
  // "358,90" -> 358.90 ; "1.230,45" -> 1230.45
  return parseFloat(s.replace(/\./g, "").replace(",", "."));
}

interface ParsedOffer {
  packSize: number;     // 25, 10, 5, etc.
  price: number;
  currency: string;
  inStock: boolean;
}

// ─── Noblego HTML parser ───────────────────────────────────────────────────
// Pattern: "(25er|Einzeln) <stock status> <price> €"
//   - "25er Momentan ausverkauft, Liefertermin unbekannt 358,90 €"  -> 25, 358.90, OOS
//   - "25er Sofort verfügbar 358,90 €"                              -> 25, 358.90, IN
function parseNoblegoHtml(html: string): ParsedOffer[] {
  const offers: ParsedOffer[] = [];
  // Capture: (pack)(any non-price text)(price)
  // The stock status sits between pack size and price; we classify after.
  const rx = /(?:^|\s|>|\|)\s*(\d{1,3})er\s+([^0-9]{0,200}?)\s+(\d{1,3}(?:[.,]\d{3})*,\d{2})\s*€/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    const packSize = Number(m[1]);
    const between = m[2].toLowerCase();
    const priceStr = m[3];
    const price = germanPriceToNumber(priceStr);
    if (!packSize || !price) continue;
    // Stock status detection — German + English fallbacks.
    const inStock = !(
      between.includes("ausverkauft") ||
      between.includes("nicht verfügbar") ||
      between.includes("nicht lieferbar") ||
      between.includes("out of stock") ||
      between.includes("unavailable")
    );
    offers.push({ packSize, price, currency: "EUR", inStock });
  }
  // Dedup — keep one per packSize (Noblego sometimes lists the same pack twice).
  const dedup = new Map<number, ParsedOffer>();
  for (const o of offers) {
    if (!dedup.has(o.packSize)) dedup.set(o.packSize, o);
  }
  return Array.from(dedup.values());
}

// ─── schema.org JSON-LD parser (kept for cigarworld + future targets) ──────
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
function parseSchemaOrg(html: string): ParsedOffer[] {
  const offers: ParsedOffer[] = [];
  for (const block of extractJsonLdBlocks(html)) {
    for (const product of iterateProducts(block)) {
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
        offers.push({ packSize: 25, price, currency, inStock });
      }
    }
  }
  return offers;
}

// ─── Endpoint ──────────────────────────────────────────────────────────────
export const onRequestPost: PagesFunction<Env, "retailer"> = async (ctx) => {
  const { env, params, request } = ctx;

  const token = request.headers.get("x-scraper-token");
  if (!env.SCRAPER_ADMIN_TOKEN || token !== env.SCRAPER_ADMIN_TOKEN) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const retailerId = String(params.retailer || "").toLowerCase();
  const config = SCRAPERS[retailerId];
  if (!config) return json({ ok: false, error: "unknown retailer", retailerId }, 404);

  const scrapedAt = new Date().toISOString();
  const rowsToInsert: Array<Record<string, unknown>> = [];
  const debugLog: Array<Record<string, unknown>> = [];
  const errors: string[] = [];
  let bytesDownloaded = 0;

  for (const pdp of config.pdps) {
    try {
      const res = await fetch(pdp.url, {
        headers: { "user-agent": "TheNextCigar-Finder/1.0 (+https://thenextcigar.com/finder/)" },
        cf: { cacheTtl: 0 },
      });
      if (!res.ok) {
        errors.push(`${pdp.url}: HTTP ${res.status}`);
        debugLog.push({ url: pdp.url, status: res.status, offers: 0 });
        continue;
      }
      const html = await res.text();
      bytesDownloaded += html.length;

      // Dispatch on stack
      let parsed: ParsedOffer[];
      if (config.stack === "noblego_html") parsed = parseNoblegoHtml(html);
      else parsed = parseSchemaOrg(html);

      // Pick the preferred pack size; fall back to any pack if not present.
      const picked = parsed.find((o) => o.packSize === config.preferredPackSize) ?? parsed[0];

      debugLog.push({
        url: pdp.url,
        status: 200,
        offersFound: parsed.length,
        packsFound: parsed.map((p) => `${p.packSize}@${p.price}`),
      });

      if (!picked) {
        errors.push(`${pdp.url}: parser found 0 offers`);
        continue;
      }

      rowsToInsert.push({
        sku: pdp.skuHint || null,
        retailer_id: retailerId,
        price: picked.price,
        currency: picked.currency,
        price_eur: Math.round(picked.price * FX_TO_EUR[picked.currency] * 100) / 100,
        in_stock: picked.inStock,
        source_url: pdp.url,
        country_code: config.country,
        parser: config.stack,
        scraped_at: scrapedAt,
      });
    } catch (e: any) {
      errors.push(`${pdp.url}: ${e?.message || "fetch failed"}`);
    }
  }

  // Insert into Supabase
  let inserted = 0;
  if (rowsToInsert.length) {
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
        body: JSON.stringify(rowsToInsert),
      }
    );
    if (r.ok) inserted = rowsToInsert.length;
    else errors.push(`supabase insert failed: HTTP ${r.status} ${await r.text()}`);
  }

  return json({
    ok: errors.length === 0 && inserted > 0,
    retailerId,
    scrapedAt,
    stats: {
      pdpsScraped: config.pdps.length,
      bytesDownloaded,
      rowsExtracted: rowsToInsert.length,
      inserted,
    },
    errors,
    debugLog,
    sampleRows: rowsToInsert.slice(0, 5),
  });
};

export const onRequestGet: PagesFunction<Env> = async () =>
  json({ ok: false, error: "POST only (with X-Scraper-Token header)" }, 405);
