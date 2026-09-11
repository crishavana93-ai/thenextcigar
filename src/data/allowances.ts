// ============================================================================
// Traveller's allowance — carrying cigars home
// ============================================================================
// Researched 11 September 2026 from the customs authorities cited per row.
// Two regimes that people constantly confuse:
//   • From OUTSIDE a customs territory (flying home from Cuba, Switzerland,
//     the UK): a hard duty-free allowance. In the EU it is a CHOICE between
//     tobacco types, not a sum of them.
//   • From INSIDE the EU: no legal cap at all for personal use — only an
//     indicative guide level above which you may be asked to show the cigars
//     are for you.
// ============================================================================

export interface Allowance {
  code: string;
  name: string;
  /** Duty-free limit arriving from outside this customs territory. */
  duty_free: { cigars: number | null; unit: "cigars" | "grams"; basis: string; minAge: number; reduced?: string };
  /** Intra-EU indicative guide level (null where the concept doesn't apply). */
  guide: { cigars: number | null; note: string };
  over: { basis: "flat" | "full"; figures: string };
  quirk?: string;
  source: { title: string; url: string };
  confidence: "official" | "secondary";
}

export const ALLOWANCES: Allowance[] = [
  {
    code: "eu", name: "The EU (most countries)",
    duty_free: { cigars: 50, unit: "cigars", basis: "50 cigars, OR 100 cigarillos, OR 200 cigarettes, OR 250 g of other tobacco — or a proportional mix of them. Not one of each.", minAge: 17,
      reduced: "Arriving by land or private boat, ten member states (BG, HR, EE, EL, HU, LV, LT, PL, RO, SK) may apply a lower allowance of 10 cigars; Estonia and Romania may apply it to every arrival, air included." },
    guide: { cigars: 200, note: "Coming from another EU country with duty already paid there is no legal limit for your own use. 200 cigars is the EU-wide indicative level: above it, customs may ask you to show the cigars are for you and not for resale. A member state cannot set it lower." },
    over: { basis: "full", figures: "The destination's cigar excise plus its VAT on the lot. There is no EU-wide flat traveller rate." },
    quirk: "The €430 (air and sea) / €300 (land) value limit is for other shopping. It does not restrict tobacco, and tobacco does not eat into it.",
    source: { title: "European Commission — carrying alcohol and tobacco", url: "https://europa.eu/youreurope/citizens/travel/carry/alcohol-tobacco-cash/index_en.htm" },
    confidence: "official",
  },
  {
    code: "fi", name: "Finland",
    duty_free: { cigars: 50, unit: "cigars", basis: "The standard EU choice: 50 cigars, or 100 cigarillos, or 200 cigarettes, or 250 g.", minAge: 18 },
    guide: { cigars: 50, note: "Finnish customs give 50 cigars as their reference figure for personal use even from inside the EU — unusually specific, and lower than the EU's 200. Worth knowing before you fill a case in Germany." },
    over: { basis: "full", figures: "Finnish excise (€0.1674 per cigar plus 34% of price, minimum €0.4256 per cigar) plus 25.5% VAT." },
    quirk: "Finland bans private individuals from receiving tobacco by post from abroad outright — any quantity, duty paid or not. You may carry 50 cigars home in your case; you may not have the same shop mail them.",
    source: { title: "Tulli — traveller imports of tobacco", url: "https://tulli.fi/en/restrictions/tobacco/traveller-imports" },
    confidence: "official",
  },
  {
    code: "uk", name: "United Kingdom",
    duty_free: { cigars: 50, unit: "cigars", basis: "50 cigars, or 100 cigarillos, or 200 cigarettes, or 250 g — or a proportional mix. The same whether you're arriving from the EU or anywhere else, and the same by air, rail or sea.", minAge: 17 },
    guide: { cigars: null, note: "There is no separate intra-EU allowance any more. Arrivals from the EU use the allowance above." },
    over: { basis: "full", figures: "£440.93 per kg of cigars (£508.12 from 1 October 2026), plus 25% customs duty where the cigars aren't of EU origin — Cuban cigars never are — plus 20% VAT on the total." },
    quirk: "Go one cigar over and HMRC charges duty on the whole lot, not on the excess. Fifty-one cigars means duty on fifty-one.",
    source: { title: "GOV.UK — bringing goods into the UK for personal use", url: "https://www.gov.uk/bringing-goods-into-uk-personal-use/arriving-in-Great-Britain" },
    confidence: "official",
  },
  {
    code: "ch", name: "Switzerland",
    duty_free: { cigars: 250, unit: "cigars", basis: "One combined allowance of 250 units or grams across all tobacco — so 250 cigars only if you carry nothing else. Per person, per day.", minAge: 17 },
    guide: { cigars: null, note: "Switzerland is outside the EU customs union, so every arrival — including from an EU country — uses the allowance above." },
    over: { basis: "full", figures: "Swiss tobacco tax of CHF 0.76 per cigar plus 1% of the retail price, customs duty on weight, and 8.1% VAT." },
    quirk: "The most generous allowance in Europe by a distance. Separately, the duty-free limit for ordinary shopping was cut from CHF 300 to CHF 150 a day on 1 January 2025 — that doesn't touch the tobacco allowance, but it catches people out.",
    source: { title: "BAZG — duty-free allowances", url: "https://www.bazg.admin.ch/bazg/en/home/information-individuals/travel-and-purchases--allowances-and-duty-free-limit/importation-into-switzerland/duty-free-allowances--foodstuffs--alcohol-and-tobacco.html" },
    confidence: "secondary",
  },
  {
    code: "no", name: "Norway",
    duty_free: { cigars: null, unit: "grams", basis: "250 g of tobacco other than cigarettes — cigars are weighed, not counted. A robusto is around 12 g, so roughly twenty cigars.", minAge: 18 },
    guide: { cigars: null, note: "Norway is outside the EU; every arrival uses the quota above, and it is a real cap, not a guide." },
    over: { basis: "flat", figures: "NOK 388 per 100 g under the simplified declaration — payable in the customs app or the red channel." },
    quirk: "The only country here that weighs cigars instead of counting them, and the only one where the tobacco quota is exempt from the general value limit.",
    source: { title: "Tolletaten — alcohol and tobacco quotas", url: "https://www.toll.no/en/goods/alcohol-and-tobacco/quotas" },
    confidence: "official",
  },
];

/** Leaving Cuba. */
export const CUBA_EXPORT = {
  tiers: [
    { limit: "Up to 20 loose cigars", need: "Nothing. No box, no receipt." },
    { limit: "Up to 50 cigars", need: "In their original sealed boxes with the holographic warranty seal. No receipt needed." },
    { limit: "More than 50", need: "An official invoice from an authorised Habanos shop — a state cigar shop, not a doorman — with the cigars in sealed, sealed-seal boxes. With the paperwork there is no stated ceiling." },
  ],
  note: "Cigars bought in pesos from an ordinary Cuban shop aren't part of this — the rules cover the Habanos export brands. Raw leaf may not be exported at all. Since 2024 every traveller also files the D'Viajeros declaration online within 48 hours of the flight and shows its QR code at the airport; what you're carrying is meant to be on it. Get it wrong and customs confiscate.",
  confidence: "secondary",
  source: { title: "Habanos S.A. — Cuban customs resolution", url: "https://www.habanos.com/en/news/nueva-resolucion-de-la-aduana-de-cuba-en/" },
};
