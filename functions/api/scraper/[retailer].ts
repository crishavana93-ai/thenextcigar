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
      { url: "https://www.noblego.de/cohiba-behike-52/",        skuHint: "cohiba-behike-52" },
      { url: "https://www.noblego.de/cohiba-siglo-iv/",         skuHint: "cohiba-siglo-iv" },
      { url: "https://www.noblego.de/cohiba-esplendidos/",      skuHint: "cohiba-esplendidos" },
      { url: "https://www.noblego.de/montecristo-no-4/",        skuHint: "montecristo-no-4" },
      { url: "https://www.noblego.de/montecristo-no-2/",        skuHint: "montecristo-no-2" },
      { url: "https://www.noblego.de/montecristo-petit-edmundo/", skuHint: "montecristo-petit-edmundo" },
      { url: "https://www.noblego.de/partagas-serie-d-no-4/",   skuHint: "partagas-serie-d-no-4" },
      { url: "https://www.noblego.de/romeo-y-julieta-petit-coronas/", skuHint: "romeo-y-julieta-petit-coronas" },
      { url: "https://www.noblego.de/hoyo-de-monterrey-epicure-no-2/", skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://www.noblego.de/trinidad-reyes/",          skuHint: "trinidad-reyes" },
      { url: "https://www.noblego.de/bolivar-belicoso-fino/",   skuHint: "bolivar-belicosos-finos" },
    ],
  },
  "de-cigarworld": {
    country: "de",
    // Will be updated to a custom parser once debug=html reveals the markup.
    // Schema.org is the optimistic starting point.
    stack: "schema_org_jsonld",
    preferredPackSize: 25,
    pdps: [
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/cohiba-robustos-01002_13",                       skuHint: "cohiba-robustos" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/cohiba-behike-bhk-52-90008612_19690",            skuHint: "cohiba-behike-52" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/cohiba-siglo-iv-01002_17",                       skuHint: "cohiba-siglo-iv" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/cohiba-esplendidos-01002_12",                    skuHint: "cohiba-esplendidos" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/montecristo-no-4-01007_47",                      skuHint: "montecristo-no-4" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/montecristo-no-2-01007_45",                      skuHint: "montecristo-no-2" },
      { url: "https://www.cigarworld.de/zigarren/cuba/regulares/montecristo-petit-edmundo-01007_11521",          skuHint: "montecristo-petit-edmundo" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/partagas-serie-d-no-4-01008_66",                 skuHint: "partagas-serie-d-no-4" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/romeo-y-julieta-petit-coronas-01013_14101",      skuHint: "romeo-y-julieta-petit-coronas" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/hoyo-de-monterrey-epicure-no-2-01004_24",        skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/trinidad-reyes-01021_5800",                      skuHint: "trinidad-reyes" },
      { url: "https://www.cigarworld.de/zigarren/kuba/regulares/bolivar-belicosos-finos-01001_6",                skuHint: "bolivar-belicosos-finos" },
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
// Noblego (Magento backend) renders each pack-size variant as:
//
//   <span title="Verpackungseinheit">25er</span>
//   <span class="availability-icon availability-limited-instock" title="..."></span>
//   <span class="availability">
//     <span class="availability-text">Auf Lager...</span>
//   </span>
//   ...
//   <span class="product-price">
//     <span class="price">1.930,30 €</span>
//
// The PDP usually lists multiple variants (3er, 5er, 10er, 25er) — we capture
// them all and the caller picks the preferred pack size.
//
// Availability classes observed:
//   availability-instock          → in stock
//   availability-limited-instock  → in stock (limited)
//   availability-only-X-instock   → in stock (X units left)
//   availability-out-of-stock     → OOS
//   availability-nicht-lieferbar  → OOS (rare)
function parseNoblegoHtml(html: string): ParsedOffer[] {
  const offers: ParsedOffer[] = [];

  // Span ~4500 chars max between the pack-size label and the price. Empirically
  // the gap is ~1000-2000 chars of HTML; 4500 leaves headroom for variants
  // with extra promo badges.
  const rx =
    /title=["']Verpackungseinheit["'][^>]*>\s*(\d{1,3})er\s*<\/span>[\s\S]{0,4500}?availability-icon\s+availability-([a-z0-9-]+)[\s\S]{0,4500}?<span\s+class=["']price["']\s*>\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/gi;

  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    const packSize = Number(m[1]);
    const availClass = m[2].toLowerCase();
    const priceStr = m[3];
    const price = germanPriceToNumber(priceStr);
    if (!packSize || !price) continue;
    const inStock =
      !availClass.includes("out-of-stock") &&
      !availClass.includes("nicht-lieferbar") &&
      !availClass.includes("ausverkauft");
    offers.push({ packSize, price, currency: "EUR", inStock });
  }

  // Dedup — keep first occurrence per packSize.
  const dedup = new Map<number, ParsedOffer>();
  for (const o of offers) if (!dedup.has(o.packSize)) dedup.set(o.packSize, o);
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
// Schema.org price-spec parser. Reads pack size from:
//   offer.priceSpecification.eligibleQuantity (string|number|QuantitativeValue.value)
//   offer.eligibleQuantity (Cigarworld-style fallback)
//   offer.inventoryLevel.value (some Shopify shops)
// Falls back to 25 only if none of those are present.
function readPackSize(offer: Record<string, unknown>): number {
  const tryNumeric = (v: unknown): number | null => {
    if (v == null) return null;
    if (typeof v === "number" && v > 0 && v <= 100) return Math.round(v);
    if (typeof v === "string") {
      const n = parseFloat(v);
      if (!Number.isNaN(n) && n > 0 && n <= 100) return Math.round(n);
    }
    if (typeof v === "object") {
      const obj = v as Record<string, unknown>;
      // QuantitativeValue: { @type: "QuantitativeValue", value: "25" }
      return tryNumeric(obj.value);
    }
    return null;
  };
  const ps = offer.priceSpecification;
  if (ps && typeof ps === "object") {
    const psObj = ps as Record<string, unknown>;
    const n = tryNumeric(psObj.eligibleQuantity);
    if (n) return n;
  }
  const direct = tryNumeric(offer.eligibleQuantity);
  if (direct) return direct;
  const inv = offer.inventoryLevel;
  if (inv && typeof inv === "object") {
    const invObj = inv as Record<string, unknown>;
    const n = tryNumeric(invObj.value);
    if (n) return n;
  }
  return 25;
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
        const packSize = readPackSize(offer);
        offers.push({ packSize, price, currency, inStock });
      }
    }
  }
  // Dedup by packSize — same retailer may list duplicate offers; keep first.
  const dedup = new Map<number, ParsedOffer>();
  for (const o of offers) if (!dedup.has(o.packSize)) dedup.set(o.packSize, o);
  return Array.from(dedup.values());
}

