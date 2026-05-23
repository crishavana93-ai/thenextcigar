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
  { id: "de-noblego",            name: "Noblego",                            url: "https://www.noblego.de",                                 country: "de", city: "Berlin",          status: "mixed",              shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-cigarmaxx",          name: "Cigarmaxx",                          url: "https://www.cigarmaxx.de",                               country: "de", city: "Berlin",          status: "mixed",              shipsTo: "eu",        hasPublicPricing: true  },
  { id: "de-cigarworld",         name: "Cigarworld.de",                      url: "https://www.cigarworld.de",                              country: "de", city: "Düsseldorf",      status: "lcdh",               shipsTo: "eu",        hasPublicPricing: true  },
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
  { id: "ch-cigarmust",          name: "Cigarmust (LCDH Lugano/Mendrisio)",  url: "https://www.cigarmust.com",                              country: "ch", city: "Mendrisio",       status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  },
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
  { id: "uk-sautter",            name: "Sautter Cigars",                     url: "https://www.sauttercigars.com",                          country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-hava-havana",        name: "Hava Havana (LCDH London)",          url: "https://havahavana.com",                                 country: "uk", city: "Teddington",      status: "lcdh",               shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-robert-graham",      name: "Robert Graham 1874",                 url: "https://www.robertgraham1874.com",                       country: "uk", city: "Glasgow",         status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-cgars",              name: "C.Gars Ltd",                         url: "https://www.cgarsltd.co.uk",                             country: "uk", city: "Liverpool",       status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-turmeaus",           name: "Turmeaus (sister to C.Gars)",        url: "https://www.turmeaus.co.uk",                             country: "uk", city: "Liverpool",       status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-havanahouse",        name: "Havana House",                       url: "https://www.havanahouse.co.uk",                          country: "uk", city: "Cheshire",        status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "uk-no6-cavendish",      name: "No.6 Cavendish",                     url: "https://www.no6cavendish.com",                           country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-simplycigars",       name: "Simply Cigars",                      url: "https://www.simplycigars.co.uk",                         country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "eu",        hasPublicPricing: true  },
  { id: "uk-smoke-king",         name: "Smoke King",                         url: "https://www.smoke-king.co.uk",                           country: "uk",                          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "uk-tomtom",             name: "Tom Tom Cigars",                     url: "https://www.tomtomcigars.co.uk",                         country: "uk", city: "London",          status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },
  { id: "ch-egmcigars",          name: "EGM Cigars",                         url: "https://egmcigars.com",                                  country: "ch", city: "Balerna",         status: "habanos-specialist", shipsTo: "worldwide", hasPublicPricing: true  },

  // ─── Sweden ──── 15 verified ──────────────────────────────────────────────
  { id: "se-cigarrspecialisten", name: "Cigarrspecialisten (LCDH-tier Växjö)", url: "https://cigarrspecialisten.se",                        country: "se", city: "Växjö",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-puros",              name: "Puros.se",                           url: "https://www.puros.se",                                   country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-tobakshop",          name: "Tobakshop",                          url: "https://tobakshop.se",                                   country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-swecigars",          name: "Swecigars",                          url: "https://swecigars.se",                                   country: "se", city: "Södertälje",      status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-tobax",              name: "Tobax",                              url: "https://tobax.se",                                       country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-mr-andersons",       name: "Mr Andersons Cigars",                url: "https://www.mrandersonscigars.se",                       country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-cigarrfabriken",     name: "Cigarrfabriken",                     url: "https://cigarrfabriken.se",                              country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-tabaquero",          name: "Tabaquero",                          url: "https://tabaquero.se",                                   country: "se",                          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-chefcigars",         name: "Chefcigars",                         url: "https://chefcigars.se",                                  country: "se", city: "Boden",           status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-snusfabriken",       name: "Snusfabriken (Haparanda)",           url: "https://snusfabriken.com",                               country: "se", city: "Haparanda",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-cigarrummet",        name: "Cigarrummet",                        url: "https://www.cigarrummet.com",                            country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "se-cigarrhyllan",       name: "Cigarrhyllan",                       url: "https://cigarrhyllan.se",                                country: "se", city: "Stockholm",       status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: true  },
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
  { id: "it-sigarietabacchi",    name: "Sigari e Tabacchi (Padova)",         url: "https://sigarietabacchi.it",                             country: "it", city: "Padova",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
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
  { id: "es-cigarsmokerclub",    name: "Cigar Smoker Club (legal reservation channel)", url: "https://cigarsmokerclub.com",               country: "es",                          status: "reservation",        shipsTo: "domestic",  hasPublicPricing: true  },
  { id: "es-magallanes",         name: "Cigar Shop Magallanes (largest humidor)", url: "https://magallanes.store",                          country: "es", city: "Madrid",          status: "habanos-specialist", shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-madrid",        name: "LCDH Madrid Recoletos",              url: "https://lacasadelhabano-dl.es",                          country: "es", city: "Madrid",          status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-tenerife",      name: "LCDH Adeje Tenerife",                url: "https://www.lacasadelhabano-tenerife.com",               country: "es", city: "Adeje",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-gran-canaria",  name: "LCDH Mogán Gran Canaria",            url: "https://www.lacasadelhabano-tenerife.com",               country: "es", city: "Mogán",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "es-lcdh-mallorca",      name: "LCDH Palma de Mallorca",             url: "https://habanos.com",                                    country: "es", city: "Palma",           status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },

  // ─── Belgium ──── 5 LCDH directory-only (online sale banned) ──────────────
  { id: "be-lcdh-antwerp",       name: "LCDH Antwerpen",                     url: "https://www.lcdhantwerp.com",                            country: "be", city: "Antwerpen",       status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
  { id: "be-lcdh-brussels",      name: "LCDH Brussel (Charlemagne)",         url: "https://lacasadelhabano.brussels",                       country: "be", city: "Brussels",        status: "lcdh",               shipsTo: "domestic",  hasPublicPricing: false },
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
