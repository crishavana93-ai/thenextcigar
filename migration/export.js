#!/usr/bin/env node
/**
 * thenextcigar.com — Webflow CMS export
 *
 * Pulls every collection and every item from your Webflow site via the v2 API
 * and writes them to ./dump/ as JSON. Also downloads every referenced image
 * to ./dump/_assets/ so we have a complete offline snapshot before we cancel
 * the Webflow plan.
 *
 * Run:   WEBFLOW_API_TOKEN=xxx WEBFLOW_SITE_ID=xxx node export.js
 *   or:  copy .env.example to .env, fill it in, then `node --env-file=.env export.js`
 *
 * Node 18+ required (uses native fetch).
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

const TOKEN = process.env.WEBFLOW_API_TOKEN;
let SITE_ID = process.env.WEBFLOW_SITE_ID; // optional — we'll auto-discover if missing

if (!TOKEN) {
  console.error("Missing WEBFLOW_API_TOKEN. See .env.example.");
  process.exit(1);
}

const API = "https://api.webflow.com/v2";
const DUMP = path.resolve("./dump");
const ASSETS = path.resolve("./dump/_assets");

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "accept-version": "2.0.0",
};

async function api(pathname, init = {}) {
  const res = await fetch(`${API}${pathname}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Webflow API ${res.status} ${pathname}: ${body}`);
  }
  return res.json();
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function downloadImage(url, dest) {
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ! image ${res.status} ${url}`);
      return;
    }
    await ensureDir(path.dirname(dest));
    const stream = createWriteStream(dest);
    await finished(Readable.fromWeb(res.body).pipe(stream));
  } catch (err) {
    console.warn(`  ! image error ${url}: ${err.message}`);
  }
}

function* collectImageUrls(value) {
  // Webflow CMS items are JSON; image fields show up as { url, alt, fileId } or HTML <img src> tags.
  // Walk every value recursively and yield any URL that looks like a Webflow asset.
  if (!value) return;
  if (typeof value === "string") {
    // Find <img src="..."> in HTML rich text
    const re = /<img[^>]+src=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(value)) !== null) yield m[1];
    return;
  }
  if (typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const v of value) yield* collectImageUrls(v);
    return;
  }
  if (typeof value.url === "string" && /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(value.url)) {
    yield value.url;
  }
  for (const v of Object.values(value)) yield* collectImageUrls(v);
}

function safeFilename(url) {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname);
    return base || "asset";
  } catch {
    return "asset";
  }
}

async function listSites() {
  const data = await api(`/sites`);
  return data.sites || data;
}

async function listCollections(siteId) {
  const data = await api(`/sites/${siteId}/collections`);
  return data.collections || data;
}

async function getCollection(collectionId) {
  return api(`/collections/${collectionId}`);
}

async function listItems(collectionId) {
  const items = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const data = await api(`/collections/${collectionId}/items?limit=${limit}&offset=${offset}`);
    const batch = data.items || [];
    items.push(...batch);
    const total = data.pagination?.total ?? items.length;
    if (items.length >= total || batch.length === 0) break;
    offset += limit;
  }
  return items;
}

async function main() {
  await ensureDir(DUMP);
  await ensureDir(ASSETS);

  // 1. Resolve the site ID
  // Webflow site-level API tokens DO NOT grant `sites:read` scope, so we cannot
  // call /sites to auto-discover. The site ID must be provided up-front via env.
  if (!SITE_ID) {
    console.error("WEBFLOW_SITE_ID is required.");
    console.error("Get it from Webflow Designer URL, or from the homepage HTML's `data-wf-site` attribute.");
    console.error("For thenextcigar.com it is: 68359876d9b215967730246c");
    console.error("Add this line to .env:  WEBFLOW_SITE_ID=68359876d9b215967730246c");
    process.exit(1);
  }
  console.log(`Using site ID: ${SITE_ID}`);

  // 2. Try to fetch site metadata, but don't fail if the scope is missing.
  let site = { id: SITE_ID };
  try {
    const sites = await listSites();
    const found = Array.isArray(sites) ? sites.find((s) => s.id === SITE_ID) : null;
    if (found) site = found;
    console.log(`Site name: ${site.displayName || "(unknown)"}`);
  } catch (err) {
    console.log(`(skipping site metadata — token has no sites:read scope; this is normal for site-level tokens)`);
  }
  await writeJson(path.join(DUMP, "_site.json"), site);

  // 3. List collections
  const collections = await listCollections(SITE_ID);
  await writeJson(path.join(DUMP, "_collections.json"), collections);
  console.log(`\nFound ${collections.length} collection(s):`);
  for (const c of collections) console.log(`  • ${c.displayName.padEnd(28)}  slug=${c.slug.padEnd(18)} id=${c.id}`);

  // 4. For each collection: schema + items + image downloads
  const imageUrls = new Set();
  for (const c of collections) {
    console.log(`\n→ ${c.displayName}`);
    const schema = await getCollection(c.id);
    await writeJson(path.join(DUMP, `${c.slug}.schema.json`), schema);
    const items = await listItems(c.id);
    await writeJson(path.join(DUMP, `${c.slug}.items.json`), items);
    console.log(`  ${items.length} item(s) saved`);
    for (const item of items) for (const url of collectImageUrls(item)) imageUrls.add(url);
  }

  // 5. Download all referenced images
  console.log(`\nDownloading ${imageUrls.size} image(s)…`);
  const seen = new Map();
  let i = 0;
  for (const url of imageUrls) {
    let name = safeFilename(url);
    // Avoid filename collisions across collections
    if (seen.has(name)) {
      const n = seen.get(name) + 1;
      seen.set(name, n);
      const ext = path.extname(name);
      name = `${path.basename(name, ext)}_${n}${ext}`;
    } else {
      seen.set(name, 1);
    }
    const dest = path.join(ASSETS, name);
    await downloadImage(url, dest);
    i++;
    if (i % 25 === 0) console.log(`  ${i}/${imageUrls.size}`);
  }

  // 6. Manifest
  const manifest = {
    exportedAt: new Date().toISOString(),
    site: { id: site.id, displayName: site.displayName, shortName: site.shortName },
    collections: collections.map((c) => ({ id: c.id, slug: c.slug, displayName: c.displayName })),
    imageCount: imageUrls.size,
  };
  await writeJson(path.join(DUMP, "_manifest.json"), manifest);

  console.log(`\n✓ Done. Dump written to ${DUMP}`);
  console.log("Next: zip the dump folder (excluding _assets if too large) and tell me to write the converter.");
}

main().catch((err) => {
  console.error("\n✗ Export failed:", err.message);
  process.exit(1);
});
