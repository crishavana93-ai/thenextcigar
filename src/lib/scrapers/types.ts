// ============================================================================
// Scraper types — shared by every retailer parser.
// ============================================================================

/** One scraped product offer from a single retailer page. */
export interface ScrapedOffer {
  /** Best-effort canonical SKU slug (e.g. "cohiba-robustos") OR raw title
   *  if the slug matcher couldn't classify it (we still log it for triage). */
  skuSlug: string | null;
  /** Raw retailer page title — what we saw on the page. */
  rawTitle: string;
  /** Price in native currency for the canonical box size. */
  price: number;
  currency: "EUR" | "CHF" | "SEK" | "GBP" | "DKK" | "NOK";
  /** Optional original / strikethrough price (sale). */
  originalPrice?: number;
  inStock: boolean;
  /** The retailer's PDP URL — what we link to from the Shop button. */
  sourceUrl: string;
  /** Optional: number of cigars per pack, for normalizing per-cigar pricing. */
  packSize?: number;
}

/** Result of a full retailer scrape run. */
export interface ScrapeResult {
  retailerId: string;
  scrapedAt: string;     // ISO timestamp
  offers: ScrapedOffer[];
  errors: string[];
  /** Pages fetched + bytes downloaded for cron reporting. */
  pagesFetched: number;
  bytesDownloaded: number;
}

/** Per-retailer parser contract. */
export interface RetailerParser {
  retailerId: string;       // canonical id from finder-data.ts
  baseUrl: string;          // e.g. "https://www.noblego.de"
  /** URLs to scan for Cuban-cigar product pages — category roots, sitemap, etc. */
  startUrls: string[];
  /** The parser stack family. Different stacks need different extraction logic. */
  stack: "schema_org_jsonld" | "shopware6" | "magento2" | "shopify_products_json" | "woocommerce" | "custom";
  /** Run the scrape against fetched HTML. Pure function for easy testing. */
  parse(html: string, url: string): ScrapedOffer[];
}
