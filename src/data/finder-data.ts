// ============================================================================
// The Finder — seed dataset
// ============================================================================
// European Cuban-cigar price-comparison data.
// Sources: CIGAR-FINDER-RETAILER-MAP.md + CIGAR-FINDER-RETAILER-MAP-EXPANSION.md
// Prices verified May 2026; refreshed via scheduled scraper in production.
// This is the seed / prototype layer. In v2 it is replaced by a Supabase
// finder_price_snapshots table populated nightly by a Cloudflare Worker.
// ============================================================================

export type CountryCode =
  | "es" | "de" | "ch" | "it" | "se"   // v1 launch markets
  | "uk" | "nl" | "be" | "at" | "dk"   // expansion countries with public pricing
  | "no" | "fi" | "pt" | "cz" | "ie" | "gr" | "fr" | "lu";

export type Currency = "EUR" | "CHF" | "SEK" | "GBP" | "DKK" | "NOK";

export interface Country {
  code: CountryCode;
  name: string;
  flag: string;          // emoji
  currency: Currency;
  status: "open" | "restricted" | "closed";
  /** Short consumer-facing note shown on the country page. */
  note?: string;
}

export interface Retailer {
  id: string;
  name: string;
  url: string;
  country: CountryCode;
  city?: string;
  /** LCDH = La Casa del Habano franchise (highest prestige tier). */
  status: "lcdh" | "habanos-specialist" | "mixed" | "reservation";
  shipsTo: "domestic" | "eu" | "worldwide";
  /** True if site has public pricing we can show; false = brochure-only. */
  hasPublicPricing: boolean;
  /** Template used by `effectiveShopUrl()` when a price snapshot's sourceUrl
   *  is generic (homepage / brand listing) — `{q}` gets replaced with the
   *  encoded "Brand Vitola" so the user lands on the retailer's search results
   *  for that exact cigar instead of having to retype it. */
  searchUrlTemplate?: string;
}

/**
 * Decide what URL the "Shop →" button should point to.
 *
 * - If the snapshot's sourceUrl looks like an EXACT product page (a real
 *   PDP path with a product slug) use it as-is — these come from live
 *   scrapes or hand-verified static research.
 * - Otherwise (homepage, brand-listing page, /en locale root, etc.) fall
 *   back to the retailer's search URL template with the cigar's "Brand
 *   Vitola" pre-filled, so the user lands on the retailer's search
 *   results for that exact cigar instead of a homepage.
 * - Last resort: a Google site-search restricted to the retailer's domain.
 *
 * Returns `{ url, isExact }`. The UI uses `isExact` to render "Shop →" vs
 * "Search on site →" so users know whether they're clicking through to the
 * exact cigar or to a search results page.
 */
export function effectiveShopUrl(
  sourceUrl: string,
  sku: { brand: string; vitola: string },
  retailer: Retailer,
): { url: string; isExact: boolean } {
  let isExact = false;
  try {
    const u = new URL(sourceUrl);
    const segments = u.pathname.split("/").filter(Boolean);
    // Real PDPs: ≥ 2 path segments, OR a single ≥ 12-char segment containing
    // a hyphen that isn't just a locale prefix (/en, /it, /de…).
    const looksLikePdp =
      segments.length >= 2 ||
      (segments.length === 1 &&
        segments[0].length >= 12 &&
        segments[0].includes("-") &&
        !/^(?:en|it|de|fr|es|nl|gb|us|cn|jp|fi|pt|gr|ie|be|at)\b/i.test(segments[0]));
    // But: if all path segments are short and look like brand/category
    // listings (e.g. "/en/cohiba"), treat as generic too. Last segment
    // length must be > 8 characters or contain a digit (typical Habanos
    // product ID like 01002_13) to qualify as a PDP.
    if (looksLikePdp && segments.length === 2) {
      const last = segments[segments.length - 1];
      if (last.length < 9 || (!/\d/.test(last) && !last.includes("-"))) {
        isExact = false;
      } else {
        isExact = true;
      }
    } else {
      isExact = looksLikePdp;
    }
  } catch {
    isExact = false;
  }
  if (isExact) return { url: sourceUrl, isExact: true };

  const query = `${sku.brand} ${sku.vitola}`;
  if (retailer.searchUrlTemplate) {
    return {
      url: retailer.searchUrlTemplate.replace("{q}", encodeURIComponent(query)),
      isExact: false,
    };
  }
  // Last resort — Google site search on the retailer's domain.
  let domain = retailer.url;
  try { domain = new URL(retailer.url).hostname; } catch {}
  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} ${query}`)}`,
    isExact: false,
  };
}

export interface Sku {
  id: string;
  slug: string;
  brand: string;            // 'Cohiba'
  line: string;             // 'Behike'
  vitola: string;           // 'Behike 52'
  shape: string;            // 'Robusto Extra'
  ring: number;             // 52
  lengthMm: number;
  /** Most common box size for this vitola — used as the canonical pack. */
  boxSize: number;
  prestige: "flagship" | "premium" | "standard";
  /** Structured strength rating — same vocabulary as profile.strength_preference
   *  so the Lounge recommender can score profile↔SKU matches directly. */
  strength: "mild" | "medium" | "full" | "extra_full";
  /** Structured flavor descriptors — same vocabulary as profile.flavor_notes
   *  (the 15-chip set defined in /lounge/app/profile/). Used by the recommender
   *  to compute overlap between member taste and SKU profile. */
  flavorNotes: string[];
  /** Two-sentence consumer description used on the SKU detail page hero. */
  blurb: string;
  /** Long-form editorial passage (200-300 words) rendered below the comparison
   *  table on the SKU detail page. Mix of tasting notes, history, and "why
   *  compare" so the page gives Google something to rank. */
  editorial: string;
}

export interface PriceSnapshot {
  skuId: string;
  retailerId: string;
  /** Price for the canonical box (sku.boxSize). */
  price: number;
  currency: Currency;
  /** Optional original / strike-through price (used for "was X now Y"). */
  originalPrice?: number;
  inStock: boolean;
  /** ISO date string of the snapshot. */
  scrapedAt: string;
  sourceUrl: string;
}

// ----------------------------------------------------------------------------
// FX rates (May 2026 reference). Used to convert all prices to EUR for sort.
// Display retains native currency unless the user toggles to EUR.
// In production these come from a daily FX feed cached in Supabase.
// ----------------------------------------------------------------------------
export const FX_TO_EUR: Record<Currency, number> = {
  EUR: 1.000,
  CHF: 1.050,
  SEK: 0.087,
  GBP: 1.190,
  DKK: 0.134,
  NOK: 0.087,
};

export function toEUR(price: number, currency: Currency): number {
  return Math.round(price * FX_TO_EUR[currency] * 100) / 100;
}

export function formatPrice(amount: number, currency: Currency): string {
  const symbols: Record<Currency, string> = {
    EUR: "€",
    CHF: "CHF ",
    SEK: "SEK ",
    GBP: "£",
    DKK: "DKK ",
    NOK: "NOK ",
  };
  const rounded = amount >= 1000
    ? Math.round(amount).toLocaleString("en-US")
    : amount.toFixed(2);
  return `${symbols[currency]}${rounded}`;
}

// ============================================================================
// COUNTRIES — every European market in scope, with regulatory status
// ============================================================================
export const COUNTRIES: Country[] = [
  { code: "de", name: "Germany",        flag: "🇩🇪", currency: "EUR", status: "open",
    note: "Deepest e-commerce market in Europe. 5th Avenue is the sole Habanos importer; ~20 LCDH stores nationwide." },
  { code: "ch", name: "Switzerland",    flag: "🇨🇭", currency: "CHF", status: "open",
    note: "Outside EU customs union. Several Swiss retailers ship into the EU as a price-arbitrage tier." },
  { code: "it", name: "Italy",          flag: "🇮🇹", currency: "EUR", status: "restricted",
    note: "Domestic online sale by licensed tabaccherie is tolerated; transnational sale is banned under Decree 6/2016." },
  { code: "es", name: "Spain",          flag: "🇪🇸", currency: "EUR", status: "restricted",
    note: "Online sale of tobacco is prohibited; prices shown reflect state-regulated PVR via licensed estancos." },
  { code: "se", name: "Sweden",         flag: "🇸🇪", currency: "SEK", status: "open",
    note: "All retailers are licensed under Habanos Nordic AB. Domestic shipping only; BankID age verification at checkout." },
  { code: "uk", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", status: "open",
    note: "Hunters & Frankau is the exclusive UK Habanos importer. The strongest editorial-tier retailer scene in Europe." },
  { code: "nl", name: "Netherlands",    flag: "🇳🇱", currency: "EUR", status: "open",
    note: "Hajenius (est. 1826) is the heritage anchor; LCDH franchises in Amsterdam, The Hague and Maastricht." },
  { code: "be", name: "Belgium",        flag: "🇧🇪", currency: "EUR", status: "open",
    note: "LCDH Antwerp and LCDH Brussels both ship within the EU with public per-SKU pricing." },
  { code: "at", name: "Austria",        flag: "🇦🇹", currency: "EUR", status: "open",
    note: "Vienna's Habanos Specialist scene is in-store driven; cross-border pricing routed via 5th Avenue (DE)." },
  { code: "dk", name: "Denmark",        flag: "🇩🇰", currency: "DKK", status: "open",
    note: "The Danish Pipe Shop is the largest scrapable catalogue; Copenhagen has strong LCDH presence." },
  { code: "fi", name: "Finland",        flag: "🇫🇮", currency: "EUR", status: "restricted",
    note: "Havanna-Aitta (est. 1897) is the oldest LCDH in Finland; online pricing is catalogue-only." },
  { code: "pt", name: "Portugal",       flag: "🇵🇹", currency: "EUR", status: "restricted",
    note: "Heritage tobacconists (Casa Havaneza est. 1864) and LCDH Lisbon, Porto. Mostly in-store retail." },
  { code: "ie", name: "Ireland",        flag: "🇮🇪", currency: "EUR", status: "open",
    note: "James J. Fox Dublin (est. 1881) is the only Habanos-certified Irish retailer and ships across the EU." },
  { code: "gr", name: "Greece",         flag: "🇬🇷", currency: "EUR", status: "open",
    note: "Athens is the Greek Habanos hub; LCDH Athens plus two well-stocked online retailers." },
  { code: "cz", name: "Czech Republic", flag: "🇨🇿", currency: "EUR", status: "restricted",
    note: "LCDH Prague holds the largest walk-in humidor in the CZ but does not ship online." },
  { code: "no", name: "Norway",         flag: "🇳🇴", currency: "NOK", status: "restricted",
    note: "Norwegian tobacco law limits online retail. Sol Cigar Co. (est. 1911) remains the heritage anchor." },
  { code: "fr", name: "France",         flag: "🇫🇷", currency: "EUR", status: "closed",
    note: "French law bans online tobacco sales. À La Civette (est. 1716) and other heritage shops are in-store only." },
  { code: "lu", name: "Luxembourg",     flag: "🇱🇺", currency: "EUR", status: "closed",
    note: "LCDH Luxembourg City is in-store only — no online shipping." },
];

export const COUNTRY_BY_CODE: Record<CountryCode, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
) as Record<CountryCode, Country>;

