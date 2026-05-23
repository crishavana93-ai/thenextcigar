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

// Map an ISO country code to its primary trading currency. Used when the
// retailer's response body doesn't carry the currency natively (Shopify's
// /products/{slug}.json endpoint is a per-product view that doesn't include
// the shop-level currency).
function currencyForCountry(country: string): string {
  const map: Record<string, string> = {
    de: "EUR", at: "EUR", nl: "EUR", be: "EUR", fr: "EUR", es: "EUR",
    it: "EUR", ie: "EUR", pt: "EUR", gr: "EUR", lu: "EUR", fi: "EUR",
    ch: "CHF", uk: "GBP", gb: "GBP", se: "SEK", dk: "DKK", no: "NOK",
  };
  return map[country.toLowerCase()] || "EUR";
}

// ─── Scraper configs ─────────────────────────────────────────────────────────
type ParserStack = "schema_org_jsonld" | "noblego_html" | "cigarworld_html" | "havanahouse_html" | "cigarmust_html" | "shopify_json";

interface PdpUrl {
  url: string;
  // Override SKU classification if the title regex isn't reliable enough.
  skuHint?: string;
  // Optional pack-size override. Use when the retailer splits each pack-size
  // into a SEPARATE PDP (like Havana House: ".../cohiba-robusto-box-of-25/"
  // vs ".../cohiba-robusto-cigar-single/") and the JSON-LD doesn't carry
  // eligibleQuantity. The scraper applies this AFTER parsing to overwrite
  // whatever pack size the schema.org parser inferred.
  packSize?: number;
}

