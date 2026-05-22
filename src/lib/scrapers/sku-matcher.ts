// ============================================================================
// SKU Matcher — convert a retailer's product title to our canonical slug.
// ============================================================================
// Same cigar surfaces across retailers as:
//   - "Cohiba Robusto" / "Cohiba Robustos" / "Cohiba Robustos Kuba" (DE)
//   - "Cohiba Robusto - kubansk cigarr - låda om 25" (SE)
//   - "Cohiba Robustos (Box of 25)" (UK)
//   - "Cohiba Robustos | Confezione da 25" (IT)
//
// We match against a small set of canonical slugs from src/data/finder-data.ts
// using brand + vitola signature words. Returns null when no match — caller
// stores the raw title for triage.
// ============================================================================

interface CanonicalSku {
  slug: string;
  brand: string;            // Match this exactly (case-insensitive)
  vitolaTokens: string[];   // All tokens must appear in the title (order-free)
  /** Optional disambiguators for SKUs that share most tokens (e.g. Behike 52 vs 54). */
  mustContain?: string[];
}

/** Order matters: more-specific SKUs first so they win over generic ones. */
const CANONICAL_SKUS: CanonicalSku[] = [
  // Cohiba Behike — must come BEFORE generic Cohiba SKUs.
  { slug: "cohiba-behike-52", brand: "cohiba", vitolaTokens: ["behike"], mustContain: ["52"] },
  // Cohiba Línea 1492
  { slug: "cohiba-siglo-iv",  brand: "cohiba", vitolaTokens: ["siglo"],  mustContain: ["iv","4"] },
  // Cohiba Línea Clásica
  { slug: "cohiba-esplendidos", brand: "cohiba", vitolaTokens: ["esplendidos","espléndidos"] },
  { slug: "cohiba-robustos",  brand: "cohiba", vitolaTokens: ["robusto"] },

  // Montecristo
  { slug: "montecristo-no-2", brand: "montecristo", vitolaTokens: ["n","2","no"], mustContain: ["2"] },
  { slug: "montecristo-no-4", brand: "montecristo", vitolaTokens: ["n","4","no"], mustContain: ["4"] },
  { slug: "montecristo-petit-edmundo", brand: "montecristo", vitolaTokens: ["petit","edmundo"] },

  // Partagás
  { slug: "partagas-serie-d-no-4", brand: "partag", vitolaTokens: ["serie","d"], mustContain: ["4"] },

  // Romeo y Julieta
  { slug: "romeo-y-julieta-petit-coronas", brand: "romeo", vitolaTokens: ["petit","corona"] },

  // Hoyo de Monterrey
  { slug: "hoyo-de-monterrey-epicure-no-2", brand: "hoyo", vitolaTokens: ["epicure"], mustContain: ["2"] },

  // Trinidad
  { slug: "trinidad-reyes", brand: "trinidad", vitolaTokens: ["reyes"] },

  // Bolívar
  { slug: "bolivar-belicosos-finos", brand: "bol", vitolaTokens: ["belicoso"] },
];

/** Normalize a title for matching: lowercase, strip diacritics, collapse non-alnum. */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Returns the canonical SKU slug for a raw product title, or null. */
export function matchCanonicalSku(rawTitle: string): string | null {
  const t = normalize(rawTitle);
  if (!t) return null;

  for (const sku of CANONICAL_SKUS) {
    if (!t.includes(sku.brand)) continue;
    const allTokensPresent = sku.vitolaTokens.every((tok) =>
      t.includes(normalize(tok)),
    );
    if (!allTokensPresent) continue;
    if (sku.mustContain) {
      const mustOk = sku.mustContain.every((m) =>
        new RegExp(`\\b${m}\\b`).test(t),
      );
      if (!mustOk) continue;
    }
    return sku.slug;
  }
  return null;
}

/** Heuristic — extract pack size from title like "Box of 25", "låda om 25", "Confezione 25". */
export function extractPackSize(rawTitle: string): number | undefined {
  const t = rawTitle.toLowerCase();
  // Match "box of 25", "låda om 25", "x25", "25er", "25 stuks", "scatola da 25"
  const m = t.match(/(?:box\s*of|låda\s*om|x|er|stuks|scatola\s*da|kiste)?\s*(\d{1,3})\s*(?:er|stuks|pack|stk|st)?/);
  if (!m) return undefined;
  const n = Number(m[1]);
  if (n === 5 || n === 10 || n === 12 || n === 15 || n === 20 || n === 25 || n === 50) return n;
  return undefined;
}
