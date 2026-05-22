// ============================================================================
// Schema.org JSON-LD parser — the workhorse.
// ============================================================================
// Most modern Cuban-cigar webshops (Shopware 6, Magento 2, Shopify) emit
// schema.org Product + Offer JSON-LD blocks. One parser covers all of them:
//   - Noblego (DE)
//   - Cigarworld (DE)
//   - Vabajo / Selected Cigars / Casa Benden (DE LCDH stack)
//   - JJ Fox + Davidoff London (UK)
//   - Cigarmust + Cigars-of-Cuba (CH)
//   - Sigaren-Online (NL)
//   - Cigarstuen (DK)
// ============================================================================

import type { ScrapedOffer } from "./types.ts";
import { matchCanonicalSku } from "./sku-matcher.ts";

/** Extract all <script type="application/ld+json"> blocks from an HTML string. */
export function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const rx = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(html)) !== null) {
    const raw = m[1].trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // Some sites embed JS comments / trailing commas — try a softer pass.
      try {
        blocks.push(JSON.parse(raw.replace(/,(\s*[}\]])/g, "$1")));
      } catch {
        // Give up on this block; record for parser debug counter.
      }
    }
  }
  return blocks;
}

/** Recursively unwrap @graph and arrays to find Product nodes. */
function* iterateProducts(node: unknown): Generator<Record<string, unknown>> {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const n of node) yield* iterateProducts(n);
    return;
  }
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  const typeIsProduct =
    t === "Product" ||
    (Array.isArray(t) && t.includes("Product"));
  if (typeIsProduct) yield obj;
  if (Array.isArray(obj["@graph"])) yield* iterateProducts(obj["@graph"]);
}

/** Extract offer info from a Product node. Returns [] if no parseable offer. */
function offersFromProduct(product: Record<string, unknown>): ScrapedOffer[] {
  const title = (product.name as string) || (product.title as string) || "";
  const offersRaw = product.offers as unknown;
  if (!offersRaw) return [];

  const offerList = Array.isArray(offersRaw) ? offersRaw : [offersRaw];
  const out: ScrapedOffer[] = [];

  for (const o of offerList) {
    if (!o || typeof o !== "object") continue;
    const offer = o as Record<string, unknown>;
    const price = parseFloat(String(offer.price ?? offer.lowPrice ?? ""));
    if (Number.isNaN(price) || price <= 0) continue;

    const currency = String(offer.priceCurrency ?? offer.priceCurrencyCode ?? "EUR")
      .toUpperCase() as ScrapedOffer["currency"];
    if (!["EUR","CHF","SEK","GBP","DKK","NOK"].includes(currency)) continue;

    const availabilityStr = String(offer.availability ?? "").toLowerCase();
    const inStock = availabilityStr.includes("instock") || availabilityStr === "" || availabilityStr.endsWith("/instock");

    const sourceUrl = String(offer.url ?? product.url ?? "");

    out.push({
      skuSlug: matchCanonicalSku(title),
      rawTitle: title.trim(),
      price,
      currency,
      inStock,
      sourceUrl,
    });
  }
  return out;
}

/** Main entry point — parse a single HTML page and return all offers. */
export function parseSchemaOrgPage(html: string, fallbackUrl: string): ScrapedOffer[] {
  const blocks = extractJsonLdBlocks(html);
  const offers: ScrapedOffer[] = [];
  for (const b of blocks) {
    for (const product of iterateProducts(b)) {
      for (const offer of offersFromProduct(product)) {
        if (!offer.sourceUrl) offer.sourceUrl = fallbackUrl;
        offers.push(offer);
      }
    }
  }
  return offers;
}
