/**
 * Affiliate links — the plumbing, waiting for the tag.
 * ============================================================================
 *
 * Nothing here renders anything until two conditions are both true: an Amazon
 * Associates tag exists in AMAZON_TAGS, and the article has at least one pick
 * with a real ASIN. Until then every helper returns nothing and the buy box
 * does not appear. That is deliberate. A half-wired affiliate link is an
 * untagged link that earns nothing, and a pick with an invented ASIN is a
 * recommendation for a product that may not exist.
 *
 * WHY AMAZON AND NOT A CIGAR SHOP: thirteen European cigar retailers were
 * checked in September 2026 — Noblego, Cigarworld, Cigarmaxx, EGM, Sautter,
 * C.Gars, Havana House, James J. Fox, Smoke King, Cigars Galaxy, Dutch
 * Tobacconist, Cigarrummet, Puros — and not one runs an affiliate programme.
 * Cigars International runs one but excludes non-US publishers. Amazon
 * Associates, joined through the Swedish programme, is the only channel that
 * covers a readership that is 660 US and 329 UK clicks a quarter.
 *
 * HOW TO SWITCH IT ON, once Associates approves the account:
 *   1. Put the tag in AMAZON_TAGS.se (and any other storefront tags you get).
 *   2. Add real ASINs to PICKS below. An ASIN is the 10-character code in an
 *      Amazon URL: /dp/B0XXXXXXXX. Take it from the product page — never guess
 *      one, because a wrong ASIN points a reader at the wrong object.
 *   3. That is all. The buy box and the disclosure appear on their own.
 */

export interface Pick {
  /** What the reader sees. Say what it is, not what the listing calls it. */
  label: string;
  /** Amazon ASIN — the 10 characters after /dp/ in the product URL. */
  asin: string | null;
  /** One honest line on why it is here. No superlatives we cannot support. */
  note?: string;
}

/** Associates tags per storefront. Empty string = not approved yet. */
export const AMAZON_TAGS: Record<string, string> = {
  se: "",   // amazon.se — the home programme for a Swedish publisher
  uk: "",   // amazon.co.uk
  de: "",   // amazon.de
  com: "",  // amazon.com
};

/**
 * The storefront links point at. A static site cannot know a visitor's country
 * at build time, so links are built once against this store and Amazon's
 * OneLink script redirects a reader to their own. Set it to wherever most of
 * the traffic is — currently the United States, at 660 clicks a quarter
 * against the United Kingdom's 329.
 */
export const PRIMARY_STORE: keyof typeof AMAZON_TAGS = "com";

const DOMAIN: Record<string, string> = {
  se: "amazon.se", uk: "amazon.co.uk", de: "amazon.de", com: "amazon.com",
};

/** True once a tag exists for the primary store. Nothing renders before this. */
export function affiliateLive(): boolean {
  return Boolean(AMAZON_TAGS[PRIMARY_STORE]);
}

/** A tagged product URL, or null when we are not live or have no ASIN. */
export function amazonUrl(asin: string | null): string | null {
  const tag = AMAZON_TAGS[PRIMARY_STORE];
  if (!tag || !asin) return null;
  return `https://www.${DOMAIN[PRIMARY_STORE]}/dp/${asin}?tag=${encodeURIComponent(tag)}`;
}

/**
 * Recommendations per article, keyed by the post's slug.
 *
 * These are empty on purpose. Filling them is an editorial act, not a
 * technical one: each pick should be something you would recommend to a member
 * in the Lounge, with a note saying why. Adding a product here puts it under
 * the masthead, so the standard is the same as the standard for the prose.
 *
 * Leave a guide out entirely if you would not recommend anything in it.
 */
export const PICKS: Record<string, Pick[]> = {
  "best-cigar-lighters-2026": [
    // The page the affiliate plan exists for. Butane lighters are UN 1057,
    // dangerous goods class 2.1, and cannot travel by ordinary air post — so
    // this guide is the one we will never stock ourselves, and pointing the
    // reader somewhere honest is the whole point.
    // { label: "Single-jet, for a windless evening", asin: "B0…", note: "…" },
  ],
  "best-cigar-cutters-2026": [
    // Our own cutters go in the shop, not here. If a cutter is worth
    // recommending and we do not sell it, it belongs in this list.
  ],
  "best-cigar-gifts-under-100": [],
  "the-cigar-travel-kit-what-to-pack-for-a-weekend-abroad": [],
  "8-cigar-lifestyle-pieces-worth-owning": [],
};

/** The picks for a slug that actually resolve to a tagged link. */
export function picksFor(slug: string): Array<Pick & { url: string }> {
  if (!affiliateLive()) return [];
  return (PICKS[slug] ?? [])
    .map((p) => ({ ...p, url: amazonUrl(p.asin) }))
    .filter((p): p is Pick & { url: string } => Boolean(p.url));
}
