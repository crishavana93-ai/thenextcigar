// Cloudflare Pages Function — POST /api/scraper/listings
// ---------------------------------------------------------------------------
// Walks each tracked retailer's Cuban-cigar listing pages, records every
// product URL it sees in finder_listings, and emails release-watchers about
// URLs that are new since the last run. Runs after the price scrape (see
// .github/workflows/finder-scrape.yml). Auth: X-Scraper-Token.
//
// Honesty rules
//   • A "new listing" is a product page that appeared on a retailer's Cuban
//     listing since our previous crawl of that retailer. It is not a claim
//     that Habanos released anything — the email says "newly listed at X".
//   • A retailer's first crawl seeds the table and never alerts.
//   • Only titles that match a Habanos brand count; a new category link or
//     humidor never becomes an alert.
// ---------------------------------------------------------------------------

interface Env {
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SCRAPER_ADMIN_TOKEN: string;
  RESEND_API_KEY?: string;
  ALERT_FROM_EMAIL?: string;
}

interface Site {
  retailerId: string;
  country: string;
  currency: string;
  kind: "shopify" | "html";
  /** Listing pages (html) or the Shopify collection base (shopify). */
  urls: string[];
  /** html: how page N is addressed; `{n}` is replaced. Page 1 is the bare URL. */
  page?: string;
  maxPages?: number;
  /** html: product URL pattern (tested on the pathname). */
  product?: RegExp;
}

const SITES: Site[] = [
  { retailerId: "de-noblego", country: "de", currency: "EUR", kind: "html",
    urls: ["https://www.noblego.de/kubanische-zigarren/"], page: "?p={n}", maxPages: 8, product: /^\/[a-z0-9-]+\/$/ },
  { retailerId: "de-cigarmaxx", country: "de", currency: "EUR", kind: "html",
    urls: ["https://www.cigarmaxx.de/kubanische-zigarren/"], page: "?p={n}", maxPages: 8, product: /^\/[a-z0-9-]+\/$/ },
  { retailerId: "de-cigarworld", country: "de", currency: "EUR", kind: "html",
    urls: ["https://www.cigarworld.de/zigarren/kuba"], page: "?page={n}", maxPages: 10, product: /^\/zigarren\/kuba\/[^/]+\/[^/]+_\d+$/ },
  { retailerId: "ch-cigarmust", country: "ch", currency: "CHF", kind: "html",
    urls: ["https://cigarmust.com/en/170-cuban-habanos"], page: "?page={n}", maxPages: 10, product: /^\/en\/[^/]+\/\d+-.+\.html$/ },
  { retailerId: "ch-egmcigars", country: "ch", currency: "CHF", kind: "shopify",
    urls: ["https://egmcigars.com/collections/cuban-cigars"], maxPages: 6 },
];

const CUBAN_BRANDS = ["Cohiba", "Montecristo", "Romeo y Julieta", "Partagás", "Partagas", "Hoyo de Monterrey", "H. Upmann", "H.Upmann", "Upmann", "Trinidad", "Bolívar", "Bolivar", "Cuaba", "Diplomáticos", "Diplomaticos", "El Rey del Mundo", "Fonseca", "Guantanamera", "José L. Piedra", "Jose L. Piedra", "Juan López", "Juan Lopez", "La Flor de Cano", "La Gloria Cubana", "Por Larrañaga", "Por Larranaga", "Punch", "Quai d'Orsay", "Quintero", "Rafael González", "Rafael Gonzalez", "Ramón Allones", "Ramon Allones", "Saint Luis Rey", "San Cristóbal", "San Cristobal", "Sancho Panza", "Vegas Robaina", "Vegueros"];

const json = (d: unknown, s = 200) => new Response(JSON.stringify(d, null, 2), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const UA = "Mozilla/5.0 (compatible; TheNextCigarBot/1.0; +https://thenextcigar.com/about/)";

function brandOf(title: string): string | null {
  const t = title.toLowerCase();
  for (const b of CUBAN_BRANDS) if (t.includes(b.toLowerCase())) return b.normalize("NFD").replace(/[̀-ͯ]/g, "") === "Partagas" ? "Partagás" : b;
  return null;
}
const clean = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();

interface Found { url: string; title: string; price?: number }

async function fetchText(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/json" } });
    if (!r.ok) return null;
    return await r.text();
  } catch { return null; }
}

