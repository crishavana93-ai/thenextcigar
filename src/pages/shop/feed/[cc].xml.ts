/**
 * Google Merchant Center product feeds — one per target country, priced in
 * that country's currency with the same rates checkout charges (pricing.ts).
 *   /shop/feed/se.xml  SEK   /shop/feed/de.xml  EUR   /shop/feed/gb.xml  GBP   /shop/feed/us.xml  USD
 * Add each URL in Merchant Center → Products → Add products → scheduled fetch.
 */
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { amountIn } from "../../../../functions/api/shop/pricing";

const SITE = "https://thenextcigar.com";
const TARGETS: Record<string, { cur: string; country: string; lang: string }> = {
  se: { cur: "SEK", country: "SE", lang: "en" },
  de: { cur: "EUR", country: "DE", lang: "en" },
  gb: { cur: "GBP", country: "GB", lang: "en" },
  us: { cur: "USD", country: "US", lang: "en" },
};
const CATEGORY: Record<string, string> = {
  lighter: "Home & Garden > Smoking Accessories > Cigar Accessories",
  cutter: "Home & Garden > Smoking Accessories > Cigar Accessories > Cigar Cutters",
  humidor: "Home & Garden > Smoking Accessories > Cigar Accessories > Humidors",
  ashtray: "Home & Garden > Smoking Accessories > Ashtrays",
  accessories: "Home & Garden > Smoking Accessories > Cigar Accessories",
};
const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function getStaticPaths() { return Object.keys(TARGETS).map((cc) => ({ params: { cc } })); }

export const GET: APIRoute = async ({ params }) => {
  const t = TARGETS[params.cc!];
  const products = (await getCollection("products")).filter((p) => !p.data.isArchived && !p.data.comingSoon && p.data.inStock && p.data.requiresShipping);
  const img = (c: any) => (!c ? "" : typeof c === "string" ? c : c.src);
  const abs = (u: string) => (u.startsWith("http") ? u : SITE + u);
  const money = (usd: number) => (amountIn(usd, t.cur) / 100).toFixed(2) + " " + t.cur;
  const items = products.map((p) => {
    const d: any = p.data;
    const cover = img(d.cover);
    const gallery: string[] = (d.gallery ?? []).map(img).filter((g: string) => g && g !== cover).slice(0, 5);
    const desc = (d.excerpt || d.name).replace(/\s+/g, " ").trim();
    return `<item>
  <g:id>${esc(d.sku)}</g:id>
  <g:title>${esc(d.name)}</g:title>
  <g:description>${esc(desc)}</g:description>
  <g:link>${SITE}/shop/${d.slug}/?utm_source=google&amp;utm_medium=shopping&amp;utm_campaign=free_listings_${t.country.toLowerCase()}</g:link>
  ${cover ? `<g:image_link>${esc(abs(cover))}</g:image_link>` : ""}
  ${gallery.map((g) => `<g:additional_image_link>${esc(abs(g))}</g:additional_image_link>`).join("\n  ")}
  <g:availability>in_stock</g:availability>
  <g:price>${money(d.price)}</g:price>
  <g:brand>${esc(d.brand || "CIGARLOONG")}</g:brand>
  <g:mpn>${esc(d.mpn || d.sku)}</g:mpn>
  <g:identifier_exists>${d.gtin ? "yes" : "no"}</g:identifier_exists>
  ${d.gtin ? `<g:gtin>${esc(d.gtin)}</g:gtin>` : ""}
  <g:condition>new</g:condition>
  <g:google_product_category>${esc(CATEGORY[d.category] || CATEGORY.accessories)}</g:google_product_category>
  <g:product_type>${esc(d.category || "accessories")}</g:product_type>
  <g:shipping><g:country>${t.country}</g:country><g:service>Tracked post</g:service><g:price>0.00 ${t.cur}</g:price><g:min_handling_time>0</g:min_handling_time><g:max_handling_time>1</g:max_handling_time><g:min_transit_time>7</g:min_transit_time><g:max_transit_time>14</g:max_transit_time></g:shipping>
  ${d.weight ? `<g:shipping_weight>${Number(d.weight)} g</g:shipping_weight>` : ""}
  <g:adult>no</g:adult>
</item>`;
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>The Next Cigar — Shop (${t.country})</title>
<link>${SITE}/shop/</link>
<description>Cigar accessories chosen by the paper. Delivered to ${t.country}, duties and VAT paid.</description>
${items.join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
};
