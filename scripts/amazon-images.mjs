// Fetches Amazon product images for every ASIN linked in src/content via the
// Amazon Creators API, at build time, into src/data/amazon-images.json.
//
// Why: Associates Program Policies only allow Amazon product images that come
// from the API, refreshed at least every 24 hours (Product Advertising Content,
// clause (h)). So this file is rewritten on every build, a daily rebuild keeps
// it fresh, and the components hide any image older than 23 hours in the
// browser as a safeguard if a rebuild is missed.
//
// Credentials come only from the environment (Cloudflare Pages → Settings →
// Variables and Secrets): AMAZON_CREATORS_ID, AMAZON_CREATORS_SECRET and
// AMAZON_CREATORS_VERSION (3.1 = North America / amazon.com). Without them, or
// on any error, the file is written empty and the site shows no Amazon images.
// The build never fails because of this script.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "src/data/amazon-images.json";
const TAG = "thenextcigar-20";
const MARKET = "www.amazon.com";
const TOKEN_URL = {
  "3.1": "https://api.amazon.com/auth/o2/token",
  "3.2": "https://api.amazon.co.uk/auth/o2/token",
  "3.3": "https://api.amazon.co.jp/auth/o2/token",
};
const API = "https://creatorsapi.amazon/catalog/v1/getItems";

const write = (items, note) => {
  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT, JSON.stringify({ fetchedAt: items ? Date.now() : 0, note, items: items || {} }, null, 1));
  console.log(`[amazon-images] ${note}`);
};

function walk(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.mdx?$/.test(f)) acc.push(p);
  }
  return acc;
}

async function main() {
  const id = process.env.AMAZON_CREATORS_ID;
  const secret = process.env.AMAZON_CREATORS_SECRET;
  const version = (process.env.AMAZON_CREATORS_VERSION || "3.1").trim();
  if (!id || !secret) return write(null, "no credentials set; Amazon images hidden");
  const tokenUrl = TOKEN_URL[version];
  if (!tokenUrl) return write(null, `unknown credential version ${version}; Amazon images hidden`);

  const asins = new Set();
  for (const f of walk("src/content")) {
    for (const m of readFileSync(f, "utf8").matchAll(/amazon\.com\/(?:[^\s"')]*\/)?dp\/([A-Z0-9]{10})/g)) asins.add(m[1]);
  }

  const tr = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" }),
  });
  if (!tr.ok) return write(null, `token request failed (${tr.status}); Amazon images hidden`);
  const { access_token } = await tr.json();

  const list = [...asins];
  const items = {};
  let errors = 0;
  for (let i = 0; i < list.length; i += 10) {
    const r = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json", "x-marketplace": MARKET },
      body: JSON.stringify({
        itemIds: list.slice(i, i + 10), itemIdType: "ASIN", marketplace: MARKET, partnerTag: TAG,
        resources: ["images.primary.large", "images.primary.medium"],
      }),
    });
    if (!r.ok) {
      errors++;
      const body = (await r.text()).slice(0, 160).replace(/\s+/g, " ");
      console.log(`[amazon-images] batch ${i / 10 + 1} failed (${r.status}): ${body}`);
    } else {
      const j = await r.json();
      for (const it of j?.itemsResult?.items || []) {
        const img = it?.images?.primary?.large || it?.images?.primary?.medium;
        const a = it?.asin || it?.ASIN;
        if (a && img?.url) items[a] = { url: img.url, w: img.width, h: img.height };
      }
    }
    await new Promise((res) => setTimeout(res, 1100)); // stay under 1 request/second
  }
  write(items, `${Object.keys(items).length} of ${list.length} ASINs have an image${errors ? `, ${errors} batch(es) failed` : ""}`);
}

main().catch((e) => write(null, `error: ${String(e?.message || e).slice(0, 120)}; Amazon images hidden`));
