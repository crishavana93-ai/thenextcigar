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
  se: "thenextcigar-21",  // amazon.se — approved 12 September 2026
  uk: "",                 // amazon.co.uk — not joined yet. 329 clicks a quarter.
  de: "",                 // amazon.de — not joined yet
  com: "thenextciga08-20", // amazon.com — approved 12 September 2026. 660 clicks a quarter.
};

/**
 * The storefront links point at.
 *
 * This is NOT "wherever the traffic is". A tracking ID only earns on the
 * marketplaces whose Associates programme you have actually joined —
 * marketplaces you have not joined are not monetised, and a .com link carrying
 * a Swedish -21 tag pays nothing at all. So this must name a store we hold an
 * approved account for, and today that is exactly one: amazon.se.
 *
 * As of 12 September 2026 we hold two: amazon.se and amazon.com. This points
 * at .com, because that is where the readership is — 660 clicks a quarter from
 * the United States against 69 from Sweden.
 *
 * Still missing is the United Kingdom, worth 329 clicks a quarter and the
 * second-largest audience by a distance. One application at
 * affiliate-program.amazon.co.uk covers it and lets Germany, France, Italy and
 * Spain be added in the same flow. Until that tag exists, British readers
 * clicking these links buy on amazon.com and we earn nothing on them.
 *
 * Once OneLink is configured in Associates Central, it will route each reader
 * to their own store using whichever of these tags applies. It only monetises
 * marketplaces we hold an account for, so it is a multiplier on this list, not
 * a substitute for extending it.
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