interface ScraperConfig {
  country: string;
  stack: ParserStack;
  // Pack size to scrape — typically 25 for box-of-25 Cuban premium SKUs.
  // The parser will pick that pack out of multi-pack PDPs.
  preferredPackSize: number;
  // Skip the live scrape entirely — keep config (PDP URLs, etc.) for
  // documentation but don't write rows to Supabase. Use when a retailer's
  // markup hides prices from server-side scraping (e.g. Havana House
  // renders prices client-side via JS, blocking regex extraction).
  disabled?: boolean;
  // Sanity floor — reject any offer with price_eur below this. No Cuban
  // box-of-25 costs < €20, so anything below catches accessory upsells,
  // sample items, or VAT/shipping notices that match the price regex.
  minPriceEur?: number;
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
      { url: "https://www.noblego.de/cohiba-siglo-vi/", skuHint: "cohiba-siglo-vi" },
      { url: "https://www.noblego.de/montecristo-edmundo/", skuHint: "montecristo-edmundo" },
      { url: "https://www.noblego.de/romeo-y-julieta-wide-churchills/", skuHint: "romeo-y-julieta-wide-churchills" },
      { url: "https://www.noblego.de/partagas-lusitanias/", skuHint: "partagas-lusitanias" },
      { url: "https://www.noblego.de/h-upmann-magnum-46/", skuHint: "h-upmann-magnum-46" },
      { url: "https://www.noblego.de/cohiba-siglo-ii/", skuHint: "cohiba-siglo-ii" },
      { url: "https://www.noblego.de/romeo-y-julieta-short-churchills/", skuHint: "romeo-y-julieta-short-churchills" },
      { url: "https://www.noblego.de/bolivar-royal-coronas/", skuHint: "bolivar-royal-coronas" },
      { url: "https://www.noblego.de/hoyo-de-monterrey-epicure-especial/", skuHint: "hoyo-de-monterrey-epicure-especial" },
      { url: "https://www.noblego.de/trinidad-vigia/", skuHint: "trinidad-vigia" },
      { url: "https://www.noblego.de/montecristo-no-5/", skuHint: "montecristo-no-5" },
      { url: "https://www.noblego.de/cohiba-medio-siglo/", skuHint: "cohiba-medio-siglo" },
      { url: "https://www.noblego.de/partagas-serie-e-no-2/", skuHint: "partagas-serie-e-no-2" },
      { url: "https://www.noblego.de/hoyo-de-monterrey-le-hoyo-de-rio-seco/", skuHint: "hoyo-de-monterrey-le-hoyo-de-rio-seco" },
      { url: "https://www.noblego.de/h-upmann-magnum-50/", skuHint: "h-upmann-magnum-50" },
      { url: "https://www.noblego.de/romeo-y-julieta-churchill/", skuHint: "romeo-y-julieta-churchill" },
      { url: "https://www.noblego.de/cohiba-maduro-5-magicos/", skuHint: "cohiba-maduro-5-magicos" },
      { url: "https://www.noblego.de/trinidad-coloniales/", skuHint: "trinidad-coloniales" },
      { url: "https://www.noblego.de/bolivar-petit-coronas/", skuHint: "bolivar-petit-coronas" },
      { url: "https://www.noblego.de/partagas-serie-d-no-6/", skuHint: "partagas-serie-d-no-6" },
      { url: "https://www.noblego.de/montecristo-open-junior/", skuHint: "montecristo-open-junior" },
      { url: "https://www.noblego.de/montecristo-double-edmundo/", skuHint: "montecristo-double-edmundo" },
      { url: "https://www.noblego.de/cohiba-siglo-iii/", skuHint: "cohiba-siglo-iii" },
      { url: "https://www.noblego.de/romeo-y-julieta-no-1-tubos/", skuHint: "romeo-y-julieta-no-1-tubos" },
      { url: "https://www.noblego.de/h-upmann-connoisseur-no-1/", skuHint: "h-upmann-connoisseur-no-1" },
      { url: "https://www.noblego.de/juan-lopez-seleccion-no-1/", skuHint: "juan-lopez-seleccion-no-1" },
      { url: "https://www.noblego.de/vegas-robaina-famosos/", skuHint: "vegas-robaina-famosos" },
      { url: "https://www.noblego.de/quai-d-orsay-no-50/", skuHint: "quai-d-orsay-no-50" },
      { url: "https://www.noblego.de/ramon-allones-specially-selected/", skuHint: "ramon-allones-specially-selected" },
      { url: "https://www.noblego.de/saint-luis-rey-regios/", skuHint: "saint-luis-rey-regios" },
      { url: "https://www.noblego.de/el-rey-del-mundo-choix-supreme/", skuHint: "el-rey-del-mundo-choix-supreme" },
      { url: "https://www.noblego.de/por-larranaga-petit-coronas/", skuHint: "por-larranaga-petit-coronas" },
      { url: "https://www.noblego.de/la-gloria-cubana-medaille-d-or-no-4/", skuHint: "la-gloria-cubana-medaille-d-or-no-4" },
      { url: "https://www.noblego.de/diplomaticos-no-2/", skuHint: "diplomaticos-no-2" },
      { url: "https://www.noblego.de/san-cristobal-la-punta/", skuHint: "san-cristobal-la-punta" },
      { url: "https://www.noblego.de/sancho-panza-belicosos/", skuHint: "sancho-panza-belicosos" },
      { url: "https://www.noblego.de/rafael-gonzalez-petit-coronas/", skuHint: "rafael-gonzalez-petit-coronas" },
      { url: "https://www.noblego.de/jose-l-piedra-brevas/", skuHint: "jose-l-piedra-brevas" },
      { url: "https://www.noblego.de/quintero-brevas/", skuHint: "quintero-brevas" },
      { url: "https://www.noblego.de/fonseca-cosacos/", skuHint: "fonseca-cosacos" },
    ],
  },
  "de-cigarmaxx": {
    country: "de",
    // Cigarmaxx.de is owned by Solid Taste GmbH — same parent as Noblego — and
    // serves identical Magento markup. We reuse parseNoblegoHtml; the regex
    // additionally accepts "Einzeln" as a single-cigar pack label.
    stack: "noblego_html",
    preferredPackSize: 25,
    pdps: [
      { url: "https://www.cigarmaxx.de/cohiba-robusto-zigarre/",              skuHint: "cohiba-robustos" },
      { url: "https://www.cigarmaxx.de/cohiba-behike-52/",                    skuHint: "cohiba-behike-52" },
      { url: "https://www.cigarmaxx.de/cohiba-siglo-iv/",                     skuHint: "cohiba-siglo-iv" },
      { url: "https://www.cigarmaxx.de/cohiba-esplendidos/",                  skuHint: "cohiba-esplendidos" },
      { url: "https://www.cigarmaxx.de/montecristo-no-4/",                    skuHint: "montecristo-no-4" },
      { url: "https://www.cigarmaxx.de/montecristo-no-2/",                    skuHint: "montecristo-no-2" },
      { url: "https://www.cigarmaxx.de/montecristo-petit-edmundo/",           skuHint: "montecristo-petit-edmundo" },
      { url: "https://www.cigarmaxx.de/partagas-serie-d-no-4/",               skuHint: "partagas-serie-d-no-4" },
      { url: "https://www.cigarmaxx.de/romeo-y-julieta-petit-coronas/",       skuHint: "romeo-y-julieta-petit-coronas" },
      { url: "https://www.cigarmaxx.de/hoyo-de-monterrey-epicure-no-2/",      skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://www.cigarmaxx.de/trinidad-reyes/",                      skuHint: "trinidad-reyes" },
      { url: "https://www.cigarmaxx.de/bolivar-belicoso-fino/",               skuHint: "bolivar-belicosos-finos" },
      { url: "https://www.cigarmaxx.de/cohiba-siglo-vi/", skuHint: "cohiba-siglo-vi" },
      { url: "https://www.cigarmaxx.de/montecristo-edmundo/", skuHint: "montecristo-edmundo" },
      { url: "https://www.cigarmaxx.de/romeo-y-julieta-wide-churchills/", skuHint: "romeo-y-julieta-wide-churchills" },
      { url: "https://www.cigarmaxx.de/partagas-lusitanias/", skuHint: "partagas-lusitanias" },
      { url: "https://www.cigarmaxx.de/h-upmann-magnum-46/", skuHint: "h-upmann-magnum-46" },
      { url: "https://www.cigarmaxx.de/cohiba-siglo-ii/", skuHint: "cohiba-siglo-ii" },
      { url: "https://www.cigarmaxx.de/romeo-y-julieta-short-churchills/", skuHint: "romeo-y-julieta-short-churchills" },
      { url: "https://www.cigarmaxx.de/bolivar-royal-coronas/", skuHint: "bolivar-royal-coronas" },
      { url: "https://www.cigarmaxx.de/hoyo-de-monterrey-epicure-especial/", skuHint: "hoyo-de-monterrey-epicure-especial" },
      { url: "https://www.cigarmaxx.de/trinidad-vigia/", skuHint: "trinidad-vigia" },
      { url: "https://www.cigarmaxx.de/montecristo-no-5/", skuHint: "montecristo-no-5" },
      { url: "https://www.cigarmaxx.de/cohiba-medio-siglo/", skuHint: "cohiba-medio-siglo" },
      { url: "https://www.cigarmaxx.de/partagas-serie-e-no-2/", skuHint: "partagas-serie-e-no-2" },
      { url: "https://www.cigarmaxx.de/hoyo-de-monterrey-le-hoyo-de-rio-seco/", skuHint: "hoyo-de-monterrey-le-hoyo-de-rio-seco" },
      { url: "https://www.cigarmaxx.de/h-upmann-magnum-50/", skuHint: "h-upmann-magnum-50" },
      { url: "https://www.cigarmaxx.de/romeo-y-julieta-churchill/", skuHint: "romeo-y-julieta-churchill" },
      { url: "https://www.cigarmaxx.de/cohiba-maduro-5-magicos/", skuHint: "cohiba-maduro-5-magicos" },
      { url: "https://www.cigarmaxx.de/trinidad-coloniales/", skuHint: "trinidad-coloniales" },
      { url: "https://www.cigarmaxx.de/bolivar-petit-coronas/", skuHint: "bolivar-petit-coronas" },
      { url: "https://www.cigarmaxx.de/partagas-serie-d-no-6/", skuHint: "partagas-serie-d-no-6" },
      { url: "https://www.cigarmaxx.de/montecristo-open-junior/", skuHint: "montecristo-open-junior" },
      { url: "https://www.cigarmaxx.de/montecristo-double-edmundo/", skuHint: "montecristo-double-edmundo" },
      { url: "https://www.cigarmaxx.de/cohiba-siglo-iii/", skuHint: "cohiba-siglo-iii" },
      { url: "https://www.cigarmaxx.de/romeo-y-julieta-no-1-tubos/", skuHint: "romeo-y-julieta-no-1-tubos" },
      { url: "https://www.cigarmaxx.de/h-upmann-connoisseur-no-1/", skuHint: "h-upmann-connoisseur-no-1" },
      { url: "https://www.cigarmaxx.de/juan-lopez-seleccion-no-1/", skuHint: "juan-lopez-seleccion-no-1" },
      { url: "https://www.cigarmaxx.de/vegas-robaina-famosos/", skuHint: "vegas-robaina-famosos" },
      { url: "https://www.cigarmaxx.de/quai-d-orsay-no-50/", skuHint: "quai-d-orsay-no-50" },
      { url: "https://www.cigarmaxx.de/ramon-allones-specially-selected/", skuHint: "ramon-allones-specially-selected" },
      { url: "https://www.cigarmaxx.de/saint-luis-rey-regios/", skuHint: "saint-luis-rey-regios" },
      { url: "https://www.cigarmaxx.de/el-rey-del-mundo-choix-supreme/", skuHint: "el-rey-del-mundo-choix-supreme" },
      { url: "https://www.cigarmaxx.de/por-larranaga-petit-coronas/", skuHint: "por-larranaga-petit-coronas" },
      { url: "https://www.cigarmaxx.de/la-gloria-cubana-medaille-d-or-no-4/", skuHint: "la-gloria-cubana-medaille-d-or-no-4" },
      { url: "https://www.cigarmaxx.de/diplomaticos-no-2/", skuHint: "diplomaticos-no-2" },
      { url: "https://www.cigarmaxx.de/san-cristobal-la-punta/", skuHint: "san-cristobal-la-punta" },
      { url: "https://www.cigarmaxx.de/sancho-panza-belicosos/", skuHint: "sancho-panza-belicosos" },
      { url: "https://www.cigarmaxx.de/rafael-gonzalez-petit-coronas/", skuHint: "rafael-gonzalez-petit-coronas" },
      { url: "https://www.cigarmaxx.de/jose-l-piedra-brevas/", skuHint: "jose-l-piedra-brevas" },
      { url: "https://www.cigarmaxx.de/quintero-brevas/", skuHint: "quintero-brevas" },
      { url: "https://www.cigarmaxx.de/fonseca-cosacos/", skuHint: "fonseca-cosacos" },
    ],
  },
  "ch-egmcigars": {
    country: "ch",
    // Shopify backend — exposes structured product data at /products/{slug}.json
    // including every variant (pack size) with its own price + inventory state.
    // Much cleaner than scraping HTML. EGM is Swiss (Balerna, CHF base prices)
    // despite shipping worldwide — we record CHF and let FX_TO_EUR convert.
    stack: "shopify_json",
    preferredPackSize: 25,
    pdps: [
      { url: "https://egmcigars.com/products/cohiba-robusto-slb.json",                       skuHint: "cohiba-robustos" },
      { url: "https://egmcigars.com/products/cohiba-behike-52.json",                         skuHint: "cohiba-behike-52" },
      { url: "https://egmcigars.com/products/cohiba-siglo-4-slb.json",                       skuHint: "cohiba-siglo-iv" },
      { url: "https://egmcigars.com/products/cohiba-esplendidos-bn-1.json",                  skuHint: "cohiba-esplendidos" },
      { url: "https://egmcigars.com/products/montecristo-no-4.json",                         skuHint: "montecristo-no-4" },
      { url: "https://egmcigars.com/products/montecristo-no-2.json",                         skuHint: "montecristo-no-2" },
      { url: "https://egmcigars.com/products/montecristo-petit-edmundo.json",                skuHint: "montecristo-petit-edmundo" },
      { url: "https://egmcigars.com/products/partagas-serie-d-no-4.json",                    skuHint: "partagas-serie-d-no-4" },
      { url: "https://egmcigars.com/products/romeo-y-julieta-petit-coronas.json",            skuHint: "romeo-y-julieta-petit-coronas" },
      { url: "https://egmcigars.com/products/hoyo-de-monterrey-epicure-no-2-slb.json",       skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://egmcigars.com/products/trinidad-reyes.json",                           skuHint: "trinidad-reyes" },
      { url: "https://egmcigars.com/products/bolivar-belicosos.json",                        skuHint: "bolivar-belicosos-finos" },
      { url: "https://egmcigars.com/products/cohiba-siglo-vi.json", skuHint: "cohiba-siglo-vi" },
      { url: "https://egmcigars.com/products/montecristo-edmundo.json", skuHint: "montecristo-edmundo" },
      { url: "https://egmcigars.com/products/romeo-y-julieta-wide-churchills.json", skuHint: "romeo-y-julieta-wide-churchills" },
      { url: "https://egmcigars.com/products/partagas-lusitanias.json", skuHint: "partagas-lusitanias" },
      { url: "https://egmcigars.com/products/h-upmann-magnum-46.json", skuHint: "h-upmann-magnum-46" },
      { url: "https://egmcigars.com/products/cohiba-siglo-ii.json", skuHint: "cohiba-siglo-ii" },
      { url: "https://egmcigars.com/products/romeo-y-julieta-short-churchills.json", skuHint: "romeo-y-julieta-short-churchills" },
      { url: "https://egmcigars.com/products/bolivar-royal-coronas.json", skuHint: "bolivar-royal-coronas" },
      { url: "https://egmcigars.com/products/hoyo-de-monterrey-epicure-especial.json", skuHint: "hoyo-de-monterrey-epicure-especial" },
      { url: "https://egmcigars.com/products/trinidad-vigia.json", skuHint: "trinidad-vigia" },
      { url: "https://egmcigars.com/products/montecristo-no-5.json", skuHint: "montecristo-no-5" },
      { url: "https://egmcigars.com/products/cohiba-medio-siglo.json", skuHint: "cohiba-medio-siglo" },
      { url: "https://egmcigars.com/products/partagas-serie-e-no-2.json", skuHint: "partagas-serie-e-no-2" },
      { url: "https://egmcigars.com/products/hoyo-de-monterrey-le-hoyo-de-rio-seco.json", skuHint: "hoyo-de-monterrey-le-hoyo-de-rio-seco" },
      { url: "https://egmcigars.com/products/h-upmann-magnum-50.json", skuHint: "h-upmann-magnum-50" },
      { url: "https://egmcigars.com/products/romeo-y-julieta-churchill.json", skuHint: "romeo-y-julieta-churchill" },
      { url: "https://egmcigars.com/products/cohiba-maduro-5-magicos.json", skuHint: "cohiba-maduro-5-magicos" },
      { url: "https://egmcigars.com/products/trinidad-coloniales.json", skuHint: "trinidad-coloniales" },
      { url: "https://egmcigars.com/products/bolivar-petit-coronas.json", skuHint: "bolivar-petit-coronas" },
      { url: "https://egmcigars.com/products/partagas-serie-d-no-6.json", skuHint: "partagas-serie-d-no-6" },
      { url: "https://egmcigars.com/products/montecristo-open-junior.json", skuHint: "montecristo-open-junior" },
      { url: "https://egmcigars.com/products/montecristo-double-edmundo.json", skuHint: "montecristo-double-edmundo" },
      { url: "https://egmcigars.com/products/cohiba-siglo-iii.json", skuHint: "cohiba-siglo-iii" },
      { url: "https://egmcigars.com/products/romeo-y-julieta-no-1-tubos.json", skuHint: "romeo-y-julieta-no-1-tubos" },
      { url: "https://egmcigars.com/products/h-upmann-connoisseur-no-1.json", skuHint: "h-upmann-connoisseur-no-1" },
      { url: "https://egmcigars.com/products/juan-lopez-seleccion-no-1.json", skuHint: "juan-lopez-seleccion-no-1" },
      { url: "https://egmcigars.com/products/vegas-robaina-famosos.json", skuHint: "vegas-robaina-famosos" },
      { url: "https://egmcigars.com/products/quai-d-orsay-no-50.json", skuHint: "quai-d-orsay-no-50" },
      { url: "https://egmcigars.com/products/ramon-allones-specially-selected.json", skuHint: "ramon-allones-specially-selected" },
      { url: "https://egmcigars.com/products/saint-luis-rey-regios.json", skuHint: "saint-luis-rey-regios" },
      { url: "https://egmcigars.com/products/el-rey-del-mundo-choix-supreme.json", skuHint: "el-rey-del-mundo-choix-supreme" },
      { url: "https://egmcigars.com/products/por-larranaga-petit-coronas.json", skuHint: "por-larranaga-petit-coronas" },
      { url: "https://egmcigars.com/products/la-gloria-cubana-medaille-d-or-no-4.json", skuHint: "la-gloria-cubana-medaille-d-or-no-4" },
      { url: "https://egmcigars.com/products/diplomaticos-no-2.json", skuHint: "diplomaticos-no-2" },
      { url: "https://egmcigars.com/products/san-cristobal-la-punta.json", skuHint: "san-cristobal-la-punta" },
      { url: "https://egmcigars.com/products/sancho-panza-belicosos.json", skuHint: "sancho-panza-belicosos" },
      { url: "https://egmcigars.com/products/rafael-gonzalez-petit-coronas.json", skuHint: "rafael-gonzalez-petit-coronas" },
      { url: "https://egmcigars.com/products/jose-l-piedra-brevas.json", skuHint: "jose-l-piedra-brevas" },
      { url: "https://egmcigars.com/products/quintero-brevas.json", skuHint: "quintero-brevas" },
      { url: "https://egmcigars.com/products/fonseca-cosacos.json", skuHint: "fonseca-cosacos" },
    ],
  },
  "ch-cigarmust": {
    country: "ch",
    // PrestaShop backend — but this theme does NOT emit JSON-LD. Instead it
    // exposes the price via OpenGraph meta tags (product:price:amount/currency)
    // and the stock state via inline text + meta tags. Custom parser below.
    stack: "cigarmust_html",
    preferredPackSize: 25,
    pdps: [
      { url: "https://cigarmust.com/en/cohiba/217-140-cohiba-robustos-7612907060907.html",                   skuHint: "cohiba-robustos" },
      // { url: "https://cigarmust.com/en/cohiba/209-cohiba-behike-52-7612907060877.html", skuHint: "cohiba-behike-52" },
      // ⚠️ Behike 52 disabled — without a combination ID the PrestaShop page
      // defaults to a non-canonical pack size and returns CHF 448 (≈ 3-pack
      // price marked as 25-pack). Re-enable once we find the box-of-10
      // combination URL (likely 209-{comboId}-cohiba-behike-52-...html).
      { url: "https://cigarmust.com/en/cohiba/224-cohiba-siglo-iv-7612907060945.html",                       skuHint: "cohiba-siglo-iv" },
      { url: "https://cigarmust.com/en/cohiba/212-cohiba-esplendidos-7612907060600.html",                    skuHint: "cohiba-esplendidos" },
      { url: "https://cigarmust.com/en/montecristo/341-70-montecristo-no4-7612907062178.html",               skuHint: "montecristo-no-4" },
      { url: "https://cigarmust.com/en/montecristo/339-montecristo-no2-7612907062123.html",                  skuHint: "montecristo-no-2" },
      { url: "https://cigarmust.com/en/montecristo/336-40-montecristo-petit-edmundo-7612907062314.html",     skuHint: "montecristo-petit-edmundo" },
      { url: "https://cigarmust.com/en/partagas/367-85-partagas-serie-d-no4-7612907062994.html",             skuHint: "partagas-serie-d-no-4" },
      { url: "https://cigarmust.com/en/hoyo-de-monterrey/273-18-hoyo-de-monterrey-epicure-no-2-7612907061461.html", skuHint: "hoyo-de-monterrey-epicure-no-2" },
      { url: "https://cigarmust.com/en/trinidad/448-121-trinidad-reyes-7612907060389.html",                  skuHint: "trinidad-reyes" },
    ],
  },
  "uk-havanahouse": {
    country: "uk",
    // ⚠️ DISABLED — Havana House declares product pages as og:type='article'
    // (not 'product') with no JSON-LD Product node and no og:price meta. The
    // actual price is rendered client-side via JS, blocking regex extraction.
    // We keep the static research data in PRICE_SNAPSHOTS so the SKU page
    // still shows a Havana House row; only the live scrape is disabled.
    // TODO: replace with EGM Cigars (egmcigars.com) which exposes Schema.org
    // Product JSON-LD on PDPs and is the next-most-trafficked UK Habanos shop.
    disabled: true,
    stack: "havanahouse_html",
    preferredPackSize: 25,
    pdps: [
      { url: "https://www.havanahouse.co.uk/product/cohiba-robusto-box-of-25/",                       skuHint: "cohiba-robustos",            packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/cohiba-behike-52-cigar-box-of-10/",               skuHint: "cohiba-behike-52",           packSize: 10 },
      { url: "https://www.havanahouse.co.uk/product/cohiba-siglo-iv-cigar-box-of-25/",                skuHint: "cohiba-siglo-iv",            packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/cohiba-esplendidos-box-of-25/",                   skuHint: "cohiba-esplendidos",         packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/montecristo-no-4-box-of-25/",                     skuHint: "montecristo-no-4",           packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/montecristo-no-2-box-of-25/",                     skuHint: "montecristo-no-2",           packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/montecristo-petit-edmundo-box-of-25/",            skuHint: "montecristo-petit-edmundo",  packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/partagas-series-d-no-4-box-of-25/",               skuHint: "partagas-serie-d-no-4",      packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/romeo-y-julieta-petit-corona-cigar-box-of-25/",   skuHint: "romeo-y-julieta-petit-coronas", packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/hoyo-de-monterrey-epicure-no-2-cigar-box-25/",    skuHint: "hoyo-de-monterrey-epicure-no-2", packSize: 25 },
      { url: "https://www.havanahouse.co.uk/product/trinidad-reyes-cigar-box-12/",                    skuHint: "trinidad-reyes",             packSize: 12 },
      { url: "https://www.havanahouse.co.uk/product/bolivar-belicosos-finos-cigar-cabinet-of-25/",    skuHint: "bolivar-belicosos-finos",    packSize: 25 },
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
// Solid Taste GmbH Magento template. Used by both Noblego.de AND Cigarmaxx.de —
// they share infrastructure, identical markup. Variants:
//   <span title="Verpackungseinheit">25er</span>     → pack of 25
//   <span title="Verpackungseinheit">Einzeln</span>   → pack of 1 (Cigarmaxx)
//   <span title="Verpackungseinheit">Stück</span>     → pack of 1 (alt label)
function parseNoblegoHtml(html: string): ParsedOffer[] {
  const offers: ParsedOffer[] = [];

  // Match "{N}er" OR a single-cigar label. Capture group 1 is N when numeric,
  // empty when "Einzeln/Stück" — we map empty → 1 below.
  // Span ~4500 chars max between the pack-size label and the price. Empirically
  // the gap is ~1000-2000 chars of HTML; 4500 leaves headroom for variants
  // with extra promo badges.
  const rx =
    /title=["']Verpackungseinheit["'][^>]*>\s*(?:(\d{1,3})er|(Einzeln|St(?:ü|ue|&uuml;)ck))\s*<\/span>[\s\S]{0,4500}?availability-icon\s+availability-([a-z0-9-]+)[\s\S]{0,4500}?<span\s+class=["']price["']\s*>\s*(\d{1,3}(?:\.\d{3})*,\d{2})\s*€/gi;

  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    // Group 1 is numeric "N" (from "Ner"), group 2 is the single-cigar label.
    const packSize = m[1] ? Number(m[1]) : (m[2] ? 1 : 0);
    const availClass = m[3].toLowerCase();
    const priceStr = m[4];
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
    // Clean common injections: leading XML comments, trailing commas, HTML
    // entity escaping (some CMS encode quotes inside JSON-LD by mistake).
    let raw = m[1].trim()
      .replace(/^<!--[\s\S]*?-->\s*/i, "")           // strip leading HTML comment
      .replace(/\s*<!--[\s\S]*?-->\s*$/i, "")        // strip trailing HTML comment
      .replace(/^\s*\/\*[\s\S]*?\*\/\s*/i, "")       // strip leading /* … */ comment
      .replace(/[\u2028\u2029]/g, " ");              // line/paragraph separators
    const attempts: Array<() => unknown> = [
      () => JSON.parse(raw),
      () => JSON.parse(raw.replace(/,(\s*[}\]])/g, "$1")),                          // trailing commas
      () => JSON.parse(raw.replace(/&quot;/g, '"').replace(/&amp;/g, "&")),         // HTML-escaped quotes
      () => JSON.parse(raw.replace(/,(\s*[}\]])/g, "$1").replace(/&quot;/g, '"')),  // both
    ];
    let parsed: unknown = null;
    for (const attempt of attempts) {
      try { parsed = attempt(); break; } catch { /* try next */ }
    }
    if (parsed) blocks.push(parsed);
  }
  return blocks;
}
// Yield every Product node anywhere in the JSON-LD tree. Walks ALL object
// properties (not just @graph) because:
//   - WooCommerce / PrestaShop nest the Product inside WebPage, mainEntity,
//     hasOfferCatalog, isRelatedTo, or under their own custom keys
//   - Some sites wrap the catalog in {"WebPage": {...}, "Product": {...}}
//     at root level with no @graph wrapper
//   - @type can be a string ("Product"), an array (["Product", "Variant"]),
//     or a fully-qualified URL ("https://schema.org/Product")
function* iterateProducts(node: unknown, depth = 0): Generator<Record<string, unknown>> {
  if (depth > 12) return;                            // safety against cycles
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) yield* iterateProducts(n, depth + 1);
    return;
  }
  const obj = node as Record<string, unknown>;
  // Normalise @type to a list of bare type names (strip schema.org URL prefix).
  const t = obj["@type"];
  const types: string[] = [];
  if (typeof t === "string") types.push(t);
  else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") types.push(x);
  const bareTypes = types.map((s) => s.replace(/^https?:\/\/schema\.org\//, ""));
  if (bareTypes.includes("Product")) yield obj;
  // Recurse into every nested property — Products may sit under any key.
  for (const v of Object.values(obj)) yield* iterateProducts(v, depth + 1);
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

// ─── Havana House (UK) parser ──────────────────────────────────────────────
// WooCommerce backend with Yoast SEO. Yoast emits JSON-LD but no Product node,
// so we read straight off the WooCommerce product markup:
//
//   <span class="woocommerce-Price-amount amount">
//     <bdi><span class="woocommerce-Price-currencySymbol">£</span>475.00</bdi>
//   </span>
//
// Sale prices use <ins>...<bdi>£NNN</bdi></ins> wrapping; we prefer the <ins>
// price when present (= the current sale price). Stock state:
//
//   <p class="stock in-stock">In stock</p>
//   <p class="stock out-of-stock">Out of stock</p>
//
// Each PDP carries one pack size — config sets it via pdp.packSize override.
function parseHavanaHouseHtml(html: string): ParsedOffer[] {
  // 1. Restrict the search window to the main product summary if possible —
  // WooCommerce wraps the canonical price in <div class="summary entry-summary">.
  // Falls back to whole document if the summary div isn't present.
  let scope = html;
  const sumMatch = html.match(/<div[^>]*class=["'][^"']*\bsummary\s+entry-summary\b[^"']*["'][\s\S]{0,80000}?<\/div>\s*(?:<\/div>|<form|<aside)/i);
  if (sumMatch) scope = sumMatch[0];

  // 2. Try the sale price first (current price in WooCommerce when on sale).
  let priceStr: string | null = null;
  const saleMatch = scope.match(/<ins[^>]*>[\s\S]{0,800}?£\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i);
  if (saleMatch) priceStr = saleMatch[1];

  // 3. Fall back to the first woocommerce-Price-amount block.
  if (!priceStr) {
    const reg = scope.match(/woocommerce-Price-amount[\s\S]{0,400}?£\s*(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i);
    if (reg) priceStr = reg[1];
  }

  // 4. Last-ditch — any £NNN.NN with a decimal in the product summary.
  if (!priceStr) {
    const fallback = scope.match(/£\s*(\d{1,3}(?:,\d{3})*\.\d{2})/);
    if (fallback) priceStr = fallback[1];
  }

  if (!priceStr) return [];
  const price = parseFloat(priceStr.replace(/,/g, ""));
  if (!price || price <= 0) return [];

  // 5. Stock state. WooCommerce: <p class="stock in-stock"> or "out-of-stock".
  const outOfStock = /<[^>]*class=["'][^"']*\bstock\s+out-of-stock\b/i.test(html)
    || /\bout\s+of\s+stock\b/i.test(scope);
  const inStock = !outOfStock;

  // packSize defaults to 25 — the config's pdp.packSize override rewrites it.
  return [{ packSize: 25, price, currency: "GBP", inStock }];
}

// ─── Cigarmust (CH) parser ─────────────────────────────────────────────────
// PrestaShop theme with no JSON-LD. Prices live in OpenGraph meta tags:
//   <meta property="product:price:amount" content="2040">
//   <meta property="product:price:currency" content="CHF">
//
// Pack size lives in the <select name="group[N]"> options (the packaging
// picker). The OG price corresponds to the currently-selected combination
// (whichever the canonical URL maps to — usually the box-25 pack).
//
// Stock state isn't in OG, so we look for the "In Stock" / "Out of Stock"
// text and the addtocart button's data-available attribute.
function parseCigarmustHtml(html: string): ParsedOffer[] {
  // Helper — read a <meta> tag's content regardless of attribute order
  // (property=... can come before OR after content=...). PrestaShop themes
  // are inconsistent about this.
  function readMeta(propertyName: string): string | null {
    // Try property→content order
    let m = html.match(new RegExp(`<meta[^>]+property=["']${propertyName}["'][^>]+content=["']([^"']+)["']`, "i"));
    if (m) return m[1];
    // Try content→property order
    m = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${propertyName}["']`, "i"));
    if (m) return m[1];
    // Try itemprop instead of property (microdata, some themes)
    m = html.match(new RegExp(`<meta[^>]+itemprop=["']${propertyName.split(":").pop()}["'][^>]+content=["']([^"']+)["']`, "i"));
    if (m) return m[1];
    return null;
  }

  // 1. Price — try og meta first, then fall back to itemprop="price".
  let priceStr = readMeta("product:price:amount") || readMeta("og:price:amount") || readMeta("product:price");
  if (!priceStr) {
    // PrestaShop also exposes itemprop="price" on a <meta> or <span>.
    const ipMatch = html.match(/<meta[^>]+itemprop=["']price["'][^>]+content=["']([\d.,]+)["']/i)
      || html.match(/<span[^>]+itemprop=["']price["'][^>]+content=["']([\d.,]+)["']/i);
    if (ipMatch) priceStr = ipMatch[1];
  }
  if (!priceStr) return [];
  const price = parseFloat(priceStr.replace(/,/g, ""));
  if (!price || price <= 0) return [];

  // 2. Currency.
  const currency = readMeta("product:price:currency")
    || readMeta("og:price:currency")
    || readMeta("product:priceCurrency")
    || "CHF";
  if (!FX_TO_EUR[currency]) return [];

  // 3. Stock state. PrestaShop typically renders this as:
  //   <span id="product-availability" ...>In Stock</span>  (or "Out-of-Stock")
  // or as a hidden meta:
  //   <link itemprop="availability" href="https://schema.org/InStock" />
  let inStock = true;
  const availMeta = html.match(/itemprop=["']availability["'][^>]+href=["']https?:\/\/schema\.org\/([A-Za-z]+)["']/i);
  if (availMeta) {
    inStock = /InStock/i.test(availMeta[1]);
  } else if (/\b(out[\s-]?of[\s-]?stock|sold[\s-]?out|non[\s-]?disponibile|esaurito)\b/i.test(html)) {
    inStock = false;
  }

  // 4. Pack size. Read the currently-selected option from the packaging
  // selector. PrestaShop renders this as a <select> with the "selected"
  // option labelled "Box 25 Pcs." / "Petacas 5x3 Pcs (15 Cigars)" / etc.
  // First try a select-with-selected-option pattern, then a fallback to
  // reading any "Box N Pcs" or "N Cigars" hint near the price.
  let packSize = 25;
  const selectedOpt = html.match(/<option[^>]*\bselected\b[^>]*>([^<]+)<\/option>/i);
  const packCandidates: string[] = [];
  if (selectedOpt) packCandidates.push(selectedOpt[1]);
  // Also probe the page title / h1 area in case it encodes the pack.
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) packCandidates.push(titleMatch[1]);

  for (const txt of packCandidates) {
    // "Box 25 Pcs." | "Box 12 Pcs." | "Petacas 5x3 Pcs (15 Cigars)" | "10 Cigars"
    const boxN  = txt.match(/Box\s+(\d{1,3})\s*Pcs/i);
    const pcsN  = txt.match(/(\d{1,3})\s*Cigars?/i);
    const xByY  = txt.match(/(\d{1,2})\s*[x×]\s*(\d{1,2})\s*Pcs/i);
    if (boxN)  { packSize = Number(boxN[1]); break; }
    if (xByY)  { packSize = Number(xByY[1]) * Number(xByY[2]); break; }
    if (pcsN)  { packSize = Number(pcsN[1]); break; }
  }
  if (!packSize || packSize < 1 || packSize > 100) packSize = 25;

  return [{ packSize, price, currency, inStock }];
}

// ─── Shopify JSON product endpoint parser ──────────────────────────────────
// Used for EGM Cigars and any other Shopify-backed retailer. Every Shopify
// shop exposes /products/{handle}.json which returns:
//
//   {
//     "product": {
//       "title": "...",
//       "variants": [
//         { "id": 123, "title": "Box of 25", "price": "2524.31",
//           "available": false, "option1": "Box of 25", ... },
//         { "id": 124, "title": "Single Cigar", "price": "101.01",
//           "available": true, "option1": "Single Cigar", ... }
//       ]
//     }
//   }
//
// We map each variant's title → pack size and emit one ParsedOffer per variant.
// Currency comes from the config (Shopify omits it in the per-product endpoint;
// it's a shop-level setting).
function parseShopifyJson(body: string, currency: string = "CHF"): ParsedOffer[] {
  let data: Record<string, unknown>;
  try { data = JSON.parse(body); } catch { return []; }
  const product = (data?.product as Record<string, unknown>) || null;
  if (!product) return [];
  const variants = product.variants;
  if (!Array.isArray(variants)) return [];

  const offers: ParsedOffer[] = [];
  for (const v of variants) {
    if (!v || typeof v !== "object") continue;
    const vv = v as Record<string, unknown>;
    const priceStr = String(vv.price ?? "");
    const price = parseFloat(priceStr);
    if (!price || price <= 0) continue;

    // option1 / title typically describes the pack ("Box of 25", "Single Cigar").
    const title = String(vv.option1 || vv.title || "");
    const packSize = parsePackSizeFromTitle(title);
    if (!packSize) continue;

    // Shopify's `available` flag is the most reliable inventory signal;
    // fall back to inventory_quantity if it's not set.
    let inStock: boolean;
    if (typeof vv.available === "boolean") {
      inStock = vv.available;
    } else if (typeof vv.inventory_quantity === "number") {
      inStock = vv.inventory_quantity > 0;
    } else {
      inStock = true;  // optimistic when neither flag is present
    }

    offers.push({ packSize, price, currency, inStock });
  }
  // Dedup by packSize — Shopify sometimes lists the same pack under multiple
  // option2/option3 values; keep the first occurrence so we don't double-write.
  const dedup = new Map<number, ParsedOffer>();
  for (const o of offers) if (!dedup.has(o.packSize)) dedup.set(o.packSize, o);
  return Array.from(dedup.values());
}

// Map a Shopify variant title to a pack-size integer. Recognises:
//   "Box of 25"             → 25
//   "Pack of 3" / "3-pack"  → 3
//   "Single Cigar" / "1pc"  → 1
//   "5x3 Pcs"               → 15
//   "10er Kiste"            → 10  (rare on Shopify, kept for safety)
// Returns 0 (falsy) when no pack size can be inferred — those variants are
// dropped so we don't poison the snapshot with bogus pack data.
function parsePackSizeFromTitle(title: string): number {
  const t = title.trim();
  if (!t) return 0;
  // Most common
  const boxN  = t.match(/Box\s+of\s+(\d{1,3})/i);
  if (boxN) return Number(boxN[1]);
  const cabN  = t.match(/Cabinet\s+of\s+(\d{1,3})/i);
  if (cabN) return Number(cabN[1]);
  const packN = t.match(/Pack\s+of\s+(\d{1,3})/i);
  if (packN) return Number(packN[1]);
  const dashN = t.match(/(\d{1,3})[-\s]pack/i);
  if (dashN) return Number(dashN[1]);
  // "5x3 Pcs" → 15
  const grid  = t.match(/(\d{1,2})\s*[x×]\s*(\d{1,2})/i);
  if (grid) return Number(grid[1]) * Number(grid[2]);
  // "Ner Kiste"
  const erN   = t.match(/(\d{1,3})er\b/i);
  if (erN) return Number(erN[1]);
  // Single-cigar synonyms
  if (/\b(single|stick|1\s*pc|1\s*cigar|individual|unidad|stück)\b/i.test(t)) return 1;
  // Bare "N Cigars" / "N Pcs" / "N Sticks"
  const nCigars = t.match(/(\d{1,3})\s*(cigars?|pcs?|sticks?|tubo?s?)\b/i);
  if (nCigars) return Number(nCigars[1]);
  return 0;
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
  if (config.disabled) {
    return json({
      ok: true,
      retailerId,
      disabled: true,
      note: "Scraper disabled for this retailer; static research data remains in PRICE_SNAPSHOTS.",
      stats: { pdpsScraped: 0, bytesDownloaded: 0, rowsExtracted: 0, inserted: 0 },
    });
  }

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

    // Run the retailer's configured parser so debug output reflects reality.
    let parsed: ParsedOffer[];
    switch (config.stack) {
      case "noblego_html":     parsed = parseNoblegoHtml(html); break;
      case "havanahouse_html": parsed = parseHavanaHouseHtml(html); break;
      case "cigarmust_html":   parsed = parseCigarmustHtml(html); break;
      case "shopify_json":     parsed = parseShopifyJson(html, currencyForCountry(config.country)); break;
      default:                 parsed = parseSchemaOrg(html);
    }

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
      switch (config.stack) {
        case "noblego_html":     parsed = parseNoblegoHtml(html); break;
        case "havanahouse_html": parsed = parseHavanaHouseHtml(html); break;
        case "cigarmust_html":   parsed = parseCigarmustHtml(html); break;
        case "cigarworld_html":  parsed = parseSchemaOrg(html); break; // currently same as schema.org
        case "shopify_json":     parsed = parseShopifyJson(html, currencyForCountry(config.country)); break;
        case "schema_org_jsonld":
        default:                 parsed = parseSchemaOrg(html);
      }

      // Apply per-PDP pack-size override. Used when the retailer splits each
      // pack-size into a separate PDP (Havana House WooCommerce style) and the
      // JSON-LD doesn't expose eligibleQuantity — the URL slug is then the
      // most reliable source. We rewrite every parsed offer to the override.
      if (typeof pdp.packSize === "number") {
        parsed = parsed.map((o) => ({ ...o, packSize: pdp.packSize! }));
      }

      // Sanity floor — reject offers with EUR price below the configured
      // minimum (default €20). No Cuban box-of-N costs less than that, so
      // anything that does is almost certainly a regex match on an accessory
      // upsell or VAT/shipping notice rather than the real product price.
      const minEur = config.minPriceEur ?? 20;
      const beforeFloor = parsed.length;
      parsed = parsed.filter((o) => {
        const eur = o.price * (FX_TO_EUR[o.currency] || 0);
        return eur >= minEur;
      });
      if (beforeFloor > parsed.length) {
        errors.push(`${pdp.url}: ${beforeFloor - parsed.length} offer(s) rejected by €${minEur} sanity floor`);
      }

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
