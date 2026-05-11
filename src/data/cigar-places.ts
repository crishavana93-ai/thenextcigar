/**
 * Curated cigar lounges, retailers, and notable cigar pubs/bars worldwide.
 *
 * Each entry is geolocated so the EventsMap can plot it next to the user's
 * detected location. Heavily curated — these are places we'd send a TNC
 * reader to. Submissions can be added via PR.
 *
 * Coordinate sources: OpenStreetMap and Google Maps verified addresses.
 */

export type PlaceType =
  | "lounge"          // dedicated cigar lounge / smoking salon
  | "retailer"        // premium cigar shop
  | "house"           // brand house or maker's flagship (Cohiba Atmosphere etc.)
  | "casadelhabano"   // official Habanos S.A. franchise store
  | "pub"             // pub/bar where cigars are welcome
  | "club";           // private members' club

export interface CigarPlace {
  slug: string;
  name: string;
  type: PlaceType;
  city: string;
  country: string;
  address?: string;
  lat: number;
  lng: number;
  website?: string;
  /** 1-2 sentence editorial blurb */
  note?: string;
}

export const places: CigarPlace[] = [
  // ─── LONDON ─────────────────────────────────────────────────────────────
  {
    slug: "sautter-mayfair",
    name: "Sautter of Mayfair",
    type: "retailer",
    city: "London",
    country: "United Kingdom",
    address: "106 Mount Street, Mayfair, London W1K 2TW",
    lat: 51.5095,
    lng: -0.1530,
    website: "https://www.sautter.com/",
    note: "Mayfair's premier cigar merchant. Walk-in humidor with the deepest Habanos selection in the UK.",
  },
  {
    slug: "davidoff-london",
    name: "Davidoff of London",
    type: "retailer",
    city: "London",
    country: "United Kingdom",
    address: "35 St James's Street, London SW1A 1HD",
    lat: 51.5066,
    lng: -0.1380,
    website: "https://www.davidofflondon.com/",
    note: "Davidoff's flagship UK store on St James's. Walk-in humidor, knowledgeable counter staff, the historic 19th-century shop.",
  },
  {
    slug: "jj-fox",
    name: "J.J. Fox of St James's",
    type: "retailer",
    city: "London",
    country: "United Kingdom",
    address: "19 St James's Street, London SW1A 1ES",
    lat: 51.5069,
    lng: -0.1391,
    website: "https://jjfox.co.uk/",
    note: "Trading since 1787 — the oldest tobacconist in continuous operation in the UK. Churchill's own shop.",
  },
  {
    slug: "boisdale-canary-wharf",
    name: "Boisdale of Canary Wharf",
    type: "club",
    city: "London",
    country: "United Kingdom",
    address: "Cabot Place, Canary Wharf, London E14 4QT",
    lat: 51.5050,
    lng: -0.0193,
    website: "https://www.boisdale.co.uk/canary-wharf/",
    note: "Cigar terrace overlooking the dock. Live jazz, full whisky list, the smoking-friendly room.",
  },
  {
    slug: "hunters-frankau-london",
    name: "Hunters & Frankau",
    type: "retailer",
    city: "London",
    country: "United Kingdom",
    address: "13 Grosvenor Crescent, Belgravia, London SW1X 7EE",
    lat: 51.5009,
    lng: -0.1531,
    website: "https://www.hf.uk.com/",
    note: "UK distributor of Habanos. Trade-only at the office but the retail Cabinet showroom is open by appointment.",
  },

  // ─── HAVANA ─────────────────────────────────────────────────────────────
  {
    slug: "casa-habano-conde-villanueva",
    name: "La Casa del Habano · Conde de Villanueva",
    type: "casadelhabano",
    city: "Havana",
    country: "Cuba",
    address: "Calle Mercaderes 202, La Habana Vieja",
    lat: 23.1380,
    lng: -82.3530,
    website: "https://www.habanos.com/",
    note: "Inside the historic Hostal Conde de Villanueva. Smoking room, fully stocked humidor, the location every Havana traveler eventually finds.",
  },
  {
    slug: "casa-habano-club-habana",
    name: "La Casa del Habano · Club Habana",
    type: "casadelhabano",
    city: "Havana",
    country: "Cuba",
    address: "5ta Avenida y 188, Playa, Havana",
    lat: 23.0985,
    lng: -82.4790,
    note: "Beachfront LCDH at the Club Habana resort. Quietest of the Havana houses; deep cabinet selection.",
  },
  {
    slug: "casa-habano-partagas",
    name: "La Casa del Habano · Partagás",
    type: "casadelhabano",
    city: "Havana",
    country: "Cuba",
    address: "Industria 520, Centro Habana",
    lat: 23.1356,
    lng: -82.3589,
    note: "Adjacent to the Partagás factory site. Walking-in tourists welcome; the upstairs lounge is where the regulars sit.",
  },

  // ─── NEW YORK ───────────────────────────────────────────────────────────
  {
    slug: "davidoff-madison",
    name: "Davidoff of Geneva · Madison Avenue",
    type: "retailer",
    city: "New York",
    country: "United States",
    address: "535 Madison Ave, New York, NY 10022",
    lat: 40.7607,
    lng: -73.9728,
    website: "https://www.davidoffgeneva.com/",
    note: "Davidoff's NYC flagship. Walk-in humidor, smoking lounge in the back, premium-only selection.",
  },
  {
    slug: "club-macanudo-nyc",
    name: "Club Macanudo",
    type: "lounge",
    city: "New York",
    country: "United States",
    address: "26 East 63rd Street, New York, NY 10065",
    lat: 40.7659,
    lng: -73.9684,
    website: "https://www.clubmacanudonyc.com/",
    note: "Upper East Side cigar bar. Cocktail list, lockers for regulars, and a kitchen that takes the food seriously.",
  },
  {
    slug: "carnegie-club",
    name: "The Carnegie Club",
    type: "lounge",
    city: "New York",
    country: "United States",
    address: "156 W 56th St, New York, NY 10019",
    lat: 40.7649,
    lng: -73.9784,
    website: "https://hospitalityholdings.com/cigar-bar/",
    note: "Old-school cigar lounge near Carnegie Hall. Live big-band sets on Saturday, smoking permitted indoors.",
  },

  // ─── MIAMI ──────────────────────────────────────────────────────────────
  {
    slug: "casa-cuba-miami",
    name: "Casa de Montecristo",
    type: "lounge",
    city: "Miami",
    country: "United States",
    address: "1900 Biscayne Blvd, Miami, FL 33132",
    lat: 25.7926,
    lng: -80.1881,
    website: "https://www.casademontecristo.com/",
    note: "Imperial Brands' US lounge concept. Smoking permitted indoors, deep New World inventory.",
  },
  {
    slug: "el-titan-bronze",
    name: "El Titán de Bronce",
    type: "retailer",
    city: "Miami",
    country: "United States",
    address: "1071 SW 8th St, Miami, FL 33130",
    lat: 25.7651,
    lng: -80.2143,
    website: "https://www.eltitan.com/",
    note: "Little Havana's working cigar factory. Watch the rollers, buy at counter, the most-authentic Cuban-style experience in the US.",
  },

  // ─── MIDDLE EAST ────────────────────────────────────────────────────────
  {
    slug: "cohiba-atmosphere-dubai",
    name: "Cohiba Atmosphere Dubai",
    type: "house",
    city: "Dubai",
    country: "United Arab Emirates",
    address: "Sofitel Dubai The Obelisk, Dubai",
    lat: 25.2289,
    lng: 55.3287,
    website: "https://www.habanos.com/",
    note: "Habanos S.A.'s premium-tier lounge concept. Cigars + curated cocktail pairings; one of only a handful of Cohiba Atmosphere venues worldwide.",
  },

  // ─── PARIS ──────────────────────────────────────────────────────────────
  {
    slug: "le-fumoir-de-vincennes",
    name: "La Civette",
    type: "retailer",
    city: "Paris",
    country: "France",
    address: "157 Rue Saint-Honoré, 75001 Paris",
    lat: 48.8625,
    lng: 2.3415,
    note: "Historic Right Bank tobacconist trading since 1716. The discreet Paris choice — the cabinet is small but every cigar in it has a reason.",
  },

  // ─── GERMANY ────────────────────────────────────────────────────────────
  {
    slug: "casa-del-habano-frankfurt",
    name: "La Casa del Habano Frankfurt",
    type: "casadelhabano",
    city: "Frankfurt",
    country: "Germany",
    address: "Goethestraße 13, 60313 Frankfurt am Main",
    lat: 50.1144,
    lng: 8.6790,
    website: "https://lcdh-frankfurt.de/",
    note: "Germany's flagship Habanos house. Smoking lounge, the deepest Habanos cabinet in the country.",
  },

  // ─── SWITZERLAND ────────────────────────────────────────────────────────
  {
    slug: "davidoff-geneva-flagship",
    name: "Davidoff de Genève",
    type: "house",
    city: "Geneva",
    country: "Switzerland",
    address: "Rue de Rive 2, 1204 Genève",
    lat: 46.2010,
    lng: 6.1466,
    website: "https://www.davidoffgeneva.com/",
    note: "Davidoff's original Geneva flagship. The shop Zino Davidoff himself ran. Smoking salon, premium-only.",
  },

  // ─── SPAIN ──────────────────────────────────────────────────────────────
  {
    slug: "gimeno-barcelona",
    name: "Gimeno Tabacos",
    type: "retailer",
    city: "Barcelona",
    country: "Spain",
    address: "La Rambla, 100, 08002 Barcelona",
    lat: 41.3825,
    lng: 2.1731,
    website: "https://www.gimeno.es/",
    note: "Trading on Las Ramblas since 1920. The Barcelona stop — Habanos, German pipes, the historic tobacco shop you walk into by accident and stay an hour.",
  },

  // ─── SWEDEN (Cris's home market) ─────────────────────────────────────────
  {
    slug: "cigarrcentralen-stockholm",
    name: "Cigarrcentralen",
    type: "retailer",
    city: "Stockholm",
    country: "Sweden",
    address: "Birger Jarlsgatan 17, 111 45 Stockholm",
    lat: 59.3358,
    lng: 18.0716,
    website: "https://cigarrcentralen.se/",
    note: "Stockholm's premier cigar specialist. Walk-in humidor, regular tastings, the meeting point for the Swedish cigar community.",
  },
  {
    slug: "lasse-diding-varberg",
    name: "Hotel Gästis · Lasse Diding's Cigarmaker",
    type: "lounge",
    city: "Varberg",
    country: "Sweden",
    address: "Bäckgatan 1, 432 41 Varberg",
    lat: 57.1058,
    lng: 12.2502,
    website: "https://www.hotelgastis.se/",
    note: "The legendary Lasse Diding's hotel and cigar lounge on Sweden's west coast. Cuban inventory, smoking permitted indoors, the cult Swedish destination.",
  },

  // ─── NORTHERN EUROPE / DENMARK ───────────────────────────────────────────
  {
    slug: "wb-engel-copenhagen",
    name: "W.Ø. Larsen",
    type: "retailer",
    city: "Copenhagen",
    country: "Denmark",
    address: "Læderstræde 11, 1201 København",
    lat: 55.6772,
    lng: 12.5793,
    website: "https://wolarsen.dk/",
    note: "Trading since 1864. Specialists in the Danish pipe tradition but the cigar room is serious. Walk-in humidor and a quiet smoking lounge.",
  },
  {
    slug: "macanudo-copenhagen",
    name: "Cigar Shop Macanudo Copenhagen",
    type: "retailer",
    city: "Copenhagen",
    country: "Denmark",
    address: "Silkegade 23, 1113 København K",
    lat: 55.6803,
    lng: 12.5807,
    website: "https://clubmacanudo.com/locations/copenhagen/",
    note: "STG's relaunch of the former Davidoff My Own Blend store. Walk-in humidor with a strong Macanudo and General Cigar selection, a few steps from Strøget.",
  },
  {
    slug: "musen-og-elefanten",
    name: "Musen & Elefanten",
    type: "pub",
    city: "Copenhagen",
    country: "Denmark",
    address: "Vestergade 21, 1456 København K",
    lat: 55.6776,
    lng: 12.5710,
    website: "https://musenogelefanten.dk/",
    note: "One of the only bars in Denmark that sells cigars. Two floors, old-Copenhagen apartment vibe, smoking nights on designated days. The cult cigar bar of København.",
  },

  // ─── SOUTHERN SWEDEN ─────────────────────────────────────────────────────
  {
    slug: "malmo-cigarr-tobakshandel",
    name: "Malmö Cigarr & Tobakshandel",
    type: "retailer",
    city: "Malmö",
    country: "Sweden",
    address: "Gustav Adolfs Torg 41, 211 39 Malmö",
    lat: 55.6035,
    lng: 13.0009,
    website: "https://www.facebook.com/MalmoCigarrTobakshandel/",
    note: "Small shop, big depth. The cigar specialist for southern Sweden — walk-in humidor on Gustav Adolfs Torg, the destination for serious Skåne smokers.",
  },

  // ─── ASIA ───────────────────────────────────────────────────────────────
  {
    slug: "casa-habano-hongkong",
    name: "La Casa del Habano Hong Kong",
    type: "casadelhabano",
    city: "Hong Kong",
    country: "Hong Kong",
    address: "Pacific Place, 88 Queensway, Admiralty",
    lat: 22.2783,
    lng: 114.1660,
    website: "https://www.habanos.com/",
    note: "Hong Kong's flagship LCDH inside Pacific Place mall. The closest you get to Havana on the Pacific Rim.",
  },
  {
    slug: "regalia-tokyo",
    name: "Casa Fuente Tokyo (Imperial Hotel)",
    type: "lounge",
    city: "Tokyo",
    country: "Japan",
    address: "1-1-1 Uchisaiwai-cho, Chiyoda-ku, Tokyo",
    lat: 35.6716,
    lng: 139.7591,
    note: "Imperial Hotel's smoking salon. Smoking permitted indoors, curated selection from Arturo Fuente and Davidoff.",
  },
];

/**
 * Haversine distance in km between two lat/lng pairs.
 * Used to sort places by proximity to the user's location.
 */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}
