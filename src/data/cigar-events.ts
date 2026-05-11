/**
 * Cigar festivals and major events worldwide.
 *
 * Each event has coordinates so it can be plotted on the EventsMap.
 * Past events stay in the list but get filtered out of "upcoming" views
 * by comparing endDate to today.
 *
 * Curated from official sources (habanos.com, procigar.org, intertabac.com,
 * cigaraficionado.com Big Smoke pages, premiumcigars.org for PCA).
 */

export interface CigarEvent {
  /** stable slug used in URLs and as map pin id */
  slug: string;
  name: string;
  /** short, single-line tagline shown on cards and popups */
  tagline: string;
  /** organization that runs it */
  host?: string;
  /** ISO date for the first day */
  startDate: string;
  /** ISO date for the last day */
  endDate: string;
  /** Display city + country, e.g. "Havana, Cuba" */
  location: string;
  /** Decimal degrees lat/lng for map pin */
  lat: number;
  lng: number;
  /** Official ticketing / info URL */
  url: string;
  /** Price band, optional */
  priceFrom?: number;
  priceCurrency?: string;
  /** "festival" | "trade-show" | "gala" | "regional" */
  type: "festival" | "trade-show" | "gala" | "regional";
  /** 2-3 sentence editorial blurb shown on click */
  blurb: string;
}

export const events: CigarEvent[] = [
  {
    slug: "habanos-festival-2027",
    name: "Festival del Habano XXVII",
    tagline: "Cuba's annual celebration of premium cigars",
    host: "Habanos S.A.",
    startDate: "2027-02-22",
    endDate: "2027-02-26",
    location: "Havana, Cuba",
    lat: 23.1136,
    lng: -82.3666,
    url: "https://www.habanos.com/en/festival-del-habano/",
    priceFrom: 1500,
    priceCurrency: "EUR",
    type: "festival",
    blurb:
      "The headline event of the cigar calendar. A week of factory tours, blind tastings, the trade fair at PABEXPO, and the legendary gala-night humidor auction. Every major Cuban brand reveals its limited editions here.",
  },
  {
    slug: "procigar-2027",
    name: "ProCigar Festival",
    tagline: "Dominican Republic's answer to Habanos",
    host: "ProCigar Association",
    startDate: "2027-02-14",
    endDate: "2027-02-19",
    location: "Santiago de los Caballeros, Dominican Republic",
    lat: 19.4517,
    lng: -70.6970,
    url: "https://www.procigar.org/",
    priceFrom: 1200,
    priceCurrency: "USD",
    type: "festival",
    blurb:
      "Six days inside the Dominican cigar industry. Tours of La Aurora, Davidoff, Arturo Fuente, Tabacalera de García. Smaller crowds than Havana, more access to the rollers and blenders.",
  },
  {
    slug: "puro-sabor-2027",
    name: "Puro Sabor Nicaragua",
    tagline: "Inside Nicaragua's tobacco belt",
    host: "Nicaraguan Chamber of Tobacco",
    startDate: "2027-01-17",
    endDate: "2027-01-22",
    location: "Estelí, Nicaragua",
    lat: 13.0879,
    lng: -86.3534,
    url: "https://purosabornicaragua.com/",
    priceFrom: 950,
    priceCurrency: "USD",
    type: "festival",
    blurb:
      "The week to see Plasencia, Joya de Nicaragua, AJ Fernandez, and Padrón up close. Field visits, factory walks, and the closing-night gala. Estelí is the world's largest premium cigar production hub.",
  },
  {
    slug: "intertabac-2026",
    name: "InterTabac Dortmund",
    tagline: "The world's largest tobacco trade show",
    host: "Westfalenhallen",
    startDate: "2026-09-17",
    endDate: "2026-09-19",
    location: "Dortmund, Germany",
    lat: 51.5063,
    lng: 7.4475,
    url: "https://www.intertabac.com/",
    type: "trade-show",
    blurb:
      "The European industry trade show. Every major manufacturer exhibits — Habanos S.A., Davidoff, Oettinger, Villiger, Scandinavian Tobacco Group. Trade-only but pass-of-record for the trade press and serious distributors.",
  },
  {
    slug: "pca-2026",
    name: "PCA Trade Show",
    tagline: "Premium Cigar Association annual convention",
    host: "Premium Cigar Association",
    startDate: "2026-07-11",
    endDate: "2026-07-14",
    location: "Las Vegas, USA",
    lat: 36.1262,
    lng: -115.1727,
    url: "https://www.premiumcigars.org/",
    type: "trade-show",
    blurb:
      "Formerly IPCPR. The US-side equivalent of InterTabac — every American boutique brand and importer in one Vegas convention center. Where most NEW cigar releases for the US market are announced.",
  },
  {
    slug: "big-smoke-vegas-2026",
    name: "Big Smoke Las Vegas",
    tagline: "Cigar Aficionado's flagship consumer event",
    host: "Cigar Aficionado",
    startDate: "2026-11-13",
    endDate: "2026-11-15",
    location: "Las Vegas, USA",
    lat: 36.1147,
    lng: -115.1728,
    url: "https://www.cigaraficionado.com/bigsmoke",
    priceFrom: 595,
    priceCurrency: "USD",
    type: "gala",
    blurb:
      "The consumer-facing event of the year. Smoke 30+ cigars over two nights, meet the makers, attend the seminars. Big Smoke Vegas is the easiest way for a US enthusiast to put faces to brands.",
  },
  {
    slug: "big-smoke-meets-whisky-fest-2026",
    name: "Big Smoke Meets WhiskyFest",
    tagline: "Cigar + whisky pairings, NYC",
    host: "Cigar Aficionado · Whisky Advocate",
    startDate: "2026-04-23",
    endDate: "2026-04-23",
    location: "New York, USA",
    lat: 40.7484,
    lng: -73.9857,
    url: "https://www.cigaraficionado.com/bigsmoke",
    priceFrom: 295,
    priceCurrency: "USD",
    type: "gala",
    blurb:
      "Crossover event. Cigar Aficionado and Whisky Advocate pair single malts with hand-rolled cigars. Small ticket count, NYC venue, the pairing experience most aficionados only get to see once.",
  },
  {
    slug: "festival-de-cigares-2026",
    name: "Festival du Cigare",
    tagline: "France's premier cigar weekend",
    host: "Le Cigar Magazine",
    startDate: "2026-10-09",
    endDate: "2026-10-11",
    location: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    url: "https://www.amateursdecigares.com/",
    type: "festival",
    blurb:
      "The French scene's annual gathering. Lounge takeovers across the 8th arrondissement, masterclasses with French Tabaclubs members, and the closing dinner at one of the historic Parisian houses.",
  },
  {
    slug: "swedish-cigar-day-2026",
    name: "Svenska Cigardagen",
    tagline: "Sweden's annual cigar appreciation day",
    host: "Cigarrcentralen",
    startDate: "2026-11-21",
    endDate: "2026-11-21",
    location: "Stockholm, Sweden",
    lat: 59.3293,
    lng: 18.0686,
    url: "https://cigarrcentralen.se/",
    type: "regional",
    blurb:
      "Single-day showcase at Cigarrcentralen and the Lasse Diding tobacco shop. Free entry, masterclasses, and Stockholm's cigar community in one place. Casual format, real depth.",
  },
];

/** All events still on or after today, sorted by startDate ascending. */
export function upcomingEvents(now = new Date()): CigarEvent[] {
  return events
    .filter((e) => new Date(e.endDate).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}
