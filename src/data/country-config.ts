// ============================================================================
// The Finder — Country Legal & UI Configuration
// ============================================================================
// One row per country we surface. Encodes the SIX legal archetypes documented
// in docs/retailer-research/eu-deep-map-summary.md so the alert engine,
// Cloudflare scraper, and Finder UI can all respect each market's regulatory
// posture without ad-hoc per-page logic.
//
// Without this layer the alert engine will eventually fire an email into
// France or Spain telling a user that their box of Cohiba Robustos is now
// EUR 1,930 at Noblego.de — which is a Loi Évin / Ley 28/2005 violation that
// could expose The Next Cigar to real legal risk in those jurisdictions.
//
// THIS FILE IS THE SOURCE OF TRUTH for:
//   - whether the "Shop" button on a SKU page is active per country
//   - whether the alert engine emails subscribers in that country
//   - what regulatory disclaimer renders on /finder/[country]
//   - whether the scraper Worker is allowed to crawl retailers there
//   - how the country page renders (price-comparison vs. directory)
// ============================================================================

import type { CountryCode } from "./finder-data.ts";

/** Six archetypes that describe how a country's tobacco-retail law
 *  affects The Finder's behaviour. See eu-deep-map-summary.md for the
 *  full legal mapping. */
export type LegalArchetype =
  | "open"                      // DE, UK, CH, NL, SE, DK, IE, GR, CZ etc.
  | "online_sale_banned"        // FR, ES, FI, BE — directory only
  | "cross_border_ban"          // NO since Jan 2026 — geo-restrict comparison
  | "domestic_grey_zone"        // IT — show domestic to IT IPs only
  | "display_image_banned"      // DK — scrape text-only
  | "state_price_uniform";      // AT, PT mainland, IS, partial ES/FR/IT

/** What the Finder country page renders. */
export type CountryViewMode =
  | "price-comparison"          // full grid w/ best-price/cheapest sort
  | "directory"                 // retailer cards w/ addresses; no prices
  | "hybrid";                   // price grid for in-stock, directory for the rest

export interface CountryConfig {
  code: CountryCode;
  archetype: LegalArchetype;
  viewMode: CountryViewMode;

  /** Will the "Shop at retailer" CTA be rendered? */
  onlineSaleAllowed: boolean;
  /** Can a buyer in this country legally order from foreign retailers? */
  crossBorderImportAllowed: boolean;
  /** Can we show product images on retailer cards? (false = DK April 2021 law) */
  displayImagesAllowed: boolean;
  /** Should country pricing be geo-restricted to local IPs only? */
  geofenceRequired: boolean;
  /** May we email price alerts to subscribers in this country? */
  alertEmailAllowed: boolean;
  /** Does meaningful price comparison exist here, or are prices state-fixed? */
  priceComparisonValue: "full" | "partial" | "none";

  /** Sole national Habanos importer (for editorial transparency). */
  importerOfRecord: string;
  /** Primary legal citation for the regulatory framing. */
  regulationCite: string;
  /** Short consumer-facing warning rendered on country page (≤ 200 chars). */
  regulatoryWarning?: string;
  /** Countries we suggest as legal cross-border channels for restricted markets. */
  bestForCrossBorder?: CountryCode[];
}