// Real-browser User-Agent. Many EU shops (incl. Noblego) gate price markup
// behind a UA check and serve a stripped/empty page to non-browser fetchers.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const BROWSER_HEADERS: Record<string, string> = {
  "user-agent": BROWSER_UA,
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "de-DE,de;q=0.9,en;q=0.8",
  "accept-encoding": "gzip, deflate, br",
  "cache-control": "no-cache",
  "pragma": "no-cache",
  "sec-ch-ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"macOS"',
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
};

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

  // ?debug=html → fetch only the first PDP and return a snippet of the raw HTML.
  // Used to verify what bytes the Worker actually receives from the target site
  // (vs what WebFetch / a normal browser sees). NO Supabase writes in debug mode.
  const url = new URL(request.url);
  const debugMode = url.searchParams.get("debug");

  if (debugMode === "html") {
    const first = config.pdps[0];
    const res = await fetch(first.url, { headers: BROWSER_HEADERS, cf: { cacheTtl: 0 } });
    const html = res.ok ? await res.text() : "";

    // Helper: slice 1500 chars around the first index in html where one of the
    // listed needles appears (case-insensitive).
    const sliceAround = (needles: string[]): { needle: string; idx: number; slice: string } | null => {
      for (const n of needles) {
        const idx = html.toLowerCase().indexOf(n.toLowerCase());
        if (idx >= 0) return { needle: n, idx, slice: html.slice(Math.max(0, idx - 600), idx + 900) };
      }
      return null;
    };

    // ALL gtagEvent('view_item', {...}) matches — gives default variant pricing.
    const gtagMatches: Array<Record<string, unknown>> = [];
    const gtagRx = /gtagEvent\(['"]view_item['"]\s*,\s*(\{[\s\S]*?\})\)\s*;?/g;
    let gm: RegExpExecArray | null;
    while ((gm = gtagRx.exec(html)) !== null) {
      try { gtagMatches.push(JSON.parse(gm[1])); } catch { gtagMatches.push({ raw: gm[1].slice(0, 400) }); }
    }

    // First occurrence of various price indicators.
    const euroSymbol = sliceAround(["€"]);
    const euroEntity = sliceAround(["&euro;", "&#8364;"]);
    const erPattern  = sliceAround(["25er", "10er", "5er", "3er"]);
    const spConfig   = sliceAround(["spConfig", "Product.Config", "configurableSwatches", "super_attribute"]);
    const priceData  = sliceAround(["product-info-price", "price-final_price", "data-price-amount", '"final_price"', "regular-price"]);

    // ── Cigarworld-specific: dump ALL "(\d+)er Kiste" matches with surrounding
    // context so we can map each pack-size variant to its price + stock state.
    const kisteRx = /(\d{1,3})er\s+(?:Kiste|Schachtel|Tubo|Etui|Holzkiste|St(?:ü|ue)ck|Bund)/gi;
    const kisteMatches: Array<{ packSize: number; idx: number; slice: string }> = [];
    let km: RegExpExecArray | null;
    while ((km = kisteRx.exec(html)) !== null) {
      kisteMatches.push({
        packSize: Number(km[1]),
        idx: km.index,
        // 600 chars before (covers the wk_einheit input + label opening)
        // 1800 chars after (covers the avail_X status div + adjacent price)
        slice: html.slice(Math.max(0, km.index - 600), km.index + 1800),
      });
      if (kisteMatches.length >= 8) break; // PDPs have ≤6 variants
    }

    // All standalone price candidates (German format) with line context.
    const priceRx = /(\d{1,4}(?:\.\d{3})*,\d{2})\s*€/g;
    const priceMatches: Array<{ price: string; idx: number; context: string }> = [];
    let pm: RegExpExecArray | null;
    while ((pm = priceRx.exec(html)) !== null) {
      priceMatches.push({
        price: pm[1],
        idx: pm.index,
        context: html.slice(Math.max(0, pm.index - 200), pm.index + 50).replace(/\s+/g, " ").trim(),
      });
      if (priceMatches.length >= 20) break;
    }

    // All raw JSON-LD script blocks (so we can see the schema fields).
    const jsonLdBlocks: Array<{ raw: string }> = [];
    const jsonLdRx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let jm: RegExpExecArray | null;
    while ((jm = jsonLdRx.exec(html)) !== null) {
      jsonLdBlocks.push({ raw: jm[1].trim().slice(0, 2500) });
      if (jsonLdBlocks.length >= 5) break;
    }

    // Run current parser anyway to confirm it returns 0.
    const parsed = config.stack === "noblego_html" ? parseNoblegoHtml(html) : parseSchemaOrg(html);

    return json({
      ok: true,
      debug: "html",
      url: first.url,
      status: res.status,
      contentType: res.headers.get("content-type"),
      contentLength: html.length,
      parsedOffers: parsed,
      gtagViewItem: gtagMatches,
      snippets: {
        euroSymbol,
        euroEntity,
        erPattern,
        spConfig,
        priceData,
      },
      cigarworldDebug: {
        kisteMatches,
        priceMatches,
        jsonLdBlocks,
      },
    });
  }

  const scrapedAt = new Date().toISOString();
  const rowsToInsert: Array<Record<string, unknown>> = [];
  const debugLog: Array<Record<string, unknown>> = [];
  const errors: string[] = [];
  let bytesDownloaded = 0;

  for (const pdp of config.pdps) {
    try {
      const res = await fetch(pdp.url, {
        headers: BROWSER_HEADERS,
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

      debugLog.push({
        url: pdp.url,
        status: 200,
        bytes: html.length,
        offersFound: parsed.length,
        packsFound: parsed.map((p) => `${p.packSize}@${p.price}${p.inStock ? "" : "(OOS)"}`),
      });

      if (parsed.length === 0) {
        errors.push(`${pdp.url}: parser found 0 offers`);
        continue;
      }

      // Write ALL pack-size variants — the migration 023 view dedups on
      // (sku, retailer_id, pack_size) so per-pack price comparison works.
      // The SKU page hydration prefers the canonical box size and falls
      // back to in-stock packs at the same per-cigar price.
      for (const offer of parsed) {
        rowsToInsert.push({
          sku: pdp.skuHint || null,
          retailer_id: retailerId,
          pack_size: offer.packSize,
          price: offer.price,
          currency: offer.currency,
          price_eur: Math.round(offer.price * FX_TO_EUR[offer.currency] * 100) / 100,
          in_stock: offer.inStock,
          source_url: pdp.url,
          country_code: config.country,
          parser: config.stack,
          scraped_at: scrapedAt,
        });
      }
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
  json(
    {
      ok: false,
      error: "POST only (with X-Scraper-Token header)",
      hint: "Add ?debug=html to a POST to inspect raw HTML the Worker receives.",
    },
    405
  );
