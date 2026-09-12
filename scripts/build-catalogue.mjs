// Builds functions/api/shop/catalogue.json from src/content/products/*.mdx
// so the checkout function prices from the source of truth, never from the browser.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dir = "src/content/products";
const out = "functions/api/shop/catalogue.json";
const cat = {};
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".mdx") && !f.endsWith(".md")) continue;
  const src = readFileSync(join(dir, f), "utf8");
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, "").trim();
  }
  const slug = fm.slug || f.replace(/\.mdx?$/, "");
  const price = Number(fm.price);
  if (!Number.isFinite(price)) continue;
  // An archived product is off sale, not merely hidden. Leaving it in the
  // catalogue means the checkout function will still price and sell it to
  // anyone who POSTs the slug, even though no page links to it any more.
  if (fm.isArchived === "true") continue;
  cat[slug] = {
    name: fm.name || slug,
    sku: fm.sku || "",
    price,
    currency: (fm.currency || "USD").toUpperCase(),
    supplier: fm.supplier || "",
    supplierUrl: fm.supplierUrl && fm.supplierUrl !== "~" ? fm.supplierUrl : "",
    inStock: fm.inStock !== "false",
    comingSoon: fm.comingSoon === "true",
    isArchived: fm.isArchived === "true",
  };
}
mkdirSync("functions/api/shop", { recursive: true });
writeFileSync(out, JSON.stringify(cat, null, 2) + "\n");
console.log(`catalogue: ${Object.keys(cat).length} products → ${out}`);