// ============================================================================
// CONFIG TABLE — every country we surface in The Finder
// ============================================================================
export const COUNTRY_CONFIG: Record<CountryCode, CountryConfig> = {
  // ─── ARCHETYPE 1: OPEN, online-friendly, schema-rich ─────────────────────
  de: {
    code: "de", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "5th Avenue Products Trading GmbH",
    regulationCite: "HTabakWG (Tobacco Act); EU TPD 2014/40/EU",
  },
  uk: {
    code: "uk", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Hunters & Frankau Ltd",
    regulationCite: "Tobacco Advertising and Promotion Act 2002 (post-Brexit)",
  },
  ch: {
    code: "ch", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Intertabak SA (since 1995)",
    regulationCite: "Swiss Tobacco Ordinance; outside EU customs union",
    regulatoryWarning:
      "Swiss retailers ship into the EU. Cross-border imports may incur customs handling and VAT on arrival.",
  },
  nl: {
    code: "nl", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Cubacigar Benelux",
    regulationCite: "Tabaks- en rookwarenwet (NL Tobacco Act, 2021 display ban)",
  },
  se: {
    code: "se", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Habanos Nordic / Elite Trading Scandinavia AB",
    regulationCite: "Lag 2018:2088 §4 (promotion ban; retail and online sale legal)",
  },
  ie: {
    code: "ie", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Hunters & Frankau (UK) supplies via James J. Fox",
    regulationCite: "Public Health (Tobacco) Acts 2002-2015",
  },
  gr: {
    code: "gr", archetype: "open", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Karelia Tobacco / regional distributors",
    regulationCite: "Greek Tobacco Law 3868/2010",
  },
  lu: {
    code: "lu", archetype: "open", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "partial",
    importerOfRecord: "Phoenicia TAA Trading (LU + 56 MEA markets)",
    regulationCite: "Loi du 11 août 2006",
    regulatoryWarning: "LCDH Luxembourg City is in-store only — no online shipping from Luxembourg retailers.",
  },

  // ─── ARCHETYPE 2: ONLINE SALE FULLY BANNED — directory only ──────────────
  fr: {
    code: "fr", archetype: "online_sale_banned", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: false,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "none",
    importerOfRecord: "Coprova SAS (since 1970, France + Monaco)",
    regulationCite:
      "Article 568 ter CGI (online tobacco sale banned); Loi Évin (advertising ban); JORF-homologated state prices",
    regulatoryWarning:
      "Online tobacco sale to consumers in France is prohibited by law (Article 568 ter CGI). All buralistes sell at identical state-homologated prices. We cannot show prices, send price alerts, or facilitate purchases for France.",
    bestForCrossBorder: ["ch"],
  },
  es: {
    code: "es", archetype: "online_sale_banned", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: false,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "none",
    importerOfRecord: "Altadis / Logista (Imperial Brands)",
    regulationCite:
      "Ley 28/2005 (online tobacco sale banned); CMT/BOE state-fixed prices",
    regulatoryWarning:
      "Spanish law (Ley 28/2005) bans online tobacco sales to consumers. All estancos sell at identical state-set prices via CMT weekly bulletins. The Finder lists estancos for in-person purchase only.",
    bestForCrossBorder: ["ch"],
  },
  fi: {
    code: "fi", archetype: "online_sale_banned", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: false,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "none",
    importerOfRecord: "Habanos Nordic (Elite Trading Scandinavia AB, Sweden)",
    regulationCite: "Tobacco Act 549/2016 §65 (distance sale banned)",
    regulatoryWarning:
      "Finland prohibits all distance and online tobacco sale (Tobacco Act §65). The Finder lists Finnish Habanos retailers for in-store purchase only.",
    bestForCrossBorder: ["se"],
  },
  be: {
    code: "be", archetype: "online_sale_banned", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: true,
    displayImagesAllowed: false, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "none",
    importerOfRecord: "Laguito 1492 NV (formerly Cubacigar Benelux)",
    regulationCite:
      "Loi du 24 janvier 1977 art 6 §1 (amended 2022) — online tobacco sale banned; April 2025 display ban",
    regulatoryWarning:
      "Belgian law bans online tobacco sales (2022 amendment). Belgian retailers operate by reservation + in-store pickup only. The Finder lists Belgian LCDH and Habanos Specialist locations for in-person purchase.",
    bestForCrossBorder: ["nl", "ch"],
  },

  // ─── ARCHETYPE 3: CROSS-BORDER BAN — geofenced comparison ────────────────
  no: {
    code: "no", archetype: "cross_border_ban", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: false,
    displayImagesAllowed: true, geofenceRequired: true,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Habanos Nordic (Elite Trading Scandinavia AB, Sweden)",
    regulationCite:
      "Tobakksskadeloven §21b (Jan 1 2026: cross-border distance sale banned)",
    regulatoryWarning:
      "Since 1 January 2026, Norwegian law (§21b) prohibits buying tobacco from foreign retailers via distance methods (internet, mail, phone). Norwegian Customs detains and destroys non-compliant parcels. The Finder restricts Norway comparisons to Norwegian retailers only.",
  },

  // ─── ARCHETYPE 4: DOMESTIC GREY-ZONE — geofence-required ─────────────────
  it: {
    code: "it", archetype: "domestic_grey_zone", viewMode: "hybrid",
    onlineSaleAllowed: true, crossBorderImportAllowed: false,
    displayImagesAllowed: true, geofenceRequired: true,
    alertEmailAllowed: true, priceComparisonValue: "partial",
    importerOfRecord: "Diadema S.p.A. (Pomezia)",
    regulationCite:
      "D.Lgs. 6/2016 (transnational distance sale banned); ADM tariff uniform pricing",
    regulatoryWarning:
      "Italian law (D.Lgs. 6/2016) bans cross-border online tobacco sales (€30,000-€150,000 fines). Domestic online sale by licensed tabaccai operates in a tolerated grey zone. Italian prices are visible only to Italian-IP users.",
    bestForCrossBorder: ["ch"],
  },

  // ─── ARCHETYPE 5: DISPLAY IMAGE BANNED — text-only scraping ──────────────
  dk: {
    code: "dk", archetype: "display_image_banned", viewMode: "price-comparison",
    onlineSaleAllowed: true, crossBorderImportAllowed: true,
    displayImagesAllowed: false, geofenceRequired: false,
    alertEmailAllowed: true, priceComparisonValue: "full",
    importerOfRecord: "Habanos Nordic (Elite Trading Scandinavia AB, Sweden)",
    regulationCite:
      "Danish Tobacco Display Law (April 2021, extended to e-commerce); MitID payment gate (Oct 2024)",
    regulatoryWarning:
      "Danish webshops show product names and prices only, no images (April 2021 display law). The Finder mirrors this where rendering Danish retailers.",
  },

  // ─── ARCHETYPE 6: STATE PRICE-UNIFORM — directory + availability ─────────
  at: {
    code: "at", archetype: "state_price_uniform", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "none",
    importerOfRecord: "5th Avenue Austria (5th Avenue Products Trading)",
    regulationCite:
      "Austrian Tobakkmonopolgesetz (MVG) — Trafiken monopoly; uniform 5th Avenue tariff",
    regulatoryWarning:
      "Austrian Trafiken operate under the state tobacco monopoly with uniform 5th Avenue prices. The Finder lists Habanos Specialist Trafiken for in-store visit; price comparison is not meaningful here.",
    bestForCrossBorder: ["de", "ch"],
  },
  pt: {
    code: "pt", archetype: "state_price_uniform", viewMode: "hybrid",
    onlineSaleAllowed: false, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "partial",
    importerOfRecord: "EMPOR S.A. (since 1960)",
    regulationCite:
      "Lei 109/2015 Art. 15.1.d (distance sale prohibited); CIEC Art. 105-A (Madeira reduced tax regime)",
    regulatoryWarning:
      "Portuguese law (Lei 109/2015) bans distance sale of tobacco. Mainland EMPOR prices are uniform across retailers; Madeira pricing is ~20-30% lower under the regional CIEC reduced-tax regime.",
  },
  cz: {
    code: "cz", archetype: "state_price_uniform", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "none",
    importerOfRecord: "Mercanta Cesi (CZ Habanos distributor)",
    regulationCite: "Zákon č. 65/2017 Sb. (Czech Tobacco Act)",
    regulatoryWarning:
      "Czech LCDH and Habanos Specialists operate in-store only — no consumer e-commerce in the CZ tobacco channel.",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Lookup config for a country, or undefined if not configured.
 *  Use `policyFor(code)` if you want a safe default for unconfigured codes. */
export function configFor(code: CountryCode): CountryConfig | undefined {
  return COUNTRY_CONFIG[code];
}

/** Lookup config with a conservative default for un-mapped countries.
 *  Defaults to OPEN — caller should add the country to COUNTRY_CONFIG above
 *  before deploying any feature that touches it. */
export function policyFor(code: CountryCode): CountryConfig {
  const explicit = COUNTRY_CONFIG[code];
  if (explicit) return explicit;
  // Conservative fallback for any new country code added to finder-data.ts
  // before the country-config has been updated. Direct caller to add a row.
  console.warn(`[country-config] No policy configured for "${code}". Add a row to COUNTRY_CONFIG.`);
  return {
    code, archetype: "open", viewMode: "directory",
    onlineSaleAllowed: false, crossBorderImportAllowed: true,
    displayImagesAllowed: true, geofenceRequired: false,
    alertEmailAllowed: false, priceComparisonValue: "partial",
    importerOfRecord: "Unknown — add to country-config.ts",
    regulationCite: "Not yet researched",
    regulatoryWarning: "We have not yet researched the regulatory framework in this country. Prices, retailers, and shipping channels are not currently verified.",
  };
}

/** Can the alert engine email subscribers in this country? Used by the
 *  Cloudflare Worker that fires price-drop / restock notifications. */
export function alertEmailLegal(code: CountryCode): boolean {
  return policyFor(code).alertEmailAllowed;
}

/** Is the "Shop at retailer" CTA legal to show on a country's retailer card? */
export function shopButtonLegal(code: CountryCode): boolean {
  return policyFor(code).onlineSaleAllowed;
}

/** Should we geofence prices to only show them to local-IP users? */
export function requiresGeofence(code: CountryCode): boolean {
  return policyFor(code).geofenceRequired;
}

/** Does meaningful price comparison exist here, or are prices state-fixed? */
export function priceComparisonValue(code: CountryCode): "full" | "partial" | "none" {
  return policyFor(code).priceComparisonValue;
}

/** Get the user-facing regulatory disclaimer for a country (or undefined). */
export function regulatoryWarning(code: CountryCode): string | undefined {
  return policyFor(code).regulatoryWarning;
}

/** For restricted countries, what other countries' retailers are a legal
 *  cross-border channel? (e.g. France users → Switzerland). */
export function legalCrossBorderTargets(code: CountryCode): CountryCode[] {
  return policyFor(code).bestForCrossBorder ?? [];
}

/** Filter a list of countries down to those where price comparison is meaningful. */
export function priceComparisonCountries(allCodes: CountryCode[]): CountryCode[] {
  return allCodes.filter((c) => priceComparisonValue(c) !== "none");
}

/** Filter to directory-only countries (where the Finder page is a retailer map, not a price grid). */
export function directoryOnlyCountries(allCodes: CountryCode[]): CountryCode[] {
  return allCodes.filter((c) => policyFor(c).viewMode === "directory");
}