/** Generic listing extraction: every same-host anchor whose path matches the
 *  product pattern, titled by anchor text, title= or the image alt. */
function extractHtml(site: Site, html: string, base: string): Found[] {
  const out = new Map<string, Found>();
  const host = new URL(base).host;
  const re = /<a\b([^>]*?)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let u: URL;
    try { u = new URL(m[2], base); } catch { continue; }
    if (u.host !== host || !site.product!.test(u.pathname)) continue;
    u.search = ""; u.hash = "";
    const attrs = m[1] + m[3];
    const inner = m[4];
    const title = clean(inner) || (attrs.match(/title="([^"]+)"/) || [])[1] || (inner.match(/alt="([^"]+)"/) || [])[1] || "";
    const prev = out.get(u.href);
    if (!prev || (!prev.title && title)) out.set(u.href, { url: u.href, title: clean(title) });
  }
  return [...out.values()];
}

async function crawl(site: Site): Promise<{ found: Found[]; pages: number; errors: string[] }> {
  const errors: string[] = []; const found = new Map<string, Found>(); let pages = 0;
  if (site.kind === "shopify") {
    for (let n = 1; n <= (site.maxPages ?? 5); n++) {
      const txt = await fetchText(`${site.urls[0]}/products.json?limit=250&page=${n}`);
      if (!txt) { errors.push(`page ${n} failed`); break; }
      pages++;
      let data: any; try { data = JSON.parse(txt); } catch { errors.push(`page ${n} not json`); break; }
      const products: any[] = data.products ?? [];
      for (const p of products) {
        const price = Number(p.variants?.[0]?.price);
        found.set(p.handle, { url: `${new URL(site.urls[0]).origin}/products/${p.handle}`, title: p.title, price: isFinite(price) ? price : undefined });
      }
      if (products.length < 250) break;
    }
  } else {
    for (const root of site.urls) {
      for (let n = 1; n <= (site.maxPages ?? 5); n++) {
        const url = n === 1 ? root : root + (site.page ?? "?p={n}").replace("{n}", String(n));
        const html = await fetchText(url);
        if (!html) { if (n === 1) errors.push(`${url} failed`); break; }
        pages++;
        const items = extractHtml(site, html, url);
        let added = 0;
        for (const it of items) if (!found.has(it.url)) { found.set(it.url, it); added++; }
        if (added === 0) break; // past the last page: same links again
      }
    }
  }
  return { found: [...found.values()], pages, errors };
}

async function supa(env: Env, path: string, init: RequestInit = {}) {
  return fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json", ...(init.headers || {}) } });
}

