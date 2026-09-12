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
  uk: "thenextciga0a-21", // amazon.co.uk — approved 12 September 2026. 329 clicks a quarter.
  de: "",                 // amazon.de — not joined yet
  com: "thenextcigar-20", // amazon.com — the ORIGINAL id, live since at least
                          // August 2026 and the one carrying the account's
                          // earnings history. Do not swap this for a newer id
                          // without a reason: reporting continuity is worth
                          // more than a tidier string.
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
 * The UK came in the same evening, so the three biggest audiences — 660 US,
 * 329 UK, 69 SE — are all covered. Germany is the next one worth having at 65
 * clicks a quarter, and it is a single click from the UK signup confirmation
 * page rather than a fresh application.
 *
 * Until OneLink is live these links all point at .com regardless of who is
 * reading, so the UK and SE tags earn nothing yet. They are here so that
 * switching OneLink on is a configuration step and not a code change.
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
    // We sell a jet lighter of our own at $49-55. These are the tier above it —
    // brands with a service department, which is the only thing that matters in
    // a category where the failure mode is "it stops lighting".
    //
    // Ratings checked on amazon.com, 12 September 2026. Read them before you
    // get excited: premium cigar lighters rate 4.0-4.6, not 4.8. Colibri's
    // lighters sit between 3.3 and 4.5 despite the brand's reputation, which is
    // why none of them are here. Jet lighters are simply the least reliable
    // object in this hobby and the guide should say so rather than pretend a
    // $150 torch is a solved problem.
    {
      label: "XIKAR ELX double-jet with 9mm punch",
      asin: "B01MRLC3R2",
      note: "4.4 from Amazon buyers, which is about as good as this category gets. The reason to pay $85 for a lighter that does the same job as a $20 one is Xikar's warranty department — they repair rather than replace, and they have been doing it for thirty years. Buy this instead of ours if you want a lighter you will still own in ten years.",
    },
  ],
  "best-cigar-cutters-2026": [
    // The shop sells cutters at $38-99, so these deliberately are not competing
    // with them: they are the branded tier we cannot source and would not try
    // to. If a reader wants a lifetime-warranty cutter, the honest answer is
    // that we do not sell one.
    //
    // All three verified on amazon.com, 12 September 2026, all rated 4.8.
    {
      label: "Xikar Xi1 — the lifetime-warranty benchmark",
      asin: "B003SJXFSE",
      note: "440C steel at Rockwell 57, and a warranty that outlives most marriages. Ninety-two dollars is a lot for a cutter and we are not going to pretend it cuts three times better than a twenty-dollar one. What it does is never need replacing, and Xikar fix it when it eventually does.",
    },
    {
      label: "Colibri Premium V-Cut",
      asin: "B00H85QXPG",
      note: "The V-cut most people mean when they say V-cut. Spring-loaded, deep enough for a tight draw without taking too much cap off. Worth it if you smoke figurados or fight tight draws; pointless if you only smoke robustos, where a straight cut is better.",
    },
    {
      label: "Case Elegance Classic — the sensible one",
      asin: "B081268GTS",
      note: "Twenty-three dollars, same 4.8 rating as the ninety-dollar Xikar. If you are buying your first proper cutter and the Xikar feels absurd, this is the one we would actually hand a friend.",
    },
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