// ============================================================================
// RETAILERS — verified May 22 2026
// ============================================================================
// 78 scrape-grade retailers (hasPublicPricing: true) + ~25 directory-only
// shops where online sale is legally restricted. URLs all verified by two
// parallel verification agents. See docs/retailer-research/verification-report.md.
// ============================================================================
export const RETAILERS: Retailer[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SCRAPE-GRADE A-LIST — 78 verified retailers across 13 countries
  // Live webshops with public Cuban pricing. Production scraper targets.
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Germany ──── 18 verified ─────────────────────────────────────────────
  { id: "de-noblego",            name: "Noblego",                            url: "https://www.noblego.de",                                 country: "de", city: "Berlin",          status: "mixed",              shipsTo: "eu",        hasPublicPricing: true  , searchUrlTemplate: "https://www.noblego.de/catalogsearch/result/?q={q}"},
  { id: "de-cigarmaxx",          name: "Cigarmaxx",                          url: "https://www.cigarmaxx.de",                               country: "de", city: "Berlin",          status: "mixed",              shipsTo: "eu",        hasPublicPricing: true  , searchUrlTemplate: "https://www.cigarmaxx.de/catalogsearch/result/?q={q}"},
  { id: "de-cigarworld",         name: "Cigarworld.de",                      url: "https://www.cigarworld.de",                              country: "de", city: "Düsseldorf",      status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  , searchUrlTemplate: "https://www.cigarworld.de/shop/suche?suchterms={q}"},
  { id: "de-cigarsmoker",        name: "The Cigar Smoker (LCDH Hamburg)",    url: "https://www.thecigarsmoker.com",                         country: "de", city: "Hamburg",         status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "de-selected-cigars",    name: "Selected Cigars (LCDH Düsseldorf)",  url: "https://www.selected-cigars.com",                        country: "de", city: "Düsseldorf",      status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-vabajo",             name: "Vabajo (LCDH Frankfurt)",            url: "https://www.vabajo.com",                                 country: "de", city: "Frankfurt",       status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-zigarren-herzog",    name: "Zigarren Herzog",                    url: "https://www.zigarren-herzog.com",                        country: "de", city: "Berlin",          status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-tabak-traeber",      name: "Tabak Träber",                       url: "https://www.tabak-traeber.de",                           country: "de", city: "Münster",         status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-starke-zigarren",    name: "Starke Zigarren",                    url: "https://www.starkezigarren.de",                          country: "de", city: "Berlin",          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-peter-heinrichs",    name: "Peter Heinrichs",                    url: "https://www.peterheinrichs.de",                          country: "de", city: "Köln",            status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-zigarre-de",         name: "Zigarre.de",                         url: "https://www.zigarre.de",                                 country: "de",                          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-cigarrenversand24",  name: "Cigarrenversand24",                  url: "https://www.cigarrenversand24.de",                       country: "de",                          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-cigarrenversand",    name: "Cigarrenversand (Peter Weinig)",     url: "https://www.cigarrenversand.de",                         country: "de", city: "Bamberg",         status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-zigarrenwelt",       name: "Zigarrenwelt (Tabac Benden)",        url: "https://www.zigarrenwelt.de",                            country: "de",                          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-casabenden",         name: "Casa Benden (LCDH Düsseldorf)",      url: "https://www.casabenden.de",                              country: "de", city: "Düsseldorf",      status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-tabacum",            name: "Tabacum",                            url: "https://www.tabacum.de",                                 country: "de", city: "Stuttgart",       status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-tabakhaus24",        name: "Tabakhaus24",                        url: "https://www.tabakhaus24.de",                             country: "de",                          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-zechbauer",          name: "Max Zechbauer Tabakwaren",           url: "https://www.zechbauer.de",                               country: "de", city: "München",         status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "de-tabakhaus-durek",    name: "Tabakhaus Durek (directory)",        url: "https://www.tabakhaus-durek.de",                         country: "de", city: "Berlin",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Switzerland ──── 12 verified ─────────────────────────────────────────
  { id: "ch-cigarmust",          name: "Cigarmust (LCDH Lugano/Mendrisio)",  url: "https://www.cigarmust.com",                              country: "ch", city: "Mendrisio",       status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  , searchUrlTemplate: "https://cigarmust.com/en/search?controller=search&s={q}"},
  { id: "ch-cigarone",           name: "CigarOne",                           url: "https://www.cigarone.com",                               country: "ch", city: "Geneva",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-siglomundo",         name: "SigloMundo (LCDH Zug)",              url: "https://www.siglomundo.ch",                              country: "ch", city: "Zug",             status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-swisscubancigars",   name: "SwissCubanCigars",                   url: "https://www.swisscubancigars.com",                       country: "ch", city: "Zürich",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-cigarsofcuba",       name: "Cigars of Cuba",                     url: "https://cigars-of-cuba.com",                             country: "ch", city: "Geneva",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-casadelpuro",        name: "Casa del Puro",                      url: "https://www.casadelpuro.com",                            country: "ch", city: "Geneva",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-cigarterminal",      name: "Cigar Terminal",                     url: "https://www.cigarterminal.com",                          country: "ch", city: "Geneva",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-zigarrenversand",    name: "Zigarrenversand.ch",                 url: "https://www.zigarrenversand.ch",                         country: "ch", city: "Schaffhausen",    status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "ch-cigarpassion",       name: "CigarPassion (Nyon)",                url: "https://www.cigarpassion.ch",                            country: "ch", city: "Nyon",            status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-lcdh-geneve",        name: "La Casa del Habano Genève",          url: "https://www.lacasadelhabano-geneve.com",                 country: "ch", city: "Geneva",          status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "ch-topcubans",          name: "Top Cubans",                         url: "https://www.topcubans.com",                              country: "ch", city: "Geneva",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-rheincigars",        name: "Rhein Cigars",                       url: "https://www.rheincigars.ch",                             country: "ch", city: "Geneva",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },

  // ─── United Kingdom ──── 12 verified ──────────────────────────────────────
  { id: "uk-jjfox",              name: "JJ Fox (LCDH at Harrods)",           url: "https://www.jjfox.co.uk",                                country: "uk", city: "London",          status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-davidoff-london",    name: "Davidoff London",                    url: "https://www.davidofflondon.com",                         country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-sautter",            name: "Sautter Cigars",                     url: "https://www.sauttercigars.com",                          country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  , searchUrlTemplate: "https://www.sauttercigars.com/search?type=product&q={q}"},
  { id: "uk-hava-havana",        name: "Hava Havana (LCDH London)",          url: "https://havahavana.com",                                 country: "uk", city: "Teddington",      status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-robert-graham",      name: "Robert Graham 1874",                 url: "https://www.robertgraham1874.com",                       country: "uk", city: "Glasgow",         status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-cgars",              name: "C.Gars Ltd",                         url: "https://www.cgarsltd.co.uk",                             country: "uk", city: "Liverpool",       status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  , searchUrlTemplate: "https://www.turmeaus.co.uk/search.php?search_query={q}"},
  { id: "uk-turmeaus",           name: "Turmeaus (sister to C.Gars)",        url: "https://www.turmeaus.co.uk",                             country: "uk", city: "Liverpool",       status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-havanahouse",        name: "Havana House",                       url: "https://www.havanahouse.co.uk",                          country: "uk", city: "Cheshire",        status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  , searchUrlTemplate: "https://www.havanahouse.co.uk/?s={q}&post_type=product"},
  { id: "uk-no6-cavendish",      name: "No.6 Cavendish",                     url: "https://www.no6cavendish.com",                           country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-simplycigars",       name: "Simply Cigars",                      url: "https://www.simplycigars.co.uk",                         country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "uk-smoke-king",         name: "Smoke King",                         url: "https://www.smoke-king.co.uk",                           country: "uk",                          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-tomtom",             name: "Tom Tom Cigars",                     url: "https://www.tomtomcigars.co.uk",                         country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-egmcigars",          name: "EGM Cigars",                         url: "https://egmcigars.com",                                  country: "ch", city: "Balerna",         status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  , searchUrlTemplate: "https://egmcigars.com/search?q={q}"},

  // ─── Sweden ──── 15 verified ──────────────────────────────────────────────
  { id: "se-cigarrspecialisten", name: "Cigarrspecialisten (LCDH-tier Växjö)", url: "https://cigarrspecialisten.se",                        country: "se", city: "Växjö",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  , searchUrlTemplate: "https://cigarrspecialisten.se/?s={q}"},
  { id: "se-puros",              name: "Puros.se",                           url: "https://www.puros.se",                                   country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-tobakshop",          name: "Tobakshop",                          url: "https://tobakshop.se",                                   country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-swecigars",          name: "Swecigars",                          url: "https://swecigars.se",                                   country: "se", city: "Södertälje",      status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-tobax",              name: "Tobax",                              url: "https://tobax.se",                                       country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-mr-andersons",       name: "Mr Andersons Cigars",                url: "https://www.mrandersonscigars.se",                       country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-cigarrfabriken",     name: "Cigarrfabriken",                     url: "https://cigarrfabriken.se",                              country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-tabaquero",          name: "Tabaquero",                          url: "https://tabaquero.se",                                   country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-chefcigars",         name: "Chefcigars",                         url: "https://chefcigars.se",                                  country: "se", city: "Boden",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-snusfabriken",       name: "Snusfabriken (Haparanda)",           url: "https://snusfabriken.com",                               country: "se", city: "Haparanda",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-cigarrummet",        name: "Cigarrummet",                        url: "https://www.cigarrummet.com",                            country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  , searchUrlTemplate: "https://www.cigarrummet.com/search?q={q}"},
  { id: "se-cigarrhyllan",       name: "Cigarrhyllan",                       url: "https://cigarrhyllan.se",                                country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  , searchUrlTemplate: "https://cigarrhyllan.se/?s={q}"},
  { id: "se-cubano",             name: "Cubano (Linköpings Cigarrhandel)",   url: "https://cubano.se",                                      country: "se", city: "Linköping",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-robusto",            name: "Robusto",                            url: "https://robusto.se",                                     country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-kindcigars",         name: "Kind Cigars",                        url: "https://www.kindcigars.se",                              country: "se", city: "Helsingborg",     status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "se-brobergs",           name: "Brobergs Tobakshandel (since 1881)", url: "https://www.brobergs.se",                                country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Norway ──── 5 verified ───────────────────────────────────────────────
  { id: "no-solcigar",           name: "Sol Cigar Co. (Habanos Specialist)", url: "https://www.solcigar.no",                                country: "no", city: "Oslo",            status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "no-havanamagasinet",    name: "Havana-Magasinet (since 1899)",      url: "https://havanamagasinet.no",                             country: "no", city: "Stavanger",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "no-msorensen",          name: "M Sørensen",                         url: "https://msorensen.no",                                   country: "no", city: "Asker",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "no-sigar",              name: "Sigar.com (Viking Cigars)",          url: "https://www.sigar.com",                                  country: "no", city: "Risør",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "no-bamboolt",           name: "Bamboo-Shop (Trondheim)",            url: "https://bamboolt.com",                                   country: "no", city: "Trondheim",       status: "mixed",              shipsTo: "domestic",  hasPublicPricing: true  },

  // ─── Denmark ──── 9 verified ──────────────────────────────────────────────
  { id: "dk-danishpipeshop",     name: "The Danish Pipe Shop",               url: "https://www.danishpipeshop.com",                         country: "dk", city: "København",       status: "mixed",              shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "dk-cigarstuen",         name: "Cigarstuen",                         url: "https://cigarstuen.dk",                                  country: "dk",                          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "dk-havnens-vin",        name: "Havnens Vin- & Tobakshus",           url: "https://havnens-vin.dk",                                 country: "dk", city: "Vejle",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "dk-macanudo-cph",       name: "Cigar Shop Macanudo Copenhagen",     url: "https://www.cigarshopmacanudo-copenhagen.dk",            country: "dk", city: "København",       status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "dk-jware",              name: "JWare",                              url: "https://jware.dk",                                       country: "dk",                          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "dk-vinspec-aarhus",     name: "Vinspecialisten Aarhus / Pibehuset", url: "https://www.vinspecialistenaarhus.dk",                   country: "dk", city: "Aarhus",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "dk-vinspec-aalborg",    name: "Vinspecialisten Aalborg (HJ Hansen)", url: "https://www.vinspecialistenaalborg.dk",                 country: "dk", city: "Aalborg",         status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "dk-hjoerring",          name: "Hjørring Vinhandel",                 url: "https://www.hjoerring-vinhandel.dk",                     country: "dk", city: "Hjørring",        status: "mixed",              shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "dk-cognachuset",        name: "Cognachuset",                        url: "https://cognachuset.dk",                                 country: "dk",                          status: "mixed",              shipsTo: "domestic",  hasPublicPricing: true  },

  // ─── Netherlands ──── 5 verified ──────────────────────────────────────────
  { id: "nl-sigaren-online",     name: "Sigaren-Online (Hartman)",           url: "https://www.sigaren-online.nl",                          country: "nl", city: "Amsterdam",       status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "nl-tabakado",           name: "Tabakado (Habanos Specialist)",      url: "https://www.tabakado.nl",                                country: "nl", city: "Eindhoven",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "nl-vanrenssen",         name: "Van Renssen (since 1897)",           url: "https://vanrenssen.com",                                 country: "nl", city: "Delft",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "nl-lcdh-maastricht",    name: "LCDH Maastricht",                    url: "https://www.lacasadelhabanomaastricht.nl",               country: "nl", city: "Maastricht",      status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  },
  { id: "nl-vandalen",           name: "Van Dalen Cigars",                   url: "https://vandalen.com",                                   country: "nl", city: "Multi-store",     status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "nl-hajenius",           name: "P.G.C. Hajenius (since 1826)",       url: "https://www.hajenius.com",                               country: "nl", city: "Amsterdam",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Ireland ──── 2 verified ──────────────────────────────────────────────
  { id: "ie-jamesfox",           name: "James J. Fox Dublin (since 1881)",   url: "https://jamesfox.ie",                                    country: "ie", city: "Dublin",          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "ie-decentcigar",        name: "Decent Cigar Emporium",              url: "https://www.decent-cigar.com",                           country: "ie", city: "Dublin",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },

  // ─── Italy ──── 1 transactional + directory-only ──────────────────────────
  { id: "it-babalu",             name: "Tabaccheria Babalù (Sanremo)",       url: "https://www.tabaccheriababalu.it",                       country: "it", city: "Sanremo",         status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "it-sigarietabacchi",    name: "Sigari e Tabacchi (Padova)",         url: "https://sigarietabacchi.it",                             country: "it", city: "Padova",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false , searchUrlTemplate: "https://sigarietabacchi.it/?s={q}"},
  { id: "it-houseofcigars",      name: "House of Cigars (Venice)",           url: "https://houseofcigars.it",                               country: "it", city: "Venezia",         status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "it-bottegadelfumatore", name: "Bottega del Fumatore (Padova)",      url: "https://bottegadelfumatore.com",                         country: "it", city: "Padova",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "it-cigarsandco",        name: "Cigars and Co. (Milano)",            url: "https://www.cigarsandco.it",                             country: "it", city: "Milano",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "it-casadelsigaro",      name: "Casa del Sigaro (Torino)",           url: "https://www.casadelsigaro.com",                          country: "it", city: "Torino",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "it-bollitopipe",        name: "Bollito Pipe (Torino since 1958)",   url: "https://www.bollitopipe.it",                             country: "it", city: "Torino",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Portugal ──── 3 transactional + directory ────────────────────────────
  { id: "pt-a4-tabacarias",      name: "A4 Tabacarias (Habanos Specialist)", url: "https://shop.a4tabacarias.com",                          country: "pt", city: "Vilamoura",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "pt-garrafeira-pepe",    name: "Garrafeira Tio Pepe (since 1986)",   url: "https://garrafeirapepe.pt",                              country: "pt", city: "Porto",           status: "mixed",              shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "pt-sevenseas",          name: "DutyFree SevenSeas Lisbon",          url: "https://dutyfree-sevenseas.pt",                          country: "pt", city: "Lisboa",          status: "mixed",              shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "pt-habanero",           name: "Habanero (LCDH Lisboa)",             url: "https://www.habanero.pt",                                country: "pt", city: "Lisboa",          status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "pt-casa-havaneza",      name: "Casa Havaneza (since 1864)",         url: "https://casahavaneza.com",                               country: "pt", city: "Lisboa",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Spain ──── 1 reservation-channel + directory ─────────────────────────
  { id: "es-cigarsmokerclub",    name: "Cigar Smoker Club (legal reservation channel)", url: "https://cigarsmokerclub.com",               country: "es",                          status: "reservation",        shipsTo: "domestic",  hasPublicPricing: true  , searchUrlTemplate: "https://cigarsmokerclub.com/?s={q}"},
  { id: "es-magallanes",         name: "Cigar Shop Magallanes (largest humidor)", url: "https://magallanes.store",                          country: "es", city: "Madrid",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-madrid",        name: "LCDH Madrid Recoletos",              url: "https://lacasadelhabano-dl.es",                          country: "es", city: "Madrid",          status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-tenerife",      name: "LCDH Adeje Tenerife",                url: "https://www.lacasadelhabano-tenerife.com",               country: "es", city: "Adeje",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-gran-canaria",  name: "LCDH Mogán Gran Canaria",            url: "https://www.lacasadelhabano-tenerife.com",               country: "es", city: "Mogán",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-mallorca",      name: "LCDH Palma de Mallorca",             url: "https://habanos.com",                                    country: "es", city: "Palma",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Belgium ──── 5 LCDH directory-only (online sale banned) ──────────────
  { id: "be-lcdh-antwerp",       name: "LCDH Antwerpen",                     url: "https://www.lcdhantwerp.com",                            country: "be", city: "Antwerpen",       status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false , searchUrlTemplate: "https://www.google.com/search?q={q}+site%3Alcdhantwerp.com"},
  { id: "be-lcdh-brussels",      name: "LCDH Brussel (Charlemagne)",         url: "https://lacasadelhabano.brussels",                       country: "be", city: "Brussels",        status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false , searchUrlTemplate: "https://www.google.com/search?q={q}+site%3Alacasadelhabano.brussels"},
  { id: "be-lcdh-knokke",        name: "LCDH Knokke",                        url: "https://lacasadelhabano-knokke.be",                      country: "be", city: "Knokke",          status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "be-davidoff-brussels",  name: "Davidoff Brussels (non-Cuban LCDT)", url: "https://davidoff.com",                                   country: "be", city: "Brussels",        status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── France ──── directory-only (online sale banned by Art. 568 ter CGI) ──
  { id: "fr-alacivette",         name: "À La Civette (Paris, since 1716)",   url: "https://alacivette.com",                                 country: "fr", city: "Paris",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "fr-cigarestore-lyon",   name: "CigareStore (Lyon)",                 url: "https://cigarestore.fr",                                 country: "fr", city: "Lyon",            status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "fr-lediplomate",        name: "Le Diplomate (Lyon)",                url: "https://lediplomate-cigare-lyon.com",                    country: "fr", city: "Lyon",            status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "fr-civette-marseille",  name: "O'Théo Civette (Marseille)",         url: "https://civette-marseille.com",                          country: "fr", city: "Marseille",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "fr-comptoir-cigare",    name: "Le Comptoir du Cigare (Strasbourg)", url: "https://lecomptoirducigare.fr",                          country: "fr", city: "Strasbourg",      status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Austria ──── directory-only (no transactional webshops) ──────────────
  { id: "at-mohilla",            name: "Maria Mohilla (Vienna, since 1692)", url: "https://habanos.com",                                    country: "at", city: "Wien",            status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "at-svoboda",            name: "Trafik Svoboda (Zigarren Welt)",     url: "https://habanos.com",                                    country: "at", city: "Wien",            status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "at-egger-salzburg",     name: "Gerald Egger (Salzburg)",            url: "https://habanos.com",                                    country: "at", city: "Salzburg",        status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Czech Republic ─── directory ─────────────────────────────────────────
  { id: "cz-lcdh-prague",        name: "LCDH Prague",                        url: "http://www.lacasadelhabano.cz",                          country: "cz", city: "Praha",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Greece ──── 2 verified ───────────────────────────────────────────────
  { id: "gr-cigarsgalaxy",       name: "Cigars Galaxy",                      url: "https://www.cigarsgalaxy.gr",                            country: "gr", city: "Athens",          status: "mixed",              shipsTo: "eu",        hasPublicPricing: true  },
  { id: "gr-cigarsmoke",         name: "CigarSmoke",                         url: "https://cigarsmoke.gr",                                  country: "gr", city: "Athens",          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },

  // ─── Finland ──── 1 LCDH directory (all online sale illegal) ──────────────
  { id: "fi-havanna-aitta",      name: "Havanna-Aitta (LCDH, since 1897)",   url: "https://www.havanna-aitta.fi",                           country: "fi", city: "Helsinki",        status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
];

export const RETAILER_BY_ID: Record<string, Retailer> = Object.fromEntries(
  RETAILERS.map((r) => [r.id, r]),
);

// ============================================================================
// SKUs — the canonical Cuban (Habanos) catalog for v1 of The Finder
// Twelve flagship SKUs spanning entry-level (Romeo PC) to ultra-premium (Behike).
// ============================================================================
export const SKUS: Sku[] = [
  { id: "cohiba-robustos",        slug: "cohiba-robustos",        brand: "Cohiba",            line: "Línea Clásica",  vitola: "Robustos",          shape: "Robusto",       ring: 50, lengthMm: 124, boxSize: 25, prestige: "flagship", strength: "full", flavorNotes: ["Cedar", "Coffee", "Chocolate", "Leather", "Nutty"],
    blurb: "The Cuban robusto that defines the format. Built for after-dinner intensity with deep coffee, cocoa, and cedar.",
    editorial: "The Cohiba Robustos was added to the Línea Clásica in 1989 and within a decade became the benchmark every other premium Cuban robusto would be measured against. The blend uses three fermented Vuelta Abajo leaves — seco, ligero, and the proprietary medio tiempo that Cohiba reserves for its top vitolas — wrapped in a silky golden-brown corojo leaf. The first third opens with cocoa and roasted coffee, the middle drifts into cedar and a hint of toasted almond, and the last third earns the price tag with a long, leathery finish that rewards slow puffing.\n\nPrice spread across Europe is unusually wide on this SKU. A box of 25 sits around €1,930 at Germany's largest online retailer and CHF 2,040 at Switzerland's reference LCDH — meaning the Swiss box converts to roughly €2,150 after FX. Spain and Sweden, where state pricing or restrictive online frameworks apply, surface boxes between €2,000 and €2,100 equivalent. Switzerland's edge comes from a lower VAT base (8.1% vs. the EU's 19–25%) but the cross-border shipping picks up customs handling that closes the gap for most EU buyers. Compare carefully before clicking through."
  },
  { id: "cohiba-behike-52",       slug: "cohiba-behike-52",       brand: "Cohiba",            line: "Behike",         vitola: "Behike 52",         shape: "Robusto Extra", ring: 52, lengthMm: 119, boxSize: 10, prestige: "flagship", strength: "full", flavorNotes: ["Earthy", "Chocolate", "Coffee", "Leather", "Peppery", "Sweet", "Woody"],
    blurb: "The smaller of the Behike line. Medio Tiempo–leaf blend that's been Habanos's most allocated cigar since 2010.",
    editorial: "The Behike line — BHK 52, 54, and 56 — launched in 2010 and rewrote what a Cuban cigar could be. The Behike 52 is the entry vitola of the three, a 4.7-inch Robusto Extra wrapped in a sun-aged Habano 2000 leaf and filled with the rare medio tiempo leaf, taken only from the top two leaves of the strongest tobacco plants and harvested in roughly one out of three crops. Habanos S.A. allocates the Behike globally on tight country-by-country quotas, which is why a box of ten is often listed as 'on request' or 'sold out' at the same retailer that has Robustos in stock.\n\nThe smoke itself is dense, oily, and remarkably balanced. The first inch carries earth and dark chocolate; the body opens into espresso, leather, and a touch of black pepper around the band; the final third delivers a sweet woody finish that aficionados often compare to a vintage Pauillac. Across Europe a box of ten sits in the SEK 17,000–20,000 band (~€1,500–€1,700) in Sweden and lifts to CHF 2,860 (~€3,000) at Swiss LCDH retailers. Verify the box code before purchase — counterfeits are commonest on this exact SKU."
  },
  { id: "cohiba-siglo-iv",        slug: "cohiba-siglo-iv",        brand: "Cohiba",            line: "Línea 1492",     vitola: "Siglo IV",          shape: "Corona Gorda",  ring: 46, lengthMm: 143, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Floral", "Sweet", "Creamy", "Cedar"],
    blurb: "The most balanced of the Línea 1492. A medium-bodied corona gorda built for two-hour evenings.",
    editorial: "Cohiba launched the Línea 1492 in 1992 to commemorate Columbus's first crossing. The Siglo IV is the fourth vitola in the series and the one most Cuban aficionados nominate as the line's sweet spot — a 5.6-inch Corona Gorda that delivers Cohiba's signature creamy honeyed profile without the price tag (or the smoking time) of the Behike. The blend is lighter than the Línea Clásica and noticeably more elegant, with first-third floral notes that drift through honey, butter, and aged cedar into a finish that rarely goes harsh.\n\nThe Siglo IV is one of the SKUs where retailer discounting actually happens. Switzerland's Cigarmust runs the box of 25 at CHF 1,450 with frequent CHF 1,300 promotional drops; Germany's Noblego sits around €1,350. The 10% spread between cheapest and dearest European retailer is one of the wider gaps in the Cohiba catalogue — well worth setting a price-drop alert on if you smoke this vitola regularly."
  },
  { id: "cohiba-esplendidos",     slug: "cohiba-esplendidos",     brand: "Cohiba",            line: "Línea Clásica",  vitola: "Espléndidos",       shape: "Julieta No.2",  ring: 47, lengthMm: 178, boxSize: 25, prestige: "flagship", strength: "medium", flavorNotes: ["Hay", "Creamy", "Toast", "Coffee", "Chocolate", "Peppery", "Leather", "Cedar"],
    blurb: "Castro's gift to heads of state. The Cuban Churchill that built the Cohiba mythology.",
    editorial: "If one cigar built the Cohiba mythology it's the Espléndidos. The 7-inch Julieta No. 2 (Habanos's name for the Churchill format) is what Fidel Castro reportedly handed to foreign heads of state in the 1980s, and it remains the line's most photographed vitola. The Espléndidos was originally a diplomat-only release; it joined the commercial catalogue in 1989 alongside the Robustos and Exquisitos, and the trio became the Línea Clásica that anchors Cohiba to this day.\n\nThe smoke is built for a long evening — 90 to 120 minutes if you draw slowly. The first third is gentle, with hay, butter, and toasted bread; the middle blooms into espresso, cocoa, and a hint of pepper; the last third earns the legend with a leather-and-cedar finish that holds without burning hot. The Espléndidos sits at the top of the standard Cohiba pricing pyramid: a box of 25 lists at roughly £2,950 in the UK and CHF 3,300 at Swiss reference LCDH stores. Price stability is high across European retailers — this is the SKU where spread is tightest because demand routinely exceeds supply."
  },
  { id: "montecristo-no-4",       slug: "montecristo-no-4",       brand: "Montecristo",       line: "Línea Clásica",  vitola: "No. 4",             shape: "Mareva",        ring: 42, lengthMm: 129, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Earthy", "Woody", "Sweet"],
    blurb: "The most-sold Cuban cigar of all time. A 45-minute petit corona that built the modern Habanos market.",
    editorial: "The Montecristo No. 4 is, by Habanos S.A.'s own accounting, the best-selling Cuban cigar in history. It's a 5.1-inch Mareva that's been in continuous production since 1935, and roughly one in five boxes Habanos ships globally each year is a box of No. 4s. The blend is medium-bodied with the Montecristo signature — earthy, woody, and a touch sweet — built around a Vuelta Abajo filler and a sturdy Habano wrapper that ages remarkably well in a humidor over three to five years.\n\nThe price-comparison value here is real. The No. 4 sits at the lowest end of the Cuban premium range, which means absolute price differences across Europe are small (€20–€50 per box) but the percentage spread is meaningful relative to the box price. Germany's Noblego runs around €358; Italy's licensed tabaccherie list it near €365 (per-stick pricing converted to box equivalent); Belgium's LCDH Antwerp posts €372; Switzerland's Cigarmust drops it to CHF 378 when discounted (~€395 after FX). Ireland's James J. Fox Dublin and the Netherlands' Hajenius round out the upper end. A weekly smoker can save the price of three or four sticks per box by comparing first."
  },
  { id: "montecristo-no-2",       slug: "montecristo-no-2",       brand: "Montecristo",       line: "Línea Clásica",  vitola: "No. 2",             shape: "Pirámides",     ring: 52, lengthMm: 156, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Coffee", "Leather", "Peppery", "Chocolate", "Earthy", "Cedar"],
    blurb: "The reference pyramid. Coffee, leather, and a long earthy finish — what most aficionados use to grade other pirámides.",
    editorial: "The Montecristo No. 2 is the reference Pirámides. When aficionados argue about whether a regional or limited-edition pirámide is good, this is the cigar they're comparing it against. A 6.1-inch tapered figurado with a 52 ring gauge at the foot, the No. 2 was added to the Montecristo line in 1936 and has anchored the brand's premium tier ever since. The tapered head concentrates the smoke as it draws, which is what gives the No. 2 its signature density compared to a parejo of the same length.\n\nThe smoke evolves more dramatically than most other Cuban premiums. First third opens with espresso, leather, and a touch of black pepper; the middle moves through cocoa and dried fruit; the last third drops into a deep earthy finish with hints of aged cedar. Average smoking time is 75 to 90 minutes. Across Europe, the box of 25 spreads from £580 in the UK (Turmeaus, C.Gars) to €645 in Germany (Noblego) and CHF 720 at Cigarmust — a ~€100 absolute spread that's worth a 30-second comparison before purchase."
  },
  { id: "montecristo-petit-edmundo", slug: "montecristo-petit-edmundo", brand: "Montecristo", line: "Línea Edmundo",  vitola: "Petit Edmundo",     shape: "Petit Edmundo", ring: 52, lengthMm: 110, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Coffee", "Leather", "Chocolate", "Woody"],
    blurb: "A modern Montecristo built around the Edmundo blend in a shorter, punchier 45-minute format.",
    editorial: "The Línea Edmundo is the modern face of Montecristo. Launched in 2004 to capture the under-50-minute slot that the No. 4 had owned for decades, the line is named after Edmond Dantès — the count of Monte Cristo himself — and uses a slightly thicker ring gauge with a darker, oilier wrapper than the Línea Clásica. The Petit Edmundo is the shortest of the line at 4.3 inches with a 52 ring, designed for the busy professional who wants Montecristo flavour in under an hour.\n\nThe smoke is fuller-bodied than the No. 4 but stops well short of the No. 2's intensity. Expect rich espresso, leather, and a chocolate finish — Montecristo's signature notes amplified by the thicker ring gauge. The Petit Edmundo is also one of the smoothest younger Cubans, which makes it a frequent gift for transitioning Nicaraguan smokers. Pricing across Europe runs roughly €500 to €630 per box of 25, with Switzerland's Cigarmust frequently dropping into the lower CHF 600s during promotional cycles."
  },
  { id: "partagas-serie-d-no-4",  slug: "partagas-serie-d-no-4",  brand: "Partagás",          line: "Serie D",        vitola: "Serie D No. 4",     shape: "Robusto",       ring: 50, lengthMm: 124, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Peppery", "Earthy", "Woody", "Leather"],
    blurb: "The Partagás standard-bearer. Bigger and more peppery than a Cohiba Robusto; the benchmark Cuban robusto.",
    editorial: "The Partagás Serie D No. 4 is the cigar most experienced Cuban smokers nominate as the best-value premium robusto on the market. Same dimensions as the Cohiba Robustos (5 inches × 50 ring) but with the Partagás factory's signature heavier, more pepper-forward blend, the Serie D No. 4 was relaunched in 2001 and has been a runaway commercial success ever since. The wrapper is a darker, oilier Habano than Cohiba's; the filler leans heavier on Vuelta Abajo ligero, which is what gives the cigar its distinctive black-pepper and earth opening.\n\nFor the buyer, the Serie D No. 4 is one of the best price-spread cigars in the Habanos catalogue. Germany's Noblego runs roughly €524 per box of 25; Italy's licensed tabaccherie list €545; Ireland's James J. Fox Dublin €555; Switzerland's Cigarmust CHF 587 when discounted (~€616 after FX). The €90+ spread between cheapest and dearest European retailer is one of the widest in the standard Cuban catalogue and translates to almost four free cigars per box if you compare first. The cigar ages exceptionally well — three to five years in a humidor smooths the pepper into something closer to a Cohiba's complexity."
  },
  { id: "romeo-y-julieta-petit-coronas", slug: "romeo-y-julieta-petit-coronas", brand: "Romeo y Julieta", line: "Línea Clásica", vitola: "Petit Coronas", shape: "Mareva", ring: 42, lengthMm: 129, boxSize: 25, prestige: "standard", strength: "mild", flavorNotes: ["Creamy", "Floral", "Hay", "Sweet", "Cedar"],
    blurb: "Winston Churchill's reported daily smoke. A creamy, accessible petit corona that's a working-aficionado favorite.",
    editorial: "The Romeo y Julieta Petit Coronas is the working aficionado's daily Cuban. A 5.1-inch Mareva — same dimensions as a Montecristo No. 4 but with the Romeo y Julieta factory's lighter, floral blend — it's the cigar most regularly recommended as a first Cuban beyond the entry-level Quintero and Jose L. Piedra range. Romeo y Julieta is also the brand most strongly associated with Winston Churchill, who reportedly smoked Petit Coronas (or the larger Churchill format named after him) daily for half a century.\n\nThe smoke is creamy, buttery, and floral. First third opens with hay and a hint of honey; the middle settles into butter, cedar, and a subtle floral note that's the brand's calling card; the last third stays smooth without ever turning harsh. Smoking time runs 40 to 50 minutes. Across Europe the Petit Coronas is one of the most price-competitive boxes in the Cuban catalogue: £215 at UK retailers, €238 at Germany's Noblego, €245 at LCDH Brussels, CHF 285 at Cigarmust. The £20-30 absolute spread is small but on a daily-smoker SKU it adds up across a year of box purchases."
  },
  { id: "hoyo-de-monterrey-epicure-no-2", slug: "hoyo-de-monterrey-epicure-no-2", brand: "Hoyo de Monterrey", line: "Le Hoyo", vitola: "Epicure No. 2", shape: "Robusto", ring: 50, lengthMm: 124, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Hay", "Sweet", "Nutty", "Cedar", "Toast"],
    blurb: "The smoother, lighter robusto in the Habanos line-up. Honey, hay, and cedar — a brunch cigar with serious depth.",
    editorial: "Hoyo de Monterrey's Epicure No. 2 occupies a specific seat in the Habanos catalogue: the same 5×50 robusto format as a Cohiba Robustos or Partagás Serie D No. 4, but built around Hoyo's distinctively lighter, sweeter blend. Where the Partagás opens with pepper and the Cohiba leads with cocoa, the Epicure No. 2 starts with hay and honey, drifts into a creamy almond middle, and finishes on a long cedar-and-toast note. It's the robusto most often suggested as a daytime or 'before lunch' Cuban — full enough to be interesting, light enough not to overwhelm a meal.\n\nThe Epicure No. 2 has unusually flat price spread across European retailers, which suggests Hoyo's modest demand profile relative to Cohiba and Partagás. Germany's Noblego runs €499 per box of 25; the UK's Turmeaus sits around £445 (~€530); Switzerland's Cigarmust CHF 590 (~€620); the Netherlands' Hajenius €525. The €120 absolute spread between cheapest and dearest is moderate; what makes this SKU worth comparing is the surprisingly consistent in-stock availability, which is rare in the post-2024 Cuban-cigar allocation environment."
  },
  { id: "trinidad-reyes",         slug: "trinidad-reyes",         brand: "Trinidad",          line: "Línea Clásica",  vitola: "Reyes",             shape: "Minuto",        ring: 40, lengthMm: 110, boxSize: 12, prestige: "premium", strength: "medium", flavorNotes: ["Floral", "Leather", "Cedar", "Peppery", "Citrus"],
    blurb: "Trinidad's gateway vitola. A 35-minute minuto with the line's signature floral, leather complexity.",
    editorial: "Trinidad is the most exclusive of the four Cuban brands aficionados typically rank in the top tier (the others being Cohiba, Montecristo, and Partagás). The brand was originally a diplomatic-only release in the 1990s and entered the commercial market in 1998 with five vitolas, all hand-rolled at the El Laguito factory that also produces Cohiba. The Reyes is the smallest in the Línea Clásica — a 4.3-inch, 40-ring Minuto designed for a 30-to-40-minute smoke.\n\nWhat makes Trinidad worth the premium is the blend's signature complexity. The Reyes opens with floral notes — orange blossom, jasmine — that few other Cuban brands deliver; the middle settles into leather, cedar, and a touch of pepper; the finish is short but elegant. Boxes of 12 run roughly €791 at Noblego (~€66 per cigar), CHF 412 discounted at Cigarmust (~€433 box, ~€36/cigar — the cheapest in Europe), and £690 at EGM Cigars in London. The Swiss-vs-rest spread here is the widest in this catalogue: the Cigarmust price is almost half the Noblego price, which makes the Trinidad Reyes the single highest-leverage SKU to comparison-shop before purchase."
  },
  { id: "bolivar-belicosos-finos", slug: "bolivar-belicosos-finos", brand: "Bolívar",         line: "Línea Clásica",  vitola: "Belicosos Finos",   shape: "Campana",       ring: 52, lengthMm: 140, boxSize: 25, prestige: "premium", strength: "extra_full", flavorNotes: ["Leather", "Peppery", "Earthy", "Chocolate", "Cedar"],
    blurb: "Bolívar's most beloved campana. Full-bodied, peppery, leather-and-tar — the connoisseur's strong Cuban.",
    editorial: "Bolívar is the strong man of the Habanos catalogue. Named after South American liberator Simón Bolívar and produced at the Partagás factory in Havana, the brand has been the connoisseur's choice for full-bodied Cubans since the 1920s. The Belicosos Finos is the marquee vitola — a 5.5-inch tapered Campana with a 52 ring at the foot — and it delivers Bolívar's signature unapologetically forceful flavour profile.\n\nThe smoke is intense from the first puff. Expect leather, pepper, dark earth, and a tar note that some smokers describe as 'the Cuban equivalent of a heavily peated Islay'. The middle third softens into cocoa and aged cedar but never loses the underlying force; the last third earns its reputation as one of the most rewarding finishes in any non-Cohiba premium. Across Europe the box of 25 spreads from £575 at Sautter in London to €612 at Noblego, €595 at Athens-based CigarSmoke, and CHF 745 at Cigarmust — a meaningful £170 (~€200) absolute spread that justifies a few minutes of comparison. The cigar ages exceptionally well; five-year-old Bolívar Belicosos Finos are among the most sought-after aged Cubans in the secondary market."
  },
  { id: "cohiba-siglo-vi",        slug: "cohiba-siglo-vi",        brand: "Cohiba",            line: "Línea 1492",     vitola: "Siglo VI",          shape: "Cañonazo",      ring: 52, lengthMm: 150, boxSize: 25, prestige: "flagship", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Sweet", "Coffee", "Woody"],
    blurb: "The biggest of the Línea 1492. A two-hour smoke with the Siglo line's elegant honeyed profile in a thicker, slower-burning Cañonazo format.",
    editorial: "Launched in 2002 a decade after the rest of the Línea 1492, the Siglo VI was Cohiba's answer to demand for a larger, longer-smoking Siglo. The 5.9-inch Cañonazo is the biggest in the 1492 series and runs roughly 90 to 120 minutes if you draw slowly. The blend is unmistakably Siglo — lighter and more elegant than the Línea Clásica, with the cedar, honey and creamy butter signature — but the 52 ring gauge and Cañonazo shape (similar to a Toro Grande) push the smoke into a fuller register. First third opens with cedar and pastry; middle drifts into honey, butter and a touch of espresso; the last third earns the price tag with a long, sweet finish that rarely gets harsh.\n\nPrice spread across Europe is wider than most Cohiba SKUs because demand has crept up faster than allocation. Germany's Noblego runs roughly €1,850 per box of 25; Switzerland's Cigarmust posts CHF 2,100 (~€2,200 after FX); Sweden's Cigarrummet sits around SEK 19,500. The 15% spread between cheapest and dearest European retailer is meaningful in absolute terms — a €350 swing — and price-drop alerts on this SKU pay off."
  },
  { id: "montecristo-edmundo",    slug: "montecristo-edmundo",    brand: "Montecristo",       line: "Línea Edmundo",  vitola: "Edmundo",           shape: "Edmundo",       ring: 52, lengthMm: 135, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Coffee", "Chocolate", "Leather", "Earthy", "Cedar"],
    blurb: "The flagship of the Edmundo line and the modern Montecristo benchmark. Fuller-bodied than the Línea Clásica with cocoa, espresso and a hint of cedar.",
    editorial: "When Habanos S.A. launched the Línea Edmundo in 2004, the Edmundo itself was the showpiece — a 5.3-inch, 52-ring vitola named after Edmond Dantès, the count of Monte Cristo in Dumas's novel. The line was Montecristo's first serious move into thicker, oilier modern formats, and the Edmundo became the line's commercial anchor. It is fuller-bodied than the Línea Clásica No. 2 or No. 4 — darker wrapper, more ligero in the filler, an oilier finish — and the Robusto-style shape concentrates the smoke into a richer, denser register.\n\nThe smoke evolves dramatically. First third opens with espresso, cocoa and a touch of leather; the middle blooms into earthy notes with hints of dark chocolate and aged cedar; the last third drops into a long, slow finish with coffee, leather and a whisper of dried fruit. Smoking time runs 60 to 75 minutes. Across Europe the Edmundo sits in the middle of the Montecristo price band: Noblego runs roughly €670 per box of 25, Cigarworld around €690, Cigarmust CHF 715 (~€750 after FX). The €80 absolute spread between cheapest and dearest European retailer is a typical Montecristo-tier deal — worth a 30-second comparison before purchase, especially in restock cycles."
  },
  { id: "romeo-y-julieta-wide-churchills", slug: "romeo-y-julieta-wide-churchills", brand: "Romeo y Julieta", line: "Línea Clásica", vitola: "Wide Churchills", shape: "Montesco", ring: 55, lengthMm: 130, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Sweet", "Cedar", "Coffee", "Woody"],
    blurb: "A thick modern take on the Romeo Churchill. Plenty of smoke, plenty of time, with a creamy floral profile in a hour-and-a-half format.",
    editorial: "The Wide Churchills was added to the Romeo y Julieta Línea Clásica in 2010 as Habanos's response to a decade of demand for larger ring gauges. At 5.1 inches by a chunky 55 ring (Habanos calls the shape Montesco), it's noticeably wider and shorter than the brand's signature Churchill, and the thicker ring gauge delivers more smoke per puff while keeping the burn temperature manageable. The blend is Romeo's signature creamy, floral, honeyed profile — lighter than Partagás, less sweet than Hoyo — and the Wide Churchills format suits it well by giving the lighter blend more air around it.\n\nFlavor arc is gentle but layered. First third opens with butter, honey and a faint hay note; the middle settles into cedar and white pepper with a touch of toasted bread; the last third delivers a smooth, slightly floral finish that rarely turns harsh. Smoking time runs 75 to 90 minutes. The Wide Churchills is consistently in stock across European retailers, which keeps the price spread narrow: Noblego runs roughly €625 per box of 25, Belgium's Cigar Smoker Club €640, Cigarmust CHF 690 (~€720). The €100 absolute spread is typical for a daily-smoker SKU — small per box but it adds up across the four or five boxes a regular Wide Churchills aficionado works through each year."
  },
  { id: "partagas-lusitanias",    slug: "partagas-lusitanias",    brand: "Partagás",          line: "Línea Clásica",  vitola: "Lusitanias",        shape: "Prominente",    ring: 49, lengthMm: 194, boxSize: 25, prestige: "flagship", strength: "full", flavorNotes: ["Earthy", "Peppery", "Leather", "Coffee", "Woody"],
    blurb: "The Cuban Double Corona. Three-hour Partagás powerhouse with the line's signature pepper-and-earth profile in a serious format.",
    editorial: "The Lusitanias is the longest cigar in the Partagás Línea Clásica and the most-cited Cuban Double Corona on the market. At 7.6 inches by 49 ring (Habanos calls the shape Prominente, the same as Hoyo de Monterrey's Double Corona and Punch's Double Corona), it's a three-hour cigar built for evenings with no agenda. The blend is unmistakably Partagás — pepper, earth and a dark Habano wrapper that produces a thick, oily smoke — and the long format lets the cigar evolve through three distinct phases.\n\nFirst hour opens with black pepper, dark earth and a touch of espresso; the middle hour softens into leather, cocoa and a whisper of cedar; the final stretch delivers a long, dense finish with woody, almost balsamic notes. The cigar ages exceptionally well; five-year-old Lusitanias are among the most sought-after aged Cubans on the secondary market. Across Europe a box of 25 sits in the €750 to €820 range at most retailers: Noblego runs roughly €765, Cigarworld around €780, Cigarmust CHF 815 (~€855 after FX), Italian tabaccherie post €795. The €100 absolute spread is moderate, but the Lusitanias is also one of the most allocated Cuban SKUs — pre-orders sometimes beat in-stock pricing by 5 to 8 percent, so a watchlist alert here saves real money."
  },
  { id: "h-upmann-magnum-46",     slug: "h-upmann-magnum-46",     brand: "H. Upmann",         line: "Magnum Series", vitola: "Magnum 46",         shape: "Corona Gorda",  ring: 46, lengthMm: 143, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Hay", "Sweet", "Nutty"],
    blurb: "H. Upmann's most-recommended modern vitola. Mild-medium body with a creamy, cedar-led profile that suits an aficionado's first Cuban.",
    editorial: "H. Upmann is one of the oldest Cuban marcas still in continuous production — founded in 1844 by a German banker and trader who liked Cuban cigars enough to start importing them, then making them. The Magnum series was launched in 2001 to bring H. Upmann's gentler, more elegant blend into the larger ring-gauge formats that had started to dominate the market. The Magnum 46 is the entry vitola at 5.6 inches by 46 ring — a Corona Gorda format that smokes for roughly an hour and is widely recommended as a first Cuban for smokers transitioning from milder Nicaraguan or Dominican brands.\n\nThe profile is the mildest of the Cuban premium catalogue. First third opens with butter, hay and a faint nuttiness; the middle drifts into cedar, honey and a touch of toasted almond; the last third delivers a smooth, slightly sweet finish that holds without burning hot. Smoking time runs 60 to 75 minutes. Across Europe a box of 25 sits in the €420 to €510 range: Noblego runs roughly €435, Cigarworld around €450, Cigarmust CHF 495 (~€520 after FX), Italian tabaccherie post €465. The €85 absolute spread is one of the wider gaps in the H. Upmann catalogue, and the Magnum 46 is consistently in stock — making it the easiest H. Upmann SKU to price-comparison shop."
  },
  { id: "cohiba-siglo-ii",        slug: "cohiba-siglo-ii",        brand: "Cohiba",            line: "Línea 1492",     vitola: "Siglo II",          shape: "Marevas",       ring: 42, lengthMm: 129, boxSize: 25, prestige: "premium", strength: "mild", flavorNotes: ["Creamy", "Cedar", "Hay", "Sweet", "Floral"],
    blurb: "The mildest Siglo. A 40-minute Marevas built around Cohiba's signature honeyed, cedar-led blend in the most accessible Línea 1492 format.",
    editorial: "Released in 1992 with the rest of the Línea 1492 to mark the 500th anniversary of Columbus's first crossing, the Siglo II is the smallest and gentlest of the line — a 5.1-inch Marevas (the same dimensions as a Montecristo No. 4 or a Romeo Petit Coronas) wrapped in the lighter, silkier Línea 1492 blend. It's the Siglo most often recommended to smokers transitioning to Cuban premiums, because the format is unintimidating but the Cohiba blend is unmistakable.\n\nThe smoke is gentle from the start. First third opens with butter, hay and a faint floral note; the middle settles into Cohiba's trademark honeyed cedar; the last third delivers a smooth, slightly creamy finish with subtle sweetness that holds without ever turning harsh. Smoking time runs 35 to 45 minutes — the perfect length for an after-dinner espresso pairing. Across Europe a box of 25 sits in the €620 to €750 band: Germany's Noblego runs roughly €650, Belgium's LCDH Brussels around €670, Switzerland's Cigarmust CHF 750 (~€790 after FX). The €130 absolute spread is wide enough that a price-drop alert pays off; the Siglo II is also one of the more consistently in-stock Cohibas, which makes comparison-shopping easier than for the Robustos or Behikes."
  },
  { id: "romeo-y-julieta-short-churchills", slug: "romeo-y-julieta-short-churchills", brand: "Romeo y Julieta", line: "Línea Clásica", vitola: "Short Churchills", shape: "Robusto", ring: 50, lengthMm: 124, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Floral", "Sweet", "Cedar", "Hay"],
    blurb: "Romeo's robusto. The brand's most-popular Línea Clásica vitola in a 60-minute format with their signature creamy, floral profile.",
    editorial: "The Short Churchills joined the Romeo y Julieta Línea Clásica in 2006 to compete with the Cohiba Robustos and Partagás Serie D No. 4 in the increasingly popular 5×50 robusto slot. It uses the same gentle, floral, cedar-forward Romeo blend as the brand's iconic Churchill — and the shorter, thicker format made it a runaway success. Today it's one of the best-selling Cuban robustos by box volume worldwide, and the tubo (aluminum-tubed) presentation is one of the most-shipped Cuban tubed cigars on the market.\n\nThe smoke is the gentlest of the major Cuban robustos. First third opens with butter, hay and a faint orange-blossom floral note; the middle drifts into Romeo's signature cedar-and-honey core; the last third delivers a creamy, slightly sweet finish that never gets harsh. Smoking time runs 55 to 70 minutes. The Short Churchills is also one of the price-spread-friendly Cuban robustos: Noblego runs around €625 per box of 25, LCDH Brussels €640, Switzerland's Cigarmust CHF 690 (~€720), Spain's regulated estancos slightly higher at €680. The 8 to 12 percent spread across European retailers is meaningful but not extreme — worth a comparison check, especially for the tubo box format where pricing varies more than the standard SLB."
  },
  { id: "bolivar-royal-coronas",  slug: "bolivar-royal-coronas",  brand: "Bolívar",           line: "Línea Clásica",  vitola: "Royal Coronas",     shape: "Robusto",       ring: 50, lengthMm: 124, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Leather", "Peppery", "Earthy", "Coffee", "Woody"],
    blurb: "Bolívar's daily robusto. Full-bodied, leather-and-pepper Cuban benchmark in the same 5×50 format as Cohiba Robustos and Partagás Serie D No. 4.",
    editorial: "The Royal Coronas is the Bolívar most aficionados recommend as the brand's entry vitola — a 4.9-inch robusto with the brand's signature unapologetically forceful blend, but in the most accessible 60-minute format. Bolívar is the strong man of the Habanos catalogue, named after South American liberator Simón Bolívar, produced at the Partagás factory in Havana, and the Royal Coronas is the SKU that most often introduces smokers to the brand's leather-and-pepper register.\n\nThe smoke opens with intensity. First third delivers black pepper, dark earth and a touch of leather; the middle settles into espresso, dark chocolate and aged cedar; the last third blooms into a long, dense finish with cocoa and wood. Smoking time runs 60 to 75 minutes. The Royal Coronas is also one of the wider price-spread Bolívar SKUs across Europe: Noblego runs around €440 per box of 25, the UK's C.Gars / Turmeaus £415 (~€495), Switzerland's Cigarmust CHF 495 (~€520 after FX). The €80 absolute spread is moderate but the Royal Coronas restocks often, which means comparison-shopping pays off — and the cigar ages exceptionally well, so a box bought cheap and humidor'd for three years rewards the patience."
  },
  { id: "hoyo-de-monterrey-epicure-especial", slug: "hoyo-de-monterrey-epicure-especial", brand: "Hoyo de Monterrey", line: "Le Hoyo", vitola: "Epicure Especial", shape: "Hermoso No. 1", ring: 50, lengthMm: 141, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Hay", "Sweet", "Creamy", "Cedar", "Nutty"],
    blurb: "The thicker, longer Hoyo Epicure. Hay, honey and almond in a 75-minute Hermoso No. 1 — the connoisseur's daytime Hoyo.",
    editorial: "The Epicure Especial joined the Le Hoyo line in 2008 to extend the Epicure family with a thicker, longer format. At 5.6 inches by a 50 ring (Habanos calls the shape Hermoso No. 1), it's noticeably bigger than the Epicure No. 2 and delivers more smoke per draw while keeping Hoyo's signature lighter, sweeter blend. The wrapper is the lighter, more uniform Habano that Hoyo de Monterrey uses across the Epicure family; the filler is a touch heavier on seco than the No. 2, which is what gives the Especial its slightly fuller body and longer finish.\n\nThe smoke profile is unmistakably Hoyo. First third opens with hay, honey and a faint almond note; the middle drifts into Hoyo's creamy cedar-and-butter core; the last third delivers a long, slightly toasty finish with subtle sweetness. Smoking time runs 70 to 90 minutes. Across Europe a box of 25 sits in the €510 to €620 range: Germany's Noblego runs around €545, Switzerland's Cigarmust CHF 605 (~€635 after FX), Italy's licensed tabaccherie list €555. The €90 absolute spread is moderate, and Hoyo's allocation is consistently better than Cohiba's or Trinidad's — making the Epicure Especial one of the easier 'always available, always price-comparable' Cuban SKUs."
  },
  { id: "trinidad-vigia",         slug: "trinidad-vigia",         brand: "Trinidad",          line: "Línea Clásica",  vitola: "Vigia",             shape: "Robusto Extra", ring: 54, lengthMm: 110, boxSize: 12, prestige: "premium", strength: "medium", flavorNotes: ["Floral", "Leather", "Cedar", "Coffee", "Peppery"],
    blurb: "Trinidad's thickest format. The brand's signature floral complexity in a 60-minute, big-ring-gauge presentation.",
    editorial: "The Vigia was added to the Trinidad Línea Clásica in 2014 and immediately became the most-traded Trinidad SKU. At 4.3 inches by a chunky 54 ring (Habanos calls the shape Robusto Extra), it's the brand's shortest and thickest vitola and represents Trinidad's move into the larger ring-gauge formats that increasingly dominate the Cuban premium catalogue. The blend is the same hand-rolled El Laguito production that gives Trinidad its signature complexity — orange-blossom florals, leather, cedar — but the bigger ring gauge concentrates the smoke into a richer, more medium-full register.\n\nThe smoke is dense from the first puff. First third opens with floral notes, a touch of pepper and a faint citrus that few other Cuban brands deliver; the middle settles into leather, cedar and dark earth; the last third delivers a long finish with espresso and a whisper of dried fruit. Smoking time runs 50 to 70 minutes. Trinidad uses box of 12 as the canonical format (not 25 like most Cubans), and the box-of-12 spread across Europe is wide: Noblego runs around €680, Cigarmust CHF 760 (~€800 after FX), and UK boutique retailers post equivalent of €730 to €780. The €100+ absolute spread on a 12-cigar box is genuinely meaningful — comparison-shopping pays off."
  },
  { id: "montecristo-no-5",       slug: "montecristo-no-5",       brand: "Montecristo",       line: "Línea Clásica",  vitola: "No. 5",             shape: "Perla",         ring: 40, lengthMm: 102, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Earthy", "Woody", "Cedar", "Sweet", "Hay"],
    blurb: "The pocket Monte. A 25-minute Perla format that's the most-shipped sub-1-hour Cuban premium in Europe.",
    editorial: "The Montecristo No. 5 is the smallest in the Línea Clásica and the shortest Cuban premium most aficionados keep in their daily rotation. At 4 inches by a 40 ring (Habanos calls the shape Perla), it's designed for the 20-to-30-minute window — a coffee break, a quick after-lunch smoke, the gap before a meeting. Continuous production since 1935 with the same blend, only scaled down: medium-bodied Vuelta Abajo filler under a sturdy Habano wrapper that ages well in a humidor for two to three years.\n\nThe smoke is gentler than the No. 4 because of the smaller ring gauge — less tobacco, less concentrated. First third opens with mild earth and hay; the middle settles into Montecristo's signature woody-cedar core with a touch of sweetness; the last third delivers a smooth, slightly toasty finish that holds for the full 25 minutes without burning hot. Across Europe the No. 5 is one of the most price-stable Cuban SKUs: Noblego runs around €420 per box of 25, Cigarworld €430, LCDH Brussels €435, Cigarmust CHF 475 (~€500 after FX). The €80 absolute spread is meaningful for a high-volume daily smoker — and the No. 5 is the SKU you smoke the most boxes of."
  },
  { id: "cohiba-medio-siglo",     slug: "cohiba-medio-siglo",     brand: "Cohiba",            line: "Línea 1492",     vitola: "Medio Siglo",       shape: "Petit Edmundo", ring: 52, lengthMm: 102, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Sweet", "Coffee", "Cedar", "Hay"],
    blurb: "The youngest Siglo. A 40-minute thick-ring vitola that delivers the Línea 1492 honeyed profile in a Petit Edmundo format.",
    editorial: "The Medio Siglo was added to the Línea 1492 in 2017 to extend the line into the shorter, thicker formats that increasingly dominate the modern Cuban market. At 4 inches by a 52 ring — same dimensions as a Montecristo Petit Edmundo, much thicker than any other Siglo — it's the line's response to demand for a Cohiba-blend cigar in a sub-hour format. The result was an immediate commercial hit and remains one of the most-allocated Cuban SKUs annually.\n\nThe smoke is unmistakably Siglo despite the format. First third opens with butter, honey and a faint pastry note; the middle settles into Cohiba's signature creamy cedar with a touch of espresso; the last third delivers a smooth, slightly sweet finish that holds for the full 35 to 45 minutes. Across Europe a box of 25 sits high in the Cohiba pricing band: Noblego runs roughly €1,720, Cigarmust CHF 1,950 (~€2,050 after FX), Spain's licensed estancos around €1,820. The €330 absolute spread is one of the wider gaps in the Cohiba catalogue — the Medio Siglo is also frequently OOS at one or two of the major retailers at any given time, which makes a watchlist back-in-stock alert genuinely useful here."
  },
  { id: "partagas-serie-e-no-2",  slug: "partagas-serie-e-no-2",  brand: "Partagás",          line: "Serie E",        vitola: "Serie E No. 2",     shape: "Duke",          ring: 54, lengthMm: 140, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Peppery", "Earthy", "Coffee", "Leather", "Woody"],
    blurb: "The thick modern Partagás. Same pepper-and-earth profile as Serie D No. 4 in a longer, broader Duke format that hits harder for longer.",
    editorial: "Launched in 2010 as Habanos's response to demand for thicker ring gauges, the Partagás Serie E No. 2 is a 5.5-inch cigar with a chunky 54 ring (Habanos calls the shape Duke). It uses the same Partagás factory blend as the Serie D — heavy on Vuelta Abajo ligero, darker Habano wrapper, oilier finish — but the longer, thicker format gives the cigar a slower burn and a fuller body. The result is one of the most-recommended modern Partagás vitolas, and aficionados often compare it favourably to the Serie D No. 4 when they want more of the same character in a longer evening format.\n\nThe smoke opens harder than the Serie D. First third is dense black pepper, dark earth and a touch of espresso; the middle blooms into leather, cocoa and aged cedar; the last third delivers a thick, oily finish with cocoa and a whisper of dried fruit. Smoking time runs 75 to 90 minutes. Across Europe a box of 25 sits in the €640 to €780 range: Noblego runs around €680, Cigarworld €695, Cigarmust CHF 750 (~€790 after FX), Italian licensed tabaccherie €700. The €110 absolute spread is one of the wider gaps in the Serie E catalogue, and price-drop alerts here pay off because the Serie E restocks more frequently than the Lusitanias."
  },
  { id: "hoyo-de-monterrey-le-hoyo-de-rio-seco", slug: "hoyo-de-monterrey-le-hoyo-de-rio-seco", brand: "Hoyo de Monterrey", line: "Le Hoyo", vitola: "Le Hoyo de Río Seco", shape: "Geniales", ring: 56, lengthMm: 140, boxSize: 10, prestige: "premium", strength: "medium", flavorNotes: ["Hay", "Sweet", "Cedar", "Creamy", "Nutty"],
    blurb: "The thickest Hoyo. 56-ring Geniales format with the Le Hoyo line's signature gentle blend in a serious-sized smoke.",
    editorial: "Le Hoyo de Río Seco was added to the Le Hoyo line in 2014 to extend Hoyo de Monterrey into the bigger ring gauges. At 5.5 inches by a 56 ring (Habanos calls the shape Geniales), it's the thickest Hoyo currently in production and one of the rare 56-ring cigars in the Habanos catalogue. Despite the bigger format, the blend stays true to the Le Hoyo signature — lighter, sweeter and creamier than the standard Hoyo de Monterrey line, with the brand's distinctive hay and honey opening.\n\nThe smoke is dense but gentle. First third opens with hay, honey and a faint almond note; the middle drifts into Hoyo's creamy cedar core with a touch of toasted bread; the last third delivers a slow, sweet finish that holds for the full 75 to 90 minutes without burning hot. Río Seco ships in box of 10 (not 25 like most Hoyos), and a box sits in the €315 to €380 range across Europe: Noblego runs around €340, Cigarmust CHF 380 (~€400 after FX), Italian licensed tabaccherie €350. The €60 absolute spread is small in absolute terms but meaningful as a percentage on a box this size — comparison-shopping makes the difference between four and five cigars worth of value per box."
  },
  { id: "h-upmann-magnum-50",     slug: "h-upmann-magnum-50",     brand: "H. Upmann",         line: "Magnum Series", vitola: "Magnum 50",         shape: "Robusto Extra", ring: 50, lengthMm: 160, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Hay", "Coffee", "Nutty"],
    blurb: "The bigger Magnum. 50-ring Robusto Extra delivering H. Upmann's gentle cedar-led profile in an 80-minute format.",
    editorial: "The Magnum 50 was added to the H. Upmann Magnum Series in 2008 to complement the existing Magnum 46 with a longer, thicker format. At 6.3 inches by a 50 ring (Habanos calls the shape Robusto Extra), it delivers H. Upmann's signature mild-medium body and creamy, cedar-led profile in a smoke that runs roughly 75 to 90 minutes — comfortably double the Magnum 46. The blend is identical: the same gentler Vuelta Abajo filler that makes H. Upmann the easiest Cuban for transitioning smokers.\n\nThe smoke profile evolves more than the Magnum 46 because of the longer format. First third opens with butter, hay and a touch of toasted almond; the middle drifts into H. Upmann's creamy cedar with a hint of honey; the last third delivers a smooth, slightly nutty finish with a touch of espresso. Smoking time runs 75 to 90 minutes. Across Europe a box of 25 sits in the €500 to €620 range: Germany's Noblego runs around €520, Cigarworld €540, Switzerland's Cigarmust CHF 580 (~€610 after FX), Italian licensed tabaccherie €555. The €110 absolute spread is moderate and the Magnum 50 is one of the more consistently-stocked H. Upmann SKUs, making it a good comparison-shopping target for regular smokers."
  },
  { id: "romeo-y-julieta-churchill", slug: "romeo-y-julieta-churchill", brand: "Romeo y Julieta", line: "Línea Clásica", vitola: "Churchill", shape: "Julieta No. 2", ring: 47, lengthMm: 178, boxSize: 25, prestige: "flagship", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Sweet", "Hay", "Coffee"],
    blurb: "The cigar Winston Churchill made famous. A 7-inch Julieta No. 2 delivering Romeo's creamy floral profile in a 90-minute Churchill format.",
    editorial: "If one Cuban brand owes its identity to a single famous smoker, it's Romeo y Julieta and Winston Churchill. The British prime minister reportedly smoked Romeo cigars daily for decades — typically the Churchill format that Habanos eventually named after him — and the association is what built the brand's global reputation. The Romeo y Julieta Churchill is a 7-inch Julieta No. 2 (a slightly thinner Churchill than the Cohiba Espléndidos at 47 ring instead of 47), continuously produced in the same blend since the 1950s.\n\nThe smoke is the gentlest of the major Cuban Churchills. First third opens with butter, hay and a faint floral note — Romeo's signature opening; the middle drifts into cedar, honey and a touch of toasted bread; the last third delivers a creamy, slightly sweet finish that holds for the full 80 to 100 minutes without burning hot. Across Europe a box of 25 sits in the €495 to €620 range: Noblego runs around €520, Cigarworld €535, Cigarmust CHF 580 (~€610 after FX), LCDH Brussels €545. The €115 absolute spread is one of the wider gaps in the Romeo y Julieta catalogue — and the Churchill is the SKU most often gifted, which means restocks happen in cycles around Father's Day, Christmas and graduation season."
  },
  { id: "cohiba-maduro-5-magicos", slug: "cohiba-maduro-5-magicos", brand: "Cohiba", line: "Maduro 5", vitola: "Magicos", shape: "Robusto Extra", ring: 52, lengthMm: 115, boxSize: 10, prestige: "flagship", strength: "full", flavorNotes: ["Chocolate", "Coffee", "Earthy", "Sweet", "Leather"],
    blurb: "Cohiba's dark wrapper line. Five-year-aged maduro Habano leaf delivering a richer, sweeter Cohiba profile.",
    editorial: "The Cohiba Maduro 5 line was launched in 2007 as the brand's first foray into maduro wrappers — a dark, oily leaf aged for five years before being applied to the cigar (where Cohiba's standard line uses a roughly 18-month-aged wrapper). The Magicos is the most-traded of the three Maduro 5 vitolas — a 4.5-inch Robusto Extra at a 52 ring, sized for an hour-long after-dinner smoke. The blend is the same medio tiempo-enriched filler as the standard Cohiba line, but the long-aged maduro wrapper changes the flavour register dramatically.\n\nThe smoke is darker, sweeter and more chocolate-forward than any other Cohiba. First third opens with dark cocoa, espresso and a touch of dark earth; the middle drifts into leather, dried fruit and a whisper of black pepper; the last third delivers a long, sweet finish that aficionados often compare to dark chocolate paired with vintage port. Smoking time runs 55 to 70 minutes. The Maduro 5 is allocated tightly — Cohiba ships only ~2 boxes a year per LCDH stockist — so European pricing is high and price-volatile: Noblego runs around €820 per box of 10, Cigarmust CHF 920 (~€965 after FX). Price-drop alerts here pay off particularly when a stockist restocks a previously-OOS box."
  },
  { id: "trinidad-coloniales", slug: "trinidad-coloniales", brand: "Trinidad", line: "Línea Clásica", vitola: "Coloniales", shape: "Coronas", ring: 44, lengthMm: 132, boxSize: 12, prestige: "premium", strength: "medium", flavorNotes: ["Floral", "Cedar", "Sweet", "Coffee", "Leather"],
    blurb: "The mid-format Trinidad. A 5-inch Corona with the brand's signature floral complexity in a 60-minute, accessibly-priced format.",
    editorial: "The Coloniales is one of the original five Trinidad vitolas released to the commercial market in 1998, when Habanos S.A. opened up what had previously been a diplomatic-only Cuban brand. At 5.2 inches by a 44 ring (Habanos calls the shape Coronas), it sits between the small Reyes and the thicker Vigia — and it's the vitola most aficionados nominate as Trinidad's best price-to-complexity ratio. The blend is the same El Laguito production that gives every Trinidad its signature character: orange-blossom florals, leather, cedar, a touch of pepper.\n\nThe smoke is balanced and elegant. First third opens with floral notes, a touch of honey and a faint citrus — that signature Trinidad opening few other Cuban brands deliver; the middle settles into cedar, leather and dark earth; the last third delivers a long, slightly sweet finish with espresso and dried fruit. Smoking time runs 50 to 70 minutes. Trinidad uses box of 12 as the canonical format and the Coloniales spread across Europe is meaningful: Noblego runs around €555, Cigarmust CHF 620 (~€650 after FX), UK retailers post equivalent of €590 to €640. The €100 absolute spread on a 12-cigar box translates to almost two cigars worth of value — comparison-shopping is genuinely worth the minute."
  },
  { id: "bolivar-petit-coronas", slug: "bolivar-petit-coronas", brand: "Bolívar", line: "Línea Clásica", vitola: "Petit Coronas", shape: "Mareva", ring: 42, lengthMm: 129, boxSize: 25, prestige: "standard", strength: "full", flavorNotes: ["Peppery", "Earthy", "Coffee", "Leather", "Woody"],
    blurb: "Bolívar's entry vitola. Mareva-format powerhouse — full-bodied Cuban character at the lowest entry price in the catalogue.",
    editorial: "The Bolívar Petit Coronas is one of the strongest Cuban premium cigars at its price point — a 5.1-inch Mareva (same dimensions as a Montecristo No. 4 or Romeo Petit Coronas) but in the Bolívar factory's unapologetically forceful blend. Continuous production since the 1950s, the cigar is the entry-level Bolívar most aficionados recommend to smokers who want to understand the brand's character without committing to a full-format Belicoso or Royal Coronas. The 137mm length and slim 42 ring gauge give the cigar a tight, concentrated smoking experience: less smoke per puff than a robusto but the Bolívar profile in distilled form.\n\nThe smoke opens hard from the first puff. First third delivers black pepper, dark earth and a touch of leather; the middle settles into espresso, dark chocolate and aged cedar; the last third blooms into a thick, oily finish with cocoa and a whisper of dried fruit. Smoking time runs 35 to 45 minutes. Across Europe the Petit Coronas is one of the most price-stable Cuban SKUs because demand is steady but never hot: Noblego runs around €275 per box of 25, Cigarworld €285, Cigarmust CHF 305 (~€320 after FX), Italian licensed tabaccherie €290. The €45 absolute spread is small but on a daily-smoker SKU at this price point, it adds up across the four to five boxes a regular Bolívar smoker works through annually."
  },
  { id: "partagas-serie-d-no-6", slug: "partagas-serie-d-no-6", brand: "Partagás", line: "Serie D", vitola: "Serie D No. 6", shape: "Petit Edmundo", ring: 50, lengthMm: 90, boxSize: 20, prestige: "premium", strength: "full", flavorNotes: ["Peppery", "Earthy", "Coffee", "Woody", "Leather"],
    blurb: "The short Serie D. Petit-Edmundo format with the line's full-bodied pepper-and-earth blend in a 30-minute smoke.",
    editorial: "The Partagás Serie D No. 6 was added to the Serie D line in 2014 to fill the under-45-minute slot in the Partagás catalogue — a 3.5-inch Petit Edmundo with the same chunky 50 ring as the larger Serie D vitolas. The cigar uses the same Partagás factory blend as the famous Serie D No. 4: heavy on Vuelta Abajo ligero, darker Habano wrapper, oily finish. The shorter length means less burn time to evolve, but the 50-ring gauge keeps the smoke dense and concentrated.\n\nThe profile is the Serie D character compressed into a 30-minute window. First third opens fast with black pepper, dark earth and a touch of espresso; the middle settles into leather, cocoa and aged cedar; the last third delivers a quick but rich finish with coffee and a whisper of dried fruit. Across Europe a box of 20 sits in the €315 to €395 range: Noblego runs around €350, Cigarworld €365, Cigarmust CHF 390 (~€410 after FX), Italian licensed tabaccherie €360. The €60 absolute spread is moderate but the No. 6 ships in box of 20 (not 25), so on a per-cigar basis the spread is one of the wider gaps in the Partagás catalogue — particularly meaningful for smokers who buy three or four boxes a year of this SKU as a short-format daily."
  },
  { id: "montecristo-open-junior", slug: "montecristo-open-junior", brand: "Montecristo", line: "Open", vitola: "Open Junior", shape: "Petit Robusto", ring: 38, lengthMm: 110, boxSize: 20, prestige: "standard", strength: "medium", flavorNotes: ["Hay", "Cedar", "Sweet", "Creamy", "Coffee"],
    blurb: "Montecristo's outdoor cigar. Open Junior is the smallest in the Open line — milder, sweeter, designed for golf-course smoking.",
    editorial: "The Línea Open was launched in 2009 as Montecristo's answer to demand for a milder, more accessible Cuban smoke designed for outdoor settings — the line is explicitly marketed toward golfers, hikers, and 'open-air' smokers. The Open Junior is the smallest of the four Open vitolas (Junior, Eagle, Master, Regata) at 4.4 inches by a 38 ring — a slim Petit Robusto designed for a 30-to-40-minute window. The blend uses a lighter Vuelta Abajo filler and a paler, more uniform Habano wrapper than the Línea Clásica, giving the cigar a noticeably milder profile while keeping the Montecristo signature.\n\nThe smoke is the gentlest in the Montecristo catalogue. First third opens with hay, butter and a faint sweetness; the middle settles into a creamy cedar core with a touch of honey; the last third delivers a smooth, slightly sweet finish that holds without ever turning harsh. Across Europe a box of 20 (note: Open Series uses box of 20, not 25) sits in the €270 to €340 range: Noblego runs around €295, Cigarworld €310, Cigarmust CHF 330 (~€345 after FX), Italian licensed tabaccherie €300. The Open Junior is one of the most consistently in-stock Cuban SKUs and price-spread is narrow — making it a reliable comparison-shopping target."
  },
  { id: "montecristo-double-edmundo", slug: "montecristo-double-edmundo", brand: "Montecristo", line: "Línea Edmundo", vitola: "Double Edmundo", shape: "Toro Grande", ring: 50, lengthMm: 155, boxSize: 10, prestige: "premium", strength: "full", flavorNotes: ["Coffee", "Leather", "Chocolate", "Earthy", "Cedar"],
    blurb: "The longer Edmundo. 90-minute Toro Grande format with the line's signature cocoa-and-espresso profile in a fuller, slower-burning smoke.",
    editorial: "The Double Edmundo was added to the Línea Edmundo in 2013 to extend the line into a fuller, longer-smoking format. At 6.1 inches by a 50 ring (Habanos calls the shape Toro Grande), it's roughly an inch longer than the standard Edmundo and the longer format gives the cigar a slower, more complex evolution. The blend is identical to the rest of the Edmundo line — heavier Vuelta Abajo ligero than the Línea Clásica, darker oilier Habano wrapper, fuller body — but the longer burn time means the cigar moves through more flavour phases before finishing.\n\nThe smoke is rich and dense. First third opens with espresso, cocoa and a touch of leather; the middle blooms into dark chocolate, dried fruit and aged cedar; the last third drops into a long, oily finish with leather, coffee and a whisper of pepper. Smoking time runs 80 to 100 minutes. Across Europe a box of 10 sits in the €550 to €690 range: Noblego runs around €595, Cigarworld €610, Cigarmust CHF 660 (~€695 after FX). The Double Edmundo allocates tightly — it's frequently OOS at one or two major retailers — so a watchlist back-in-stock alert is genuinely useful here."
  },
  { id: "cohiba-siglo-iii", slug: "cohiba-siglo-iii", brand: "Cohiba", line: "Línea 1492", vitola: "Siglo III", shape: "Corona Grande", ring: 42, lengthMm: 155, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Sweet", "Hay", "Coffee"],
    blurb: "The slimmest long Siglo. Corona Grande format delivering the Línea 1492 profile in a leisurely 70-minute smoke.",
    editorial: "The Siglo III is the longest of the slim-ring Siglos and the most overlooked vitola in the Línea 1492. At 6.1 inches by a 42 ring (Habanos calls the shape Corona Grande), it sits between the Siglo II (Marevas) and the thicker Siglo IV (Corona Gorda), and aficionados often nominate it as the most elegant in the line — the longer length lets the cigar evolve through more flavour phases without the body ever getting heavy. The blend is the same lighter, silkier Línea 1492 blend that defines the Siglo character.\n\nThe smoke is gentle but complex. First third opens with butter, hay and a faint pastry note; the middle settles into Cohiba's signature creamy cedar-and-honey core; the last third delivers a long, slightly sweet finish with a touch of espresso and dried wood. Smoking time runs 60 to 80 minutes. Across Europe a box of 25 sits in the €830 to €1,050 range: Noblego runs around €875, Cigarmust CHF 980 (~€1,030 after FX), Italian licensed tabaccherie €890. The Siglo III is also one of the more frequently-restocked Cohiba SKUs, which makes price-comparison shopping easier than for the Robustos or Siglo VI."
  },
  { id: "romeo-y-julieta-no-1-tubos", slug: "romeo-y-julieta-no-1-tubos", brand: "Romeo y Julieta", line: "Línea Clásica", vitola: "No. 1 Tubos", shape: "Cervantes", ring: 42, lengthMm: 165, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Floral", "Cedar", "Sweet", "Coffee"],
    blurb: "The classic Romeo Lonsdale in tubed presentation. A 75-minute Cervantes format that built the brand's modern reputation.",
    editorial: "The Romeo y Julieta No. 1 in its iconic aluminum tubo presentation is one of the most-recognised cigars in the Cuban catalogue. At 6.5 inches by a 42 ring (Habanos calls the shape Cervantes, the Cuban term for the Lonsdale format), the No. 1 was the Romeo benchmark for most of the 20th century — produced continuously since 1903, with the aluminum tubo packaging added in the 1960s to extend the cigar's freshness during long European voyages.\n\nThe smoke is the most floral in the Romeo catalogue. First third opens with butter, hay and Romeo's signature orange-blossom floral note; the middle drifts into cedar, honey and a touch of toasted bread; the last third delivers a creamy, slightly sweet finish with espresso and a whisper of dried fruit. Smoking time runs 70 to 85 minutes. Across Europe a box of 25 tubed cigars sits in the €465 to €580 range: Noblego runs around €485, Cigarworld €500, Cigarmust CHF 540 (~€565 after FX), Italian licensed tabaccherie €495. The €100 absolute spread is meaningful and the No. 1 Tubos is the SKU most often gifted at the holiday season — restocks happen in cycles, which makes price-drop alerts genuinely useful here."
  },
  { id: "h-upmann-connoisseur-no-1", slug: "h-upmann-connoisseur-no-1", brand: "H. Upmann", line: "Connoisseur", vitola: "Connoisseur No. 1", shape: "Hermoso No. 4", ring: 48, lengthMm: 127, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Coffee", "Sweet", "Nutty"],
    blurb: "The Connoisseur's H. Upmann. Hermoso No. 4 format launched as an LCDH exclusive — a richer, slightly fuller H. Upmann than the Magnum line.",
    editorial: "The Connoisseur No. 1 was launched in 2010 as a Casa del Habano exclusive — initially distributed only through the worldwide network of authorised LCDH stores — and later promoted to standard production. At 5 inches by a 48 ring (Habanos calls the shape Hermoso No. 4, the same as Cohiba Siglo VI but slightly slimmer), it sits between H. Upmann's Magnum 46 and 50 in body and runs roughly an hour. The blend is slightly fuller than the standard Magnum series — a bit more ligero in the filler, a slightly darker wrapper — which gives the cigar a fuller body while staying within H. Upmann's signature gentle character.\n\nThe smoke is the most complex in the H. Upmann commercial line. First third opens with butter, hay and a faint toasted-almond note; the middle drifts into Hupmann's creamy cedar with a touch of espresso and a hint of dried fruit; the last third delivers a smooth, slightly sweet finish that holds for the full hour without burning hot. Across Europe a box of 25 sits in the €560 to €690 range: Noblego runs around €595, Cigarworld €610, Cigarmust CHF 660 (~€695 after FX), Italian licensed tabaccherie €605. The Connoisseur No. 1 ships less frequently than the Magnum series, which makes a watchlist back-in-stock alert genuinely useful for regular buyers."
  },
  { id: "juan-lopez-seleccion-no-1", slug: "juan-lopez-seleccion-no-1", brand: "Juan López", line: "Selección", vitola: "Selección No. 1", shape: "Corona", ring: 42, lengthMm: 142, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Cedar", "Hay", "Sweet", "Coffee", "Creamy"],
    blurb: "Juan López's flagship Corona. Mid-strength Cuban classic often compared to Hoyo de Monterrey for its balanced, easy-drinking profile.",
    editorial: "Juan López is one of the older Habanos brands still in continuous production — founded in the 1870s and rolled at the Romeo y Julieta factory in Havana. The Selección No. 1 is the brand's flagship Corona at 5.6 inches by 42 ring, and it's the cigar most aficionados name when discussing accessible, mid-priced Cuban premiums. The blend sits between Hoyo de Monterrey and Punch in strength — not as gentle as the Le Hoyo line, not as forceful as Bolívar — and it's renowned for delivering a remarkable amount of complexity at a price that consistently undercuts Cohiba, Montecristo and Partagás.\n\nThe smoke opens with cedar and hay, drifts through a creamy honeyed middle, and finishes on coffee and a touch of toasted bread. Across Europe a box of 25 sits in the €355 to €440 range: Noblego runs around €375, LCDH Brussels €395, Cigarmust CHF 425 (~€445 after FX). One of the best-value comparison-shopping targets in the Cuban catalogue."
  },
  { id: "vegas-robaina-famosos", slug: "vegas-robaina-famosos", brand: "Vegas Robaina", line: "Línea Clásica", vitola: "Famosos", shape: "Hermoso No. 4", ring: 48, lengthMm: 127, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Earthy", "Cedar", "Sweet", "Coffee", "Leather"],
    blurb: "Vegas Robaina's signature. Boutique Cuban from a single Pinar del Río farm with limited annual production.",
    editorial: "Vegas Robaina is the most boutique of the active Habanos brands — launched in 1997 to honour Don Alejandro Robaina, the patriarch of Cuba's most celebrated tobacco-growing family, whose Pinar del Río farm supplies wrapper leaf to several of the top Cuban marcas. Annual production is small and the brand is the only Habanos line named for a tobacco grower rather than a roller or merchant. The Famosos is the most-traded Vegas Robaina vitola — a 5-inch Hermoso No. 4 at 48 ring, built around a slightly fuller blend than the brand's smaller vitolas.\n\nThe smoke is earthier than most Cuban premiums in this price range. First third opens with dark earth, cedar and a faint sweetness; the middle drifts into leather, coffee and a whisper of dried wood; the last third delivers a long, slightly nutty finish. A box of 25 sits in the €565 to €680 range: Noblego runs around €595, Cigarmust CHF 660 (~€695 after FX). One of the more frequently OOS Cuban SKUs — back-in-stock alerts pay off here."
  },
  { id: "quai-d-orsay-no-50", slug: "quai-d-orsay-no-50", brand: "Quai d'Orsay", line: "Línea Clásica", vitola: "No. 50", shape: "Robusto", ring: 50, lengthMm: 124, boxSize: 10, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Floral", "Sweet", "Hay"],
    blurb: "Quai d'Orsay's robusto. Originally a France-only Cuban brand — now the gentlest robusto in the Habanos catalogue.",
    editorial: "Quai d'Orsay was created in 1973 for the French state tobacco monopoly SEITA, named after the quai along the Seine that houses the French Foreign Ministry. For 40 years the brand was distributed only in France; in 2016 Habanos S.A. expanded distribution worldwide and gave the line a complete refresh with three new vitolas. The Quai d'Orsay No. 50 is the most-traded of the modern range — a 4.9-inch Robusto at 50 ring, designed to deliver the brand's signature gentle, creamy profile in the most popular Cuban format.\n\nThe smoke is the mildest Cuban robusto in continuous production. First third opens with butter, hay and a faint floral note; the middle drifts into Quai's signature creamy cedar with a touch of honey; the last third delivers a smooth, slightly sweet finish that holds for the full hour. A box of 10 sits in the €245 to €310 range: Noblego runs around €265, Cigarmust CHF 295 (~€310). Excellent first-Cuban-robusto for milder smokers."
  },
  { id: "ramon-allones-specially-selected", slug: "ramon-allones-specially-selected", brand: "Ramón Allones", line: "Línea Clásica", vitola: "Specially Selected", shape: "Robusto", ring: 50, lengthMm: 124, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Earthy", "Coffee", "Leather", "Sweet", "Cedar"],
    blurb: "Ramón Allones's robusto. Full-bodied Partagás-factory blend that aficionados often nominate as the best-value strong Cuban.",
    editorial: "Ramón Allones is one of the oldest active Habanos brands, founded in Havana in 1837 and credited with inventing the cabinet-style cigar box still used today. Production was moved to the Partagás factory in the 20th century, which is why Ramón Allones shares Partagás's signature dense, earthy, full-bodied profile. The Specially Selected is the brand's flagship robusto — a 4.9-inch 50-ring cigar that's been in continuous production for decades.\n\nThe smoke is dense from the first puff. First third opens with dark earth, espresso and a touch of leather; the middle settles into Ramón's signature dark-cocoa-and-coffee core with a hint of dried fruit; the last third delivers a long, oily finish with leather and a whisper of cedar. Smoking time runs 60 to 75 minutes. A box of 25 sits in the €425 to €520 range: Noblego runs around €445, Cigarworld €455, Cigarmust CHF 495 (~€520). Often nominated as the best-value strong Cuban robusto — comparison-shopping pays off here."
  },
  { id: "saint-luis-rey-regios", slug: "saint-luis-rey-regios", brand: "Saint Luis Rey", line: "Línea Clásica", vitola: "Regios", shape: "Robusto", ring: 50, lengthMm: 124, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Earthy", "Peppery", "Coffee", "Leather", "Cedar"],
    blurb: "Saint Luis Rey's robusto. Full-bodied Romeo factory blend — for decades a UK aficionado's secret, now globally distributed.",
    editorial: "Saint Luis Rey was founded in 1940 by two American expatriates and named after the central character in Thornton Wilder's Pulitzer-winning novel 'The Bridge of San Luis Rey'. The brand is rolled at the Romeo y Julieta factory but uses a fuller, more pepper-forward blend than Romeo's standard line — closer in character to a Partagás than to Romeo. The Regios is the brand's flagship robusto at 4.9 inches by 50 ring, and for most of the 20th century was an under-the-radar favourite of British aficionados.\n\nThe smoke is unmistakably full-bodied. First third opens with black pepper, dark earth and a touch of espresso; the middle settles into leather, coffee and aged cedar; the last third delivers a long, dense finish with cocoa and a whisper of dried fruit. Smoking time runs 60 to 75 minutes. A box of 25 sits in the €435 to €530 range: Noblego runs around €455, UK retailers post equivalent of €495 to €520, Cigarmust CHF 505 (~€530)."
  },
  { id: "el-rey-del-mundo-choix-supreme", slug: "el-rey-del-mundo-choix-supreme", brand: "El Rey del Mundo", line: "Línea Clásica", vitola: "Choix Suprême", shape: "Hermoso No. 4", ring: 48, lengthMm: 127, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Sweet", "Hay", "Coffee"],
    blurb: "El Rey del Mundo's signature. 'King of the World' branding aside, this is a genuinely gentle, creamy Cuban for the slow drinker.",
    editorial: "El Rey del Mundo — 'The King of the World' — was founded in 1882 and ranks among the oldest still-active Habanos brands. The line is gentle and refined, designed for slow-smoking aficionados who prioritise complexity over strength. The Choix Suprême is the brand's most-traded vitola — a 5-inch Hermoso No. 4 at 48 ring, built around a lighter, creamier blend than most contemporaries.\n\nThe smoke is gentle and elegant throughout. First third opens with butter, hay and a faint sweetness; the middle drifts into the brand's signature creamy cedar with a touch of honey; the last third delivers a smooth, slightly toasty finish that holds for the full hour. A box of 25 sits in the €425 to €520 range: Noblego runs around €445, LCDH Brussels €465, Cigarmust CHF 495 (~€520). Less frequently restocked than the major brands, so back-in-stock alerts on this SKU consistently pay off."
  },
  { id: "por-larranaga-petit-coronas", slug: "por-larranaga-petit-coronas", brand: "Por Larrañaga", line: "Línea Clásica", vitola: "Petit Coronas", shape: "Mareva", ring: 42, lengthMm: 129, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Cedar", "Creamy", "Sweet", "Hay", "Nutty"],
    blurb: "Por Larrañaga's daily smoke. One of the oldest Cuban brands still in production — Mareva-format gentle classic since 1834.",
    editorial: "Por Larrañaga is the oldest active Cuban brand, founded by Ignacio Larrañaga in 1834 in Havana. Production is small and the brand maintains a near-cult following among aficionados who value gentler, more delicate Cuban smokes. The Petit Coronas is the brand's most accessible vitola — a 5.1-inch Mareva at 42 ring, in the same dimensions as a Montecristo No. 4 but with a noticeably lighter blend.\n\nThe smoke is one of the most balanced Cuban Marevas. First third opens with cedar, hay and a faint nuttiness; the middle settles into a creamy butter-and-honey core; the last third delivers a smooth, slightly sweet finish that holds for the full 45 minutes. A box of 25 sits in the €275 to €345 range: Noblego runs around €290, Cigarworld €300, Cigarmust CHF 320 (~€335). Steady price-stability and consistent availability — a solid comparison-shopping target for daily-smoker boxes."
  },
  { id: "la-gloria-cubana-medaille-d-or-no-4", slug: "la-gloria-cubana-medaille-d-or-no-4", brand: "La Gloria Cubana", line: "Medaille D'Or", vitola: "Medaille D'Or No. 4", shape: "Petit Cetro", ring: 36, lengthMm: 127, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Sweet", "Floral", "Hay"],
    blurb: "La Gloria Cubana's flagship slim format. Petit Cetro built around a lighter, almost feminine Cuban blend.",
    editorial: "La Gloria Cubana — 'The Glory of Cuba' — was founded in Havana in 1885 and produced continuously through the 20th century. The Medaille D'Or line is named after the gold medals the brand won at European exhibitions in the late 1800s. The No. 4 is the line's most-traded vitola — a slender 5-inch Petit Cetro at 36 ring, designed for aficionados who prefer slim, elegant cigars over the contemporary thick-ring trend.\n\nThe smoke is delicate and floral. First third opens with butter, hay and a faint orange-blossom note; the middle drifts into the brand's signature creamy cedar with a touch of honey; the last third delivers a smooth, slightly sweet finish. Slim ring gauge means a tighter draw and a more concentrated flavour. A box of 25 sits in the €315 to €395 range: Noblego runs around €335, Cigarmust CHF 380 (~€400). Increasingly hard to find in some markets — the slim-ring format has fallen out of fashion."
  },
  { id: "diplomaticos-no-2", slug: "diplomaticos-no-2", brand: "Diplomáticos", line: "Línea Clásica", vitola: "No. 2", shape: "Pirámides", ring: 52, lengthMm: 156, boxSize: 25, prestige: "premium", strength: "full", flavorNotes: ["Coffee", "Leather", "Peppery", "Chocolate", "Earthy"],
    blurb: "Montecristo's lesser-known cousin. Same factory, same Pirámides format as the famous Monte No. 2 — at a meaningfully lower price.",
    editorial: "Diplomáticos was created in 1966 specifically for the French market, using the same Habanos factory and similar blends to Montecristo. The No. 2 is essentially the Montecristo No. 2 with a slightly different blend ratio — same Pirámides format, same 6.1 inches by 52 ring at the foot, but with a touch more ligero in the filler that gives the cigar a fuller body. For decades the brand was the connoisseur's hack: Montecristo character at 15 to 20 percent less than the cost of an actual Monte No. 2.\n\nThe smoke is denser than the Monte No. 2 it shadows. First third opens with espresso, leather and a touch of black pepper; the middle blooms into dark chocolate and dried fruit; the last third delivers a long, oily finish with leather, coffee and aged cedar. A box of 25 sits in the €520 to €635 range: Noblego runs around €545, Cigarmust CHF 605 (~€635). The €100 spread vs. the equivalent Monte No. 2 makes this a connoisseur's value pick."
  },
  { id: "san-cristobal-la-punta", slug: "san-cristobal-la-punta", brand: "San Cristóbal de la Habana", line: "Línea Clásica", vitola: "La Punta", shape: "Campana", ring: 52, lengthMm: 140, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Cedar", "Coffee", "Sweet", "Leather", "Woody"],
    blurb: "Modern Cuban brand launched in 1999. La Punta is a Campana pyramid format with a balanced, accessible flavour profile.",
    editorial: "San Cristóbal de la Habana is one of the youngest active Cuban brands, launched in 1999 to commemorate the founding of Havana. The four core vitolas are named for the historic forts that guarded the colonial city — La Punta, La Fuerza, El Morro, and El Príncipe. La Punta is the most-traded of the four — a 5.5-inch Campana at 52 ring, in the Pirámides family but slightly smaller than the Monte No. 2.\n\nThe smoke is balanced and approachable. First third opens with cedar and a faint sweetness; the middle drifts into coffee, leather and a touch of toasted bread; the last third delivers a smooth, slightly woody finish that holds for the full 60 to 75 minutes. A box of 25 sits in the €495 to €595 range: Noblego runs around €515, Cigarworld €530, Cigarmust CHF 570 (~€600). One of the easier entry points to Cuban pyramids — the format is intimidating but the blend is welcoming."
  },
  { id: "sancho-panza-belicosos", slug: "sancho-panza-belicosos", brand: "Sancho Panza", line: "Línea Clásica", vitola: "Belicosos", shape: "Belicoso", ring: 52, lengthMm: 140, boxSize: 25, prestige: "premium", strength: "medium", flavorNotes: ["Cedar", "Sweet", "Hay", "Creamy", "Coffee"],
    blurb: "Sancho Panza's pyramid. Gentle Cuban pyramid named after Don Quixote's loyal squire — a lighter alternative to the Montecristo No. 2.",
    editorial: "Sancho Panza is one of the older Cuban brands, named after Don Quixote's loyal squire and in continuous production since the 1850s. The brand is rolled at the Romeo y Julieta factory and uses a gentler blend than the more famous Romeo line. The Belicosos is the brand's flagship pyramid — a 5.5-inch Belicoso at 52 ring, in the same format family as the Montecristo No. 2 but with a notably milder profile.\n\nThe smoke is the gentlest of the major Cuban pyramids. First third opens with cedar, hay and a faint sweetness; the middle drifts into a creamy butter-and-honey core; the last third delivers a smooth, slightly toasty finish that holds without ever turning harsh. A box of 25 sits in the €465 to €555 range: Noblego runs around €485, Cigarmust CHF 530 (~€555). Often nominated as a 'gateway pyramid' for smokers who find the Monte No. 2 too forceful — gentler character, similar format, lower price."
  },
  { id: "rafael-gonzalez-petit-coronas", slug: "rafael-gonzalez-petit-coronas", brand: "Rafael González", line: "Línea Clásica", vitola: "Petit Coronas", shape: "Mareva", ring: 42, lengthMm: 129, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Creamy", "Cedar", "Hay", "Sweet", "Floral"],
    blurb: "Rafael González's daily Mareva. One of the prettier Cuban band designs and a gentle, classic Petit Coronas blend.",
    editorial: "Rafael González is one of the older quietly-loved Habanos brands, founded in the late 1800s and named after the Spanish merchant who launched it. The band design — a green and gold ribbon — is among the most photographed in the Cuban catalogue, and the brand has a small but devoted following among aficionados who value gentler smokes. The Petit Coronas is the brand's most-traded vitola — a 5.1-inch Mareva at 42 ring, with a markedly lighter blend than most Cuban Marevas.\n\nThe smoke is gentle and lightly floral. First third opens with butter, hay and a faint orange-blossom note; the middle drifts into the brand's signature creamy cedar with a touch of honey; the last third delivers a smooth, slightly sweet finish. A box of 25 sits in the €255 to €320 range: Noblego runs around €275, Cigarworld €285, Cigarmust CHF 305 (~€320). One of the most accessibly-priced Cuban premiums — a great target for daily smokers building their humidor on a budget."
  },
  { id: "jose-l-piedra-brevas", slug: "jose-l-piedra-brevas", brand: "José L. Piedra", line: "Línea Clásica", vitola: "Brevas", shape: "Brevas", ring: 50, lengthMm: 102, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Earthy", "Woody", "Sweet", "Hay", "Cedar"],
    blurb: "Cuba's short-filler entry brand. Less prestigious than the long-filler Habanos line but genuinely smokable at half the price.",
    editorial: "José L. Piedra is the bargain entry to Cuban cigars — the brand uses short-filler tobacco (chopped leaf rather than the long-leaf 'totalmente a mano, tripa larga' used in premium Habanos), which keeps costs down without giving up Cuban tobacco's signature character. The brand has been the secret of budget-conscious aficionados for decades, particularly the Brevas vitola at 4 inches by 50 ring — a short, thick robusto that delivers a 30-minute smoke at roughly half the price of a long-filler Cuban premium.\n\nThe smoke is honest and direct. First third opens with earthy notes and a touch of wood; the middle settles into a mild cedar-and-hay core; the last third delivers a brief but pleasant finish. Smoking experience is more rustic than a Cohiba or Montecristo — but that's the point. A box of 25 sits in the €115 to €145 range: Noblego runs around €120, Cigarworld €128, Cigarmust CHF 135 (~€140). The most accessible Cuban smoking experience on the market."
  },
  { id: "quintero-brevas", slug: "quintero-brevas", brand: "Quintero", line: "Línea Clásica", vitola: "Brevas", shape: "Brevas", ring: 40, lengthMm: 137, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Cedar", "Hay", "Sweet", "Creamy", "Woody"],
    blurb: "Cuba's gentlest budget brand. Long-filler Cuban at machine-rolled prices — Quintero is short-filler's slightly fancier sibling.",
    editorial: "Quintero was founded in 1924 in Cienfuegos (not Havana — one of the few Habanos brands rolled outside the capital) and has been quietly producing accessible Cuban cigars ever since. The brand sits one notch above José L. Piedra in the budget Cuban hierarchy — Quintero uses long-filler tobacco like the premium brands, but a gentler blend and less aged wrapper that keeps the price well below Cohiba, Montecristo and Partagás territory. The Brevas is the most-traded Quintero vitola — a slim 5.4-inch by 40 ring format designed for a 30-to-45-minute smoke.\n\nThe smoke is gentle and approachable. First third opens with cedar, hay and a faint sweetness; the middle drifts into Quintero's signature creamy, slightly woody core; the last third delivers a smooth, mild finish. A box of 25 sits in the €165 to €215 range: Noblego runs around €175, Cigarworld €185, Cigarmust CHF 195 (~€205). Among the most consistently in-stock Cuban SKUs — supply outstrips demand."
  },
  { id: "fonseca-cosacos", slug: "fonseca-cosacos", brand: "Fonseca", line: "Línea Clásica", vitola: "Cosacos", shape: "Eminentes", ring: 42, lengthMm: 135, boxSize: 25, prestige: "standard", strength: "medium", flavorNotes: ["Cedar", "Sweet", "Hay", "Creamy", "Coffee"],
    blurb: "Fonseca's signature vitola. Wrapped in distinctive tissue paper — a quirky packaging tradition unique to the brand.",
    editorial: "Fonseca is the brand with the most distinctive packaging in the Habanos catalogue: every cigar is individually wrapped in white tissue paper before being placed in the box, a tradition that dates to the brand's founding in 1907 and is preserved as a deliberate identity marker. The Cosacos is the brand's most-traded vitola — a 5.3-inch Eminentes at 42 ring, in a slim format similar to a slightly longer Mareva.\n\nThe smoke is balanced and accessible. First third opens with cedar, hay and a faint sweetness; the middle drifts into a creamy honeyed core with a touch of coffee; the last third delivers a smooth, slightly toasty finish. Smoking time runs 45 to 60 minutes. A box of 25 sits in the €245 to €315 range: Noblego runs around €265, Cigarworld €275, Cigarmust CHF 295 (~€310). The tissue-wrapped packaging makes Fonseca a popular gift cigar — the unwrapping ritual is part of the experience."
  },
];

export const SKU_BY_ID: Record<string, Sku> = Object.fromEntries(
  SKUS.map((s) => [s.id, s]),
);
export const SKU_BY_SLUG: Record<string, Sku> = Object.fromEntries(
  SKUS.map((s) => [s.slug, s]),
);

// ============================================================================
// KNOWN BRANDS — every premium cigar brand we recognise, including ones we
// don't yet track. Powers the search empty-state: when a user types
// 'Juan Lopez' (a real Cuban brand) we want to acknowledge the brand exists
// and explain why no results show up, instead of just saying 'no matches'.
//
// `tracked` is true when at least one SKU in the SKUS array uses this brand;
// derived at build time below to keep the two sources of truth in sync.
// ============================================================================
export type BrandOrigin = "cuba" | "dominican" | "nicaragua" | "honduras" | "spain" | "other";

export interface KnownBrand {
  name: string;            // canonical display name ("Juan Lopez")
  origin: BrandOrigin;     // which country the brand is rolled in
  aliases: string[];       // alternate spellings + search terms ("juan lópez", "jl")
  shortNote?: string;      // one-liner for the empty-state message
}

export const KNOWN_BRANDS: KnownBrand[] = [
  // ─── Cuban (Habanos S.A.) — the full official roster ──────────────────────
  { name: "Cohiba",                origin: "cuba", aliases: ["cohiba"] },
  { name: "Montecristo",           origin: "cuba", aliases: ["montecristo", "monte"] },
  { name: "Romeo y Julieta",       origin: "cuba", aliases: ["romeo y julieta", "romeo", "ryj"] },
  { name: "Partagás",              origin: "cuba", aliases: ["partagas", "partagás"] },
  { name: "Hoyo de Monterrey",     origin: "cuba", aliases: ["hoyo de monterrey", "hoyo"] },
  { name: "H. Upmann",             origin: "cuba", aliases: ["h. upmann", "h upmann", "upmann"] },
  { name: "Trinidad",              origin: "cuba", aliases: ["trinidad"] },
  { name: "Bolívar",               origin: "cuba", aliases: ["bolivar", "bolívar"] },
  { name: "Cuaba",                 origin: "cuba", aliases: ["cuaba"] },
  { name: "Diplomáticos",          origin: "cuba", aliases: ["diplomaticos", "diplomáticos"] },
  { name: "El Rey del Mundo",      origin: "cuba", aliases: ["el rey del mundo", "rey del mundo"] },
  { name: "Fonseca",               origin: "cuba", aliases: ["fonseca"] },
  { name: "Guantanamera",          origin: "cuba", aliases: ["guantanamera"] },
  { name: "José L. Piedra",        origin: "cuba", aliases: ["jose l. piedra", "jose l piedra", "jlp", "piedra"] },
  { name: "Juan López",            origin: "cuba", aliases: ["juan lopez", "juan lópez", "juan l"],
    shortNote: "Mid-strength Cuban classic, often compared to Hoyo de Monterrey." },
  { name: "La Flor de Cano",       origin: "cuba", aliases: ["la flor de cano", "flor de cano"] },
  { name: "La Gloria Cubana",      origin: "cuba", aliases: ["la gloria cubana", "gloria cubana"] },
  { name: "Por Larrañaga",         origin: "cuba", aliases: ["por larranaga", "por larrañaga", "larranaga"] },
  { name: "Punch",                 origin: "cuba", aliases: ["punch"] },
  { name: "Quai d'Orsay",          origin: "cuba", aliases: ["quai d'orsay", "quai dorsay", "quai d orsay", "quai"] },
  { name: "Quintero",              origin: "cuba", aliases: ["quintero"] },
  { name: "Rafael González",       origin: "cuba", aliases: ["rafael gonzalez", "rafael gonzález"] },
  { name: "Ramón Allones",         origin: "cuba", aliases: ["ramon allones", "ramón allones"] },
  { name: "Saint Luis Rey",        origin: "cuba", aliases: ["saint luis rey", "san luis rey"] },
  { name: "San Cristóbal de la Habana", origin: "cuba", aliases: ["san cristobal", "san cristóbal", "san cristobal de la habana"] },
  { name: "Sancho Panza",          origin: "cuba", aliases: ["sancho panza"] },
  { name: "Vegas Robaina",         origin: "cuba", aliases: ["vegas robaina", "robaina"],
    shortNote: "Boutique Cuban from a single Pinar del Río farm — small annual production." },
  { name: "Vegueros",              origin: "cuba", aliases: ["vegueros"] },

  // ─── Dominican premium — the most-asked-for non-Cuban brands ──────────────
  { name: "Davidoff",              origin: "dominican", aliases: ["davidoff"],
    shortNote: "Dominican-rolled premium since 1991 — Davidoff left Cuba over quality disputes." },
  { name: "Arturo Fuente",         origin: "dominican", aliases: ["arturo fuente", "fuente", "opus x", "opusx"] },
  { name: "Ashton",                origin: "dominican", aliases: ["ashton"] },
  { name: "AVO",                   origin: "dominican", aliases: ["avo"] },
  { name: "Cohiba (Dominican)",    origin: "dominican", aliases: ["cohiba dominican", "cohiba red dot", "general cigar"],
    shortNote: "Separate brand from Cuban Cohiba — owned by General Cigar (USA). The two are unrelated." },
  { name: "E.P. Carrillo",         origin: "dominican", aliases: ["e.p. carrillo", "ep carrillo", "carrillo"] },
  { name: "La Aurora",             origin: "dominican", aliases: ["la aurora", "aurora"] },
  { name: "Macanudo",              origin: "dominican", aliases: ["macanudo"] },
  { name: "Romeo y Julieta (DR)",  origin: "dominican", aliases: ["romeo y julieta dominican", "ryj dominican"] },

  // ─── Nicaraguan premium ──────────────────────────────────────────────────
  { name: "Padrón",                origin: "nicaragua", aliases: ["padron", "padrón"],
    shortNote: "Nicaraguan family-owned, one of the highest-rated non-Cuban brands worldwide." },
  { name: "Oliva",                 origin: "nicaragua", aliases: ["oliva"] },
  { name: "Aganorsa Leaf",         origin: "nicaragua", aliases: ["aganorsa", "aganorsa leaf", "casa fernandez"] },
  { name: "My Father",             origin: "nicaragua", aliases: ["my father", "myfather", "le bijou", "flor de las antillas"] },
  { name: "Drew Estate",           origin: "nicaragua", aliases: ["drew estate", "drew", "liga privada", "undercrown"] },
  { name: "Tatuaje",               origin: "nicaragua", aliases: ["tatuaje"] },
  { name: "Joya de Nicaragua",     origin: "nicaragua", aliases: ["joya de nicaragua", "joya"] },
  { name: "Plasencia",             origin: "nicaragua", aliases: ["plasencia"] },
  { name: "Crowned Heads",         origin: "nicaragua", aliases: ["crowned heads"] },
  { name: "Rocky Patel",           origin: "nicaragua", aliases: ["rocky patel", "rocky"] },

  // ─── Honduran premium ────────────────────────────────────────────────────
  { name: "Camacho",               origin: "honduras", aliases: ["camacho"] },
  { name: "Punch (Honduran)",      origin: "honduras", aliases: ["punch honduran", "punch hf"] },
  { name: "Flor de Copán",         origin: "honduras", aliases: ["flor de copan", "flor de copán"] },
  { name: "Alec Bradley",          origin: "honduras", aliases: ["alec bradley"] },

  // ─── Other / Multi-origin ────────────────────────────────────────────────
  { name: "Villiger",              origin: "spain", aliases: ["villiger"] },
];

// Build a lookup index at module load — flatten every (alias, brand) pair
// into a Map for O(1) prefix matching from search input.
const BRAND_ALIAS_INDEX: Array<{ alias: string; brand: KnownBrand }> = [];
for (const b of KNOWN_BRANDS) {
  for (const alias of b.aliases) BRAND_ALIAS_INDEX.push({ alias: alias.toLowerCase(), brand: b });
  BRAND_ALIAS_INDEX.push({ alias: b.name.toLowerCase(), brand: b });
}

/**
 * Match a free-text query against the known-brands catalog. Returns the brand
 * if the query is a recognisable brand name (full or partial), null otherwise.
 *
 * Used by the search bar's empty state to distinguish "user typed a real
 * brand we don't yet track" from "user typed something random".
 */
export function matchKnownBrand(query: string): KnownBrand | null {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;

  // First pass — exact alias match.
  for (const { alias, brand } of BRAND_ALIAS_INDEX) {
    if (alias === q) return brand;
  }
  // Second pass — query contains an alias OR alias contains the query
  // (so "juan" matches "juan lopez", "padron robusto" matches "padron").
  for (const { alias, brand } of BRAND_ALIAS_INDEX) {
    if (alias.length >= 3 && (q.includes(alias) || alias.startsWith(q))) return brand;
  }
  return null;
}

/** Set of brand names we currently track (have at least one SKU for). */
export const TRACKED_BRAND_NAMES: Set<string> = new Set(SKUS.map((s) => s.brand));

// ============================================================================
// PERSONALIZATION — score an SKU against a member's taste profile
// ============================================================================
// Used by the Lounge Finder "Picked for your taste" section. Reads the
// profile.favorite_brands / .flavor_notes / .strength_preference fields and
// produces a numeric score; higher means a better taste match.
//
// Scoring weights (tuned for our 15-note vocabulary + 4-tier strength):
//   +3.0  favourite-brand hit
//   +1.0  per overlapping flavour note (cap +5.0 — five matches is plenty)
//   +2.0  exact strength match
//   +1.0  adjacent strength (one tier off)
//   +0.6  has at least one in-stock retailer (don't recommend dead SKUs)
//   -0.4  per-cigar price above EU median (gentle nudge toward affordability)
//
// Tiebreakers handled in selectRecommendedSkus() below.
// ============================================================================
export type StrengthLevel = "mild" | "medium" | "full" | "extra_full";

export interface TasteProfile {
  favorite_brands: string[] | null;
  flavor_notes:    string[] | null;
  strength_preference: StrengthLevel | null;
}

const STRENGTH_ORDER: StrengthLevel[] = ["mild", "medium", "full", "extra_full"];
function strengthDistance(a: StrengthLevel, b: StrengthLevel): number {
  return Math.abs(STRENGTH_ORDER.indexOf(a) - STRENGTH_ORDER.indexOf(b));
}

/** Compute a deterministic match score between an SKU and a member's profile. */
export function scoreSkuForProfile(
  sku: Sku,
  profile: TasteProfile,
  context: { hasInStockSnapshot: boolean; perCigarEur: number | null; medianPerCigarEur: number } = {
    hasInStockSnapshot: true, perCigarEur: null, medianPerCigarEur: 50,
  },
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Brand match (+3) — strongest single signal of taste alignment.
  const favBrands = profile.favorite_brands || [];
  if (favBrands.length > 0 && favBrands.includes(sku.brand)) {
    score += 3;
    reasons.push(sku.brand);
  }

  // Flavor-note overlap — each match is +1 up to +5.
  const wantNotes = profile.flavor_notes || [];
  if (wantNotes.length > 0) {
    const overlap = sku.flavorNotes.filter((n) => wantNotes.includes(n));
    const bonus = Math.min(5, overlap.length);
    score += bonus;
    if (overlap.length > 0) reasons.push(...overlap.slice(0, 3));  // surface up to 3 matched notes
  }

  // Strength alignment.
  if (profile.strength_preference) {
    const d = strengthDistance(sku.strength, profile.strength_preference);
    if (d === 0) { score += 2; reasons.push(strengthLabel(sku.strength)); }
    else if (d === 1) { score += 1; }
  }

  // In-stock bias — don't recommend a SKU that's OOS everywhere.
  if (context.hasInStockSnapshot) score += 0.6;

  // Gentle affordability nudge — penalise SKUs more expensive per cigar than median.
  if (context.perCigarEur != null) {
    const delta = context.perCigarEur - context.medianPerCigarEur;
    if (delta > 0) score -= Math.min(0.4, delta / 100);
  }

  return { score, reasons };
}

function strengthLabel(s: StrengthLevel): string {
  return ({ mild: "Mild", medium: "Medium", full: "Full", extra_full: "Extra full" } as const)[s];
}

/**
 * Select the top N SKUs for a member, with light diversification so the
 * recommendations don't all come from one brand. Returns SKUs sorted by
 * score (desc) with their match reasons surfaced for the UI.
 */
export interface SkuRecommendation {
  sku: Sku;
  score: number;
  reasons: string[];
}

export function selectRecommendedSkus(
  profile: TasteProfile,
  context: {
    skuInStock?: Record<string, boolean>;
    perCigarEurBySku?: Record<string, number>;
  } = {},
  limit = 3,
): SkuRecommendation[] {
  // Compute median per-cigar price for the affordability penalty.
  const prices = Object.values(context.perCigarEurBySku || {}).filter((p) => Number.isFinite(p));
  prices.sort((a, b) => a - b);
  const medianPerCigarEur = prices.length ? prices[Math.floor(prices.length / 2)] : 50;

  // Score every SKU.
  const scored: SkuRecommendation[] = SKUS.map((sku) => {
    const { score, reasons } = scoreSkuForProfile(sku, profile, {
      hasInStockSnapshot: context.skuInStock?.[sku.id] ?? true,
      perCigarEur:        context.perCigarEurBySku?.[sku.id] ?? null,
      medianPerCigarEur,
    });
    return { sku, score, reasons };
  }).sort((a, b) => b.score - a.score);

  // Diversify: avoid returning more than 2 SKUs from the same brand in the
  // final list. We walk the sorted array and skip the third+ from any brand.
  const picked: SkuRecommendation[] = [];
  const brandCount: Record<string, number> = {};
  for (const rec of scored) {
    if (picked.length >= limit) break;
    const c = brandCount[rec.sku.brand] || 0;
    if (c >= 2) continue;
    picked.push(rec);
    brandCount[rec.sku.brand] = c + 1;
  }
  return picked;
}

/**
 * Editor's Picks — a stable, hand-curated 3-card row shown when the member
 * hasn't filled out taste preferences yet. Mix of accessible price points
 * + iconic vitolas + one premium aspiration item.
 */
export const EDITORS_PICK_SKU_IDS: string[] = [
  "montecristo-no-4",          // accessible entry — €358 box, the most-sold Cuban ever
  "partagas-serie-d-no-4",     // mid-range value — best-value Cuban robusto
  "cohiba-behike-52",          // aspirational premium — the SKU everyone wants
];

/** True when a profile has enough data to compute a meaningful recommendation. */
export function profileHasTasteData(p: Partial<TasteProfile>): boolean {
  return (
    (Array.isArray(p.favorite_brands) && p.favorite_brands.length > 0) ||
    (Array.isArray(p.flavor_notes) && p.flavor_notes.length > 0) ||
    !!p.strength_preference
  );
}

// ============================================================================
// PRICE SNAPSHOTS — verified May 2026 prices from public retailer pages
// ============================================================================
// Notes:
//   • Every snapshot carries its sourceUrl. The Finder displays these in tooltips.
//   • All prices are for the canonical box size in sku.boxSize unless noted.
//   • Out-of-stock and login-walled retailers still appear in the catalogue but
//     are filtered from the "Best Price" computation.
// ============================================================================
export const PRICE_SNAPSHOTS: PriceSnapshot[] = [
  // ─── Cohiba Robustos (box 25) ─────────────────────────────────────────────
  { skuId: "cohiba-robustos",        retailerId: "de-noblego",        price: 1930.30, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-robustos/" },
  { skuId: "cohiba-robustos",        retailerId: "ch-cigarmust",      price: 2040.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba/217-140-cohiba-robustos-7612907060907.html" },
  { skuId: "cohiba-robustos",        retailerId: "ch-siglomundo",     price: 2040.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://it.siglomundo.ch/products/cohiba-robustos" },
  { skuId: "cohiba-robustos",        retailerId: "se-cigarrspecialisten", price: 16250, currency: "SEK", inStock: false, scrapedAt: "2026-05-12", sourceUrl: "https://cigarrspecialisten.se/cigarrer/kuba/cohiba/cohiba-robustos/" },
  { skuId: "cohiba-robustos",        retailerId: "se-cigarrummet",    price: 19200, currency: "SEK", inStock: true, scrapedAt: "2026-05-12", sourceUrl: "https://www.cigarrummet.com/produkt/cohiba-robustos/" },
  { skuId: "cohiba-robustos",        retailerId: "es-cigarsmokerclub", price: 2012.50, currency: "EUR", inStock: true,  scrapedAt: "2026-05-12", sourceUrl: "https://cigarsmokerclub.com/en/product/cohiba-robustos/" },

  // ─── Cohiba Behike 52 (box 10) ────────────────────────────────────────────
  { skuId: "cohiba-behike-52",       retailerId: "se-cigarrspecialisten", price: 20250, currency: "SEK", inStock: false, scrapedAt: "2026-05-12", sourceUrl: "https://cigarrspecialisten.se/cigarrer/kuba/cohiba/" },
  { skuId: "cohiba-behike-52",       retailerId: "se-cigarrhyllan",   price: 17354, currency: "SEK", inStock: true,  scrapedAt: "2026-05-12", sourceUrl: "https://cigarrhyllan.se/cigarrer/kuba/cohiba/" },
  { skuId: "cohiba-behike-52",       retailerId: "ch-cigarmust",      price: 2860.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba" },

  // ─── Cohiba Siglo IV (box 25) ─────────────────────────────────────────────
  { skuId: "cohiba-siglo-iv",        retailerId: "ch-cigarmust",      price: 1450.00, currency: "CHF", originalPrice: 1610.00, inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba" },
  { skuId: "cohiba-siglo-iv",        retailerId: "de-noblego",        price: 1350.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-siglo-iv/" },

  // ─── Cohiba Espléndidos (box 25) ──────────────────────────────────────────
  { skuId: "cohiba-esplendidos",     retailerId: "ch-cigarmust",      price: 3300.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba" },
  { skuId: "cohiba-esplendidos",     retailerId: "uk-jjfox",          price: 2950.00, currency: "GBP", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.jjfox.co.uk/cigars/country/cuban-cigars.html" },

  // ─── Montecristo No. 4 (box 25) ───────────────────────────────────────────
  { skuId: "montecristo-no-4",       retailerId: "de-noblego",        price: 358.90, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/montecristo-no-4/" },
  { skuId: "montecristo-no-4",       retailerId: "ch-cigarmust",      price: 420.00, currency: "CHF", originalPrice: 467.00, inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo/341-70-montecristo-no4-7612907062178.html" },
  { skuId: "montecristo-no-4",       retailerId: "it-sigarietabacchi", price: 365.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/sigari-cubani/" },
  { skuId: "montecristo-no-4",       retailerId: "be-lcdh-antwerp",   price: 372.50, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.lcdhantwerp.com/shop/cuban-cigars/cohiba/" },
  { skuId: "montecristo-no-4",       retailerId: "ie-jamesfox",       price: 380.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://jamesfox.ie/en-us/collections/cuban-cigars-selection" },
  { skuId: "montecristo-no-4",       retailerId: "nl-hajenius",       price: 395.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.hajenius.com/en/" },

  // ─── Montecristo No. 2 (box 25) ───────────────────────────────────────────
  { skuId: "montecristo-no-2",       retailerId: "de-noblego",        price: 645.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/" },
  { skuId: "montecristo-no-2",       retailerId: "ch-cigarmust",      price: 720.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo" },
  { skuId: "montecristo-no-2",       retailerId: "uk-cgars",          price: 580.00, currency: "GBP", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.turmeaus.co.uk/cigars-cuban-cigars-c-325_52.html" },

  // ─── Montecristo Petit Edmundo (box 25) ───────────────────────────────────
  { skuId: "montecristo-petit-edmundo", retailerId: "de-noblego",     price: 506.83, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/" },
  { skuId: "montecristo-petit-edmundo", retailerId: "ch-cigarmust",   price: 630.00, currency: "CHF", originalPrice: 700.00, inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo" },

  // ─── Partagás Serie D No. 4 (box 25) ──────────────────────────────────────
  { skuId: "partagas-serie-d-no-4",  retailerId: "de-noblego",        price: 523.80, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/partagas-serie-d-no-4/" },
  { skuId: "partagas-serie-d-no-4",  retailerId: "ch-cigarmust",      price: 652.50, currency: "CHF", originalPrice: 725.00, inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/partagas/367-85-partagas-serie-d-no4-7612907062994.html" },
  { skuId: "partagas-serie-d-no-4",  retailerId: "it-sigarietabacchi", price: 545.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/prodotto/partagas-serie-d-no-4/" },
  { skuId: "partagas-serie-d-no-4",  retailerId: "ie-jamesfox",       price: 555.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://jamesfox.ie/en-us/collections/cuban-cigars-selection" },

  // ─── Romeo y Julieta Petit Coronas (box 25) ───────────────────────────────
  { skuId: "romeo-y-julieta-petit-coronas", retailerId: "de-noblego", price: 237.65, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/" },
  { skuId: "romeo-y-julieta-petit-coronas", retailerId: "uk-havanahouse", price: 215.00, currency: "GBP", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.havanahouse.co.uk/product-category/cigars/cuban/" },
  { skuId: "romeo-y-julieta-petit-coronas", retailerId: "ch-cigarmust", price: 285.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/" },
  { skuId: "romeo-y-julieta-petit-coronas", retailerId: "be-lcdh-brussels", price: 245.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels/collections/lcdh" },

  // ─── Hoyo de Monterrey Epicure No. 2 (box 25) ─────────────────────────────
  { skuId: "hoyo-de-monterrey-epicure-no-2", retailerId: "de-noblego", price: 499.55, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/hoyo-de-monterrey-epicure-no-2/" },
  { skuId: "hoyo-de-monterrey-epicure-no-2", retailerId: "ch-cigarmust", price: 590.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/" },
  { skuId: "hoyo-de-monterrey-epicure-no-2", retailerId: "uk-cgars",   price: 445.00, currency: "GBP", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.turmeaus.co.uk/" },
  { skuId: "hoyo-de-monterrey-epicure-no-2", retailerId: "nl-hajenius", price: 525.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.hajenius.com/en/" },

  // ─── Trinidad Reyes (box 12) ──────────────────────────────────────────────
  { skuId: "trinidad-reyes",         retailerId: "de-noblego",        price: 791.52, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/trinidad-reyes/" },
  { skuId: "trinidad-reyes",         retailerId: "ch-cigarmust",      price: 412.80, currency: "CHF", originalPrice: 458.00, inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/" },
  { skuId: "trinidad-reyes",         retailerId: "ch-egmcigars",      price: 825.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://egmcigars.com/products/trinidad-reyes" },

  // ─── Bolívar Belicosos Finos (box 25) ─────────────────────────────────────
  { skuId: "bolivar-belicosos-finos", retailerId: "de-noblego",       price: 612.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/" },
  { skuId: "bolivar-belicosos-finos", retailerId: "ch-cigarmust",     price: 745.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/" },
  { skuId: "bolivar-belicosos-finos", retailerId: "uk-sautter",       price: 575.00, currency: "GBP", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.sauttercigars.com/" },
  { skuId: "bolivar-belicosos-finos", retailerId: "gr-cigarsmoke",    price: 595.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarsmoke.gr/en/" },

  // ─── Cohiba Siglo VI (box 25) — added Phase A batch 1 ─────────────────────
  { skuId: "cohiba-siglo-vi",        retailerId: "de-noblego",        price: 1850.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-siglo-vi/" },
  { skuId: "cohiba-siglo-vi",        retailerId: "ch-cigarmust",      price: 2100.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba" },
  { skuId: "cohiba-siglo-vi",        retailerId: "se-cigarrummet",    price: 19500.00, currency: "SEK", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarrummet.se/" },

  // ─── Montecristo Edmundo (box 25) ─────────────────────────────────────────
  { skuId: "montecristo-edmundo",    retailerId: "de-noblego",        price: 670.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/montecristo-edmundo/" },
  { skuId: "montecristo-edmundo",    retailerId: "de-cigarworld",     price: 690.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "montecristo-edmundo",    retailerId: "ch-cigarmust",      price: 715.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo" },

  // ─── Romeo y Julieta Wide Churchills (box 25) ─────────────────────────────
  { skuId: "romeo-y-julieta-wide-churchills", retailerId: "de-noblego",        price: 625.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/" },
  { skuId: "romeo-y-julieta-wide-churchills", retailerId: "be-lcdh-brussels", price: 640.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },
  { skuId: "romeo-y-julieta-wide-churchills", retailerId: "ch-cigarmust",      price: 690.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/romeo-y-julieta" },

  // ─── Partagás Lusitanias (box 25) ─────────────────────────────────────────
  { skuId: "partagas-lusitanias",    retailerId: "de-noblego",        price: 765.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/partagas-lusitanias/" },
  { skuId: "partagas-lusitanias",    retailerId: "de-cigarworld",     price: 780.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "partagas-lusitanias",    retailerId: "ch-cigarmust",      price: 815.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/partagas/364-77-partagas-lusitanias-7612907062796.html" },
  { skuId: "partagas-lusitanias",    retailerId: "it-sigarietabacchi", price: 795.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── H. Upmann Magnum 46 (box 25) ─────────────────────────────────────────
  { skuId: "h-upmann-magnum-46",     retailerId: "de-noblego",        price: 435.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/h-upmann-magnum-46/" },
  { skuId: "h-upmann-magnum-46",     retailerId: "de-cigarworld",     price: 450.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "h-upmann-magnum-46",     retailerId: "ch-cigarmust",      price: 495.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/hupmann" },
  { skuId: "h-upmann-magnum-46",     retailerId: "it-sigarietabacchi", price: 465.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },
  // ─── Cohiba Siglo II (box 25) — Phase A batch 2 ────────────────────────────
  { skuId: "cohiba-siglo-ii",        retailerId: "de-noblego",        price: 650.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-siglo-ii/" },
  { skuId: "cohiba-siglo-ii",        retailerId: "be-lcdh-brussels",  price: 670.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },
  { skuId: "cohiba-siglo-ii",        retailerId: "ch-cigarmust",      price: 750.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba" },

  // ─── Romeo y Julieta Short Churchills (box 25) ────────────────────────────
  { skuId: "romeo-y-julieta-short-churchills", retailerId: "de-noblego",        price: 625.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/romeo-y-julieta-short-churchills/" },
  { skuId: "romeo-y-julieta-short-churchills", retailerId: "be-lcdh-brussels",  price: 640.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },
  { skuId: "romeo-y-julieta-short-churchills", retailerId: "ch-cigarmust",      price: 690.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/romeo-y-julieta" },
  { skuId: "romeo-y-julieta-short-churchills", retailerId: "de-cigarworld",     price: 650.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },

  // ─── Bolívar Royal Coronas (box 25) ───────────────────────────────────────
  { skuId: "bolivar-royal-coronas",  retailerId: "de-noblego",        price: 440.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/bolivar-royal-coronas/" },
  { skuId: "bolivar-royal-coronas",  retailerId: "de-cigarworld",     price: 455.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "bolivar-royal-coronas",  retailerId: "ch-cigarmust",      price: 495.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/bolivar" },

  // ─── Hoyo de Monterrey Epicure Especial (box 25) ──────────────────────────
  { skuId: "hoyo-de-monterrey-epicure-especial", retailerId: "de-noblego",        price: 545.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/hoyo-de-monterrey-epicure-especial/" },
  { skuId: "hoyo-de-monterrey-epicure-especial", retailerId: "it-sigarietabacchi", price: 555.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },
  { skuId: "hoyo-de-monterrey-epicure-especial", retailerId: "ch-cigarmust",      price: 605.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/hoyo-de-monterrey/271-1639-hoyo-de-monterrey-epicure-especial-7612907061515.html" },

  // ─── Trinidad Vigia (box 12) ──────────────────────────────────────────────
  { skuId: "trinidad-vigia",         retailerId: "de-noblego",        price: 680.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/trinidad-vigia/" },
  { skuId: "trinidad-vigia",         retailerId: "ch-cigarmust",      price: 760.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/trinidad" },
  { skuId: "trinidad-vigia",         retailerId: "be-lcdh-brussels",  price: 695.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },

  // ─── Montecristo No. 5 (box 25) — Phase A batch 3 ─────────────────────────
  { skuId: "montecristo-no-5",       retailerId: "de-noblego",        price: 420.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/montecristo-no-5/" },
  { skuId: "montecristo-no-5",       retailerId: "de-cigarworld",     price: 430.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "montecristo-no-5",       retailerId: "be-lcdh-brussels",  price: 435.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },
  { skuId: "montecristo-no-5",       retailerId: "ch-cigarmust",      price: 475.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo/342-1617-montecristo-no5-7612907062246.html" },

  // ─── Cohiba Medio Siglo (box 25) ──────────────────────────────────────────
  { skuId: "cohiba-medio-siglo",     retailerId: "de-noblego",        price: 1720.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-medio-siglo/" },
  { skuId: "cohiba-medio-siglo",     retailerId: "ch-cigarmust",      price: 1950.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba/1486-492-cohiba-medio-siglo-7612907060686.html" },
  { skuId: "cohiba-medio-siglo",     retailerId: "es-cigarsmokerclub", price: 1820.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarsmokerclub.es/" },

  // ─── Partagás Serie E No. 2 (box 25) ──────────────────────────────────────
  { skuId: "partagas-serie-e-no-2",  retailerId: "de-noblego",        price: 680.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/partagas-serie-e-no-2/" },
  { skuId: "partagas-serie-e-no-2",  retailerId: "de-cigarworld",     price: 695.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "partagas-serie-e-no-2",  retailerId: "ch-cigarmust",      price: 750.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/partagas/2544-1735-partagas-serie-e-no2-gran-reserva.html" },
  { skuId: "partagas-serie-e-no-2",  retailerId: "it-sigarietabacchi", price: 700.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── Hoyo de Monterrey Le Hoyo de Río Seco (box 10) ───────────────────────
  { skuId: "hoyo-de-monterrey-le-hoyo-de-rio-seco", retailerId: "de-noblego",        price: 340.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/hoyo-de-monterrey-le-hoyo-de-rio-seco/" },
  { skuId: "hoyo-de-monterrey-le-hoyo-de-rio-seco", retailerId: "it-sigarietabacchi", price: 350.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },
  { skuId: "hoyo-de-monterrey-le-hoyo-de-rio-seco", retailerId: "ch-cigarmust",      price: 380.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/hoyo-de-monterrey/1685-768-hoyo-de-monterrey-le-hoyo-de-rio-seco-7612907068279.html" },

  // ─── H. Upmann Magnum 50 (box 25) ─────────────────────────────────────────
  { skuId: "h-upmann-magnum-50",     retailerId: "de-noblego",        price: 520.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/h-upmann-magnum-50/" },
  { skuId: "h-upmann-magnum-50",     retailerId: "de-cigarworld",     price: 540.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "h-upmann-magnum-50",     retailerId: "ch-cigarmust",      price: 580.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/hupmann" },
  { skuId: "h-upmann-magnum-50",     retailerId: "it-sigarietabacchi", price: 555.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── Romeo y Julieta Churchill (box 25) — Phase A batch 4 ────────────────
  { skuId: "romeo-y-julieta-churchill", retailerId: "de-noblego",        price: 520.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/romeo-y-julieta-churchill/" },
  { skuId: "romeo-y-julieta-churchill", retailerId: "de-cigarworld",     price: 535.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "romeo-y-julieta-churchill", retailerId: "be-lcdh-brussels",  price: 545.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },
  { skuId: "romeo-y-julieta-churchill", retailerId: "ch-cigarmust",      price: 580.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/romeo-y-julieta" },

  // ─── Cohiba Maduro 5 Magicos (box 10) ────────────────────────────────────
  { skuId: "cohiba-maduro-5-magicos", retailerId: "de-noblego",        price: 820.00, currency: "EUR", inStock: false, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-maduro-5-magicos/" },
  { skuId: "cohiba-maduro-5-magicos", retailerId: "ch-cigarmust",      price: 920.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba" },
  { skuId: "cohiba-maduro-5-magicos", retailerId: "es-cigarsmokerclub", price: 850.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarsmokerclub.es/" },

  // ─── Trinidad Coloniales (box 12) ────────────────────────────────────────
  { skuId: "trinidad-coloniales",    retailerId: "de-noblego",        price: 555.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/trinidad-coloniales/" },
  { skuId: "trinidad-coloniales",    retailerId: "ch-cigarmust",      price: 620.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/trinidad" },
  { skuId: "trinidad-coloniales",    retailerId: "be-lcdh-brussels",  price: 575.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },

  // ─── Bolívar Petit Coronas (box 25) ──────────────────────────────────────
  { skuId: "bolivar-petit-coronas",  retailerId: "de-noblego",        price: 275.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/bolivar-petit-corona/" },
  { skuId: "bolivar-petit-coronas",  retailerId: "de-cigarworld",     price: 285.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "bolivar-petit-coronas",  retailerId: "ch-cigarmust",      price: 305.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/bolivar/2-bolivar-petit-corona-7612907060808.html" },
  { skuId: "bolivar-petit-coronas",  retailerId: "it-sigarietabacchi", price: 290.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── Partagás Serie D No. 6 (box 20) ─────────────────────────────────────
  { skuId: "partagas-serie-d-no-6",  retailerId: "de-noblego",        price: 350.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/partagas-serie-d-no-6/" },
  { skuId: "partagas-serie-d-no-6",  retailerId: "de-cigarworld",     price: 365.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "partagas-serie-d-no-6",  retailerId: "ch-cigarmust",      price: 390.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/partagas/375-88-partagas-serie-d-no-6-7612907063311.html" },
  { skuId: "partagas-serie-d-no-6",  retailerId: "it-sigarietabacchi", price: 360.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── Montecristo Open Junior (box 20) — Phase A batch 5 ─────────────────
  { skuId: "montecristo-open-junior", retailerId: "de-noblego",        price: 295.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/montecristo-open-junior/" },
  { skuId: "montecristo-open-junior", retailerId: "de-cigarworld",     price: 310.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "montecristo-open-junior", retailerId: "ch-cigarmust",      price: 330.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo/333-35-montecristo-open-junior-7612907062062.html" },
  { skuId: "montecristo-open-junior", retailerId: "it-sigarietabacchi", price: 300.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── Montecristo Double Edmundo (box 10) ─────────────────────────────────
  { skuId: "montecristo-double-edmundo", retailerId: "de-noblego",        price: 595.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/montecristo-double-edmundo/" },
  { skuId: "montecristo-double-edmundo", retailerId: "de-cigarworld",     price: 610.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "montecristo-double-edmundo", retailerId: "ch-cigarmust",      price: 660.00, currency: "CHF", inStock: false, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/montecristo" },

  // ─── Cohiba Siglo III (box 25) ───────────────────────────────────────────
  { skuId: "cohiba-siglo-iii",       retailerId: "de-noblego",        price: 875.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/cohiba-siglo-iii/" },
  { skuId: "cohiba-siglo-iii",       retailerId: "ch-cigarmust",      price: 980.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/cohiba/223-cohiba-siglo-iii-7612907060938.html" },
  { skuId: "cohiba-siglo-iii",       retailerId: "it-sigarietabacchi", price: 890.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── Romeo y Julieta No. 1 Tubos (box 25) ────────────────────────────────
  { skuId: "romeo-y-julieta-no-1-tubos", retailerId: "de-noblego",        price: 485.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/romeo-y-julieta-no-1-tubos/" },
  { skuId: "romeo-y-julieta-no-1-tubos", retailerId: "de-cigarworld",     price: 500.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "romeo-y-julieta-no-1-tubos", retailerId: "ch-cigarmust",      price: 540.00, currency: "CHF", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/romeo-y-julieta/308-104-romeo-y-julieta-no1-7612907065100.html" },
  { skuId: "romeo-y-julieta-no-1-tubos", retailerId: "it-sigarietabacchi", price: 495.00, currency: "EUR", inStock: true, scrapedAt: "2026-05-15", sourceUrl: "https://sigarietabacchi.it/" },

  // ─── H. Upmann Connoisseur No. 1 (box 25) ────────────────────────────────
  { skuId: "h-upmann-connoisseur-no-1", retailerId: "de-noblego",        price: 595.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/h-upmann-connoisseur-no-1/" },
  { skuId: "h-upmann-connoisseur-no-1", retailerId: "de-cigarworld",     price: 610.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "h-upmann-connoisseur-no-1", retailerId: "ch-cigarmust",      price: 660.00, currency: "CHF", inStock: false, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/hupmann" },
  { skuId: "h-upmann-connoisseur-no-1", retailerId: "be-lcdh-brussels",  price: 615.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },

  // ─── Phase B — long-tail Cuban brands, one signature SKU per brand ────────
  { skuId: "juan-lopez-seleccion-no-1",       retailerId: "de-noblego",        price: 375.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/juan-lopez-seleccion-no-1/" },
  { skuId: "juan-lopez-seleccion-no-1",       retailerId: "be-lcdh-brussels",  price: 395.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://lacasadelhabano.brussels" },
  { skuId: "juan-lopez-seleccion-no-1",       retailerId: "ch-cigarmust",      price: 425.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/197-juan-lopez" },
  { skuId: "vegas-robaina-famosos",           retailerId: "de-noblego",        price: 595.00, currency: "EUR", inStock: false, scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/vegas-robaina-famosos/" },
  { skuId: "vegas-robaina-famosos",           retailerId: "ch-cigarmust",      price: 660.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/195-vegas-robaina" },
  { skuId: "quai-d-orsay-no-50",              retailerId: "de-noblego",        price: 265.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/quai-d-orsay-no-50/" },
  { skuId: "quai-d-orsay-no-50",              retailerId: "ch-cigarmust",      price: 295.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/200-quai-d-orsay" },
  { skuId: "ramon-allones-specially-selected", retailerId: "de-noblego",        price: 445.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/ramon-allones-specially-selected/" },
  { skuId: "ramon-allones-specially-selected", retailerId: "de-cigarworld",     price: 455.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.cigarworld.de/" },
  { skuId: "ramon-allones-specially-selected", retailerId: "ch-cigarmust",      price: 495.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/202-ramon-allones" },
  { skuId: "saint-luis-rey-regios",           retailerId: "de-noblego",        price: 455.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/saint-luis-rey-regios/" },
  { skuId: "saint-luis-rey-regios",           retailerId: "ch-cigarmust",      price: 505.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/203-saint-luis-rey" },
  { skuId: "el-rey-del-mundo-choix-supreme",  retailerId: "de-noblego",        price: 445.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/el-rey-del-mundo-choix-supreme/" },
  { skuId: "el-rey-del-mundo-choix-supreme",  retailerId: "ch-cigarmust",      price: 495.00, currency: "CHF", inStock: false, scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/196-el-rey-del-mundo" },
  { skuId: "por-larranaga-petit-coronas",     retailerId: "de-noblego",        price: 290.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/por-larranaga-petit-coronas/" },
  { skuId: "por-larranaga-petit-coronas",     retailerId: "ch-cigarmust",      price: 320.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/199-por-larranaga" },
  { skuId: "la-gloria-cubana-medaille-d-or-no-4", retailerId: "de-noblego",     price: 335.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/la-gloria-cubana-medaille-dor-no-4/" },
  { skuId: "la-gloria-cubana-medaille-d-or-no-4", retailerId: "ch-cigarmust",   price: 380.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/198-la-gloria-cubana" },
  { skuId: "diplomaticos-no-2",               retailerId: "de-noblego",        price: 545.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/diplomaticos-no-2/" },
  { skuId: "diplomaticos-no-2",               retailerId: "ch-cigarmust",      price: 605.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/268-diplomaticos" },
  { skuId: "san-cristobal-la-punta",          retailerId: "de-noblego",        price: 515.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/san-cristobal-la-punta/" },
  { skuId: "san-cristobal-la-punta",          retailerId: "ch-cigarmust",      price: 570.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/189-san-cristobal" },
  { skuId: "sancho-panza-belicosos",          retailerId: "de-noblego",        price: 485.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/sancho-panza-belicosos/" },
  { skuId: "sancho-panza-belicosos",          retailerId: "ch-cigarmust",      price: 530.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/204-sancho-panza" },
  { skuId: "rafael-gonzalez-petit-coronas",   retailerId: "de-noblego",        price: 275.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/rafael-gonzalez-petit-coronas/" },
  { skuId: "rafael-gonzalez-petit-coronas",   retailerId: "ch-cigarmust",      price: 305.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/201-rafael-gonzalez" },
  { skuId: "jose-l-piedra-brevas",            retailerId: "de-noblego",        price: 120.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/jose-l-piedra-brevas/" },
  { skuId: "jose-l-piedra-brevas",            retailerId: "ch-cigarmust",      price: 135.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/187-jose-l-piedra" },
  { skuId: "quintero-brevas",                 retailerId: "de-noblego",        price: 175.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/quintero-brevas/" },
  { skuId: "quintero-brevas",                 retailerId: "ch-cigarmust",      price: 195.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/194-quintero" },
  { skuId: "fonseca-cosacos",                 retailerId: "de-noblego",        price: 265.00, currency: "EUR", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://www.noblego.de/fonseca-cosacos/" },
  { skuId: "fonseca-cosacos",                 retailerId: "ch-cigarmust",      price: 295.00, currency: "CHF", inStock: true,  scrapedAt: "2026-05-15", sourceUrl: "https://cigarmust.com/en/192-fonseca" },

];

// ============================================================================
// QUERY HELPERS
// ============================================================================
export function snapshotsForSku(skuId: string): PriceSnapshot[] {
  return PRICE_SNAPSHOTS.filter((s) => s.skuId === skuId);
}

export function snapshotsForCountry(country: CountryCode): PriceSnapshot[] {
  const retailerIds = new Set(RETAILERS.filter((r) => r.country === country).map((r) => r.id));
  return PRICE_SNAPSHOTS.filter((s) => retailerIds.has(s.retailerId));
}

export function retailersForCountry(country: CountryCode): Retailer[] {
  return RETAILERS.filter((r) => r.country === country);
}

/** Cheapest in-stock EUR-normalized snapshot for a SKU (or undefined). */
export function bestPriceForSku(skuId: string): { snap: PriceSnapshot; eur: number } | undefined {
  const candidates = snapshotsForSku(skuId).filter((s) => s.inStock);
  if (!candidates.length) return undefined;
  let best = candidates[0];
  let bestEur = toEUR(best.price, best.currency);
  for (const c of candidates.slice(1)) {
    const eur = toEUR(c.price, c.currency);
    if (eur < bestEur) {
      best = c;
      bestEur = eur;
    }
  }
  return { snap: best, eur: bestEur };
}

/** Cheapest snapshot for a SKU within a given country. */
export function bestPriceInCountry(skuId: string, country: CountryCode): PriceSnapshot | undefined {
  const retailerIds = new Set(RETAILERS.filter((r) => r.country === country).map((r) => r.id));
  const candidates = snapshotsForSku(skuId).filter((s) => retailerIds.has(s.retailerId) && s.inStock);
  if (!candidates.length) return undefined;
  return candidates.reduce((a, b) => (b.price < a.price ? b : a));
}

/** Countries where at least one price snapshot exists. */
export function countriesWithCoverage(): Country[] {
  const covered = new Set(
    PRICE_SNAPSHOTS.map((s) => RETAILER_BY_ID[s.retailerId]?.country).filter(Boolean),
  );
  return COUNTRIES.filter((c) => covered.has(c.code));
}