async function sendEmail(env: Env, to: string, subject: string, html: string, text: string) {
  if (!env.RESEND_API_KEY) return { ok: false, error: "no RESEND_API_KEY" };
  const from = env.ALERT_FROM_EMAIL || "alerts@thenextcigar.com";
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({ from: `The Next Cigar Finder <${from}>`, to: [to], subject, html, text, tags: [{ name: "category", value: "finder_release" }] }) });
  return { ok: r.ok, error: r.ok ? undefined : `resend ${r.status}` };
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const token = request.headers.get("x-scraper-token") || new URL(request.url).searchParams.get("token");
  if (!env.SCRAPER_ADMIN_TOKEN || token !== env.SCRAPER_ADMIN_TOKEN) return json({ ok: false, error: "unauthorized" }, 401);
  const only = new URL(request.url).searchParams.get("retailer");
  const now = new Date().toISOString();
  const report: any[] = [];
  const fresh: { site: Site; row: any }[] = [];

  for (const site of SITES) {
    if (only && site.retailerId !== only) continue;
    const { found, pages, errors } = await crawl(site);
    const cuban = found.map((f) => ({ ...f, brand: brandOf(f.title) })).filter((f) => f.brand && f.title);
    // What we already knew about this retailer.
    const knownRes = await supa(env, `finder_listings?retailer_id=eq.${site.retailerId}&select=url&limit=5000`);
    const known = new Set<string>(knownRes.ok ? ((await knownRes.json()) as any[]).map((r) => r.url) : []);
    const seeded = known.size > 0;
    const rows = cuban.map((f) => ({ retailer_id: site.retailerId, url: f.url, title: f.title.slice(0, 200), brand: f.brand, country_code: site.country, price: f.price ?? null, currency: f.price != null ? site.currency : null, last_seen: now, ...(known.has(f.url) ? {} : { first_seen: now }) }));
    let upserted = 0;
    for (let i = 0; i < rows.length; i += 200) {
      const r = await supa(env, "finder_listings?on_conflict=retailer_id,url", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows.slice(i, i + 200)) });
      if (r.ok) upserted += Math.min(200, rows.length - i); else errors.push(`upsert ${r.status}: ${(await r.text()).slice(0, 200)}`);
    }
    const newOnes = seeded ? rows.filter((r) => !known.has(r.url)) : [];
    for (const row of newOnes) fresh.push({ site, row });
    report.push({ retailer: site.retailerId, pages, links: found.length, cuban: cuban.length, upserted, new: newOnes.length, seeded, errors });
  }

  // Email release-watchers about the new listings (grouped per subscriber).
  let emails = 0; const mailErrors: string[] = [];
  if (fresh.length > 0) {
    const wl = await supa(env, "finder_release_watchlists?archived_at=is.null&select=id,country_scope,brand_filter,subscriber:finder_email_subscribers(id,email,confirmed_at,unsubscribed_at)");
    const watchers: any[] = wl.ok ? await wl.json() : [];
    for (const w of watchers) {
      const s = w.subscriber; if (!s?.email || !s.confirmed_at || s.unsubscribed_at) continue;
      const mine = fresh.filter(({ site, row }) => (!w.country_scope || w.country_scope.includes(site.country)) && (!w.brand_filter || w.brand_filter.some((b: string) => row.brand.toLowerCase().includes(b.toLowerCase()))));
      if (mine.length === 0) continue;
      const list = mine.slice(0, 20);
      const li = list.map(({ site, row }) => `<li style="margin:0 0 8px"><a href="${row.url}" style="color:#151412">${row.title}</a> — ${site.retailerId.split("-")[1]}${row.price ? `, ${row.currency} ${row.price}` : ""}</li>`).join("");
      const html = `<div style="font-family:Georgia,serif;max-width:560px;color:#151412"><p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#7B2622">The Next Cigar · newly listed</p><h1 style="font-size:24px;margin:0 0 12px">${list.length} new Cuban listing${list.length > 1 ? "s" : ""} at retailers you watch</h1><p>These product pages appeared on a retailer's Cuban-cigar listing since our last crawl. That is all we know — it may be a restock, a new size, or a new release. Check the page before you order.</p><ul style="padding-left:18px">${li}</ul><p style="font-size:12px;color:#7a6f60">Prices are the retailer's listed price, their own tax included. <a href="https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(s.email)}" style="color:#7a6f60">Unsubscribe</a></p></div>`;
      const text = `${list.length} new Cuban listings:\n` + list.map(({ row }) => `- ${row.title} — ${row.url}`).join("\n") + `\n\nUnsubscribe: https://thenextcigar.com/finder/unsubscribe?email=${encodeURIComponent(s.email)}`;
      const r = await sendEmail(env, s.email, `${list.length} new Cuban listing${list.length > 1 ? "s" : ""} — ${list[0].row.title}`, html, text);
      if (r.ok) emails++; else mailErrors.push(`${s.email}: ${r.error}`);
      await supa(env, "finder_alert_deliveries", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ release_watchlist_id: w.id, subscriber_id: s.id, alert_type: "new_release", sku: list[0].row.title.slice(0, 80), retailer_id: list[0].site.retailerId, delivery_status: r.ok ? "sent" : "failed" }) });
    }
    const urls = fresh.map((f) => f.row.url);
    for (let i = 0; i < urls.length; i += 50) await supa(env, `finder_listings?url=in.(${urls.slice(i, i + 50).map((u) => `"${u}"`).join(",")})`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ alerted_at: now }) });
  }
  return json({ ok: true, at: now, retailers: report, newListings: fresh.length, emails, mailErrors });
};
