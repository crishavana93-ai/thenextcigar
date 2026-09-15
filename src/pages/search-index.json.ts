import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SKUS, RETAILERS, COUNTRIES } from "../data/finder-data";

/**
 * /search-index.json — the masthead search reads this once, on first
 * keystroke. Vitolas, retailers and articles; name, where it goes, and a
 * one-line hint. Built at build time, a few tens of kilobytes, cached.
 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog")).filter((p) => !(p.data as any).draft);
  const country = (c: string) => COUNTRIES.find((x) => x.code === c)?.name ?? c.toUpperCase();
  const items = [
    ...SKUS.map((s) => ({ k: "vitola", t: `${s.brand} ${s.vitola}`, h: `/finder/sku/${s.slug}/`, s: `box of ${s.boxSize}` })),
    ...RETAILERS.map((r) => ({ k: "retailer", t: r.name, h: `/finder/${r.country}/`, s: `${r.city ? r.city + " · " : ""}${country(r.country)}` })),
    ...posts.map((p) => ({ k: "article", t: p.data.title as string, h: `/blog/${p.slug}/`, s: (p.data as any).category ?? "magazine" })),
    { k: "page", t: "Box code decoder", h: "/tools/box-code/", s: "tools" },
    { k: "page", t: "Traveller's allowance", h: "/tools/allowance/", s: "tools" },
    { k: "page", t: "The Habanos Index", h: "/finder/index/", s: "markets" },
    { k: "page", t: "The shop", h: "/shop/", s: "accessories" },
    { k: "page", t: "The Lounge", h: "/lounge/", s: "members" },
  ];
  return new Response(JSON.stringify({ built: new Date().toISOString().slice(0, 10), items }), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
};
