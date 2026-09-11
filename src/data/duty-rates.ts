// ============================================================================
// Landed-cost table — what a box of cigars picks up when it crosses a border
// ============================================================================
// Researched 11 September 2026 from official sources (linked per row). Every
// figure carries a confidence level; rows marked "secondary" were read from a
// mirror of the official text, rows marked "unconfirmed" are shown to the
// reader as such. Browser-safe: no imports beyond types.
//
// Re-check dates: Finland indexes twice a year (1 Jan / 1 Jul), Sweden,
// Norway, Czechia, Austria and the UK once a year; the UK rate rises to
// £508.12/kg on 1 October 2026 (already scheduled — see UK row).
// ============================================================================

import type { CountryCode, Currency } from "./finder-data";

export type DutyUnit = "per_piece" | "per_1000" | "per_kg" | "per_gram";

export interface DutyRate {
  code: CountryCode;
  /** Currency the excise is denominated in. CZK is not a Finder currency, so
   *  Czech rates are converted with the rate in CZK_TO_EUR below. */
  currency: Currency | "CZK";
  /** Specific (per-quantity) excise component. */
  specific?: { amount: number; unit: DutyUnit };
  /** Ad valorem excise as a % of the retail selling price (tax-inclusive). */
  adValoremPct?: number;
  /** Minimum excise floor. */
  minimum?: { amount: number; unit: DutyUnit; note?: string };
  vatPct: number;
  /** Customs duty on cigars (CN 2402 10 00) arriving from outside this
   *  country's customs territory. EU members: 26% from outside the EU, nothing
   *  inside it. UK: 25% for goods not of EU origin — Cuban cigars never are. */
  customs: { insideUnion: number; outsideUnion: number; note?: string };
  /** Which customs territory this country belongs to. */
  union: "EU" | "UK" | "CH" | "NO";
  effective: string;
  confidence: "official" | "secondary" | "unconfirmed";
  source: { title: string; url: string };
  note?: string;
  /** A rate change that is already law but not yet in force. Written here once,
   *  with the date it starts, so the table changes itself on the day instead of
   *  waiting for somebody to remember. rateFor() folds it in. */
  scheduled?: {
    from: string;
    specific?: { amount: number; unit: DutyUnit };
    adValoremPct?: number;
    minimum?: { amount: number; unit: DutyUnit; note?: string };
    vatPct?: number;
    note?: string;
  };
}

export const CZK_TO_EUR = 0.0405; // September 2026 reference; excise only

export const EU_CUSTOMS_PCT = 26; // TARIC 2402 10 00, ERGA OMNES, R2204/99 — read 11 Sep 2026
export const EU_CUSTOMS_SOURCE = { title: "TARIC — 2402 10 00 third country duty", url: "https://ec.europa.eu/taxation_customs/dds2/taric/measures.jsp?Lang=en&Taric=2402100000" };

const EU = { insideUnion: 0, outsideUnion: EU_CUSTOMS_PCT };

export const DUTY_RATES: Record<CountryCode, DutyRate> = {
  de: { code: "de", currency: "EUR", union: "EU", vatPct: 19, customs: EU,
    specific: { amount: 0.014, unit: "per_piece" }, adValoremPct: 1.47,
    minimum: { amount: 0.07504, unit: "per_piece", note: "minimum is net of VAT" },
    effective: "2023-01-01", confidence: "official",
    source: { title: "Zoll — Tabaksteuer, Steuerhöhe Zigarren/Zigarillos", url: "https://www.zoll.de/DE/Fachthemen/Steuern/Verbrauchsteuern/Alkohol-Tabakwaren-Kaffee/Steuerhoehe-Besonderheiten-kleine-Erzeuger/Tabak/tabak_node.html" } },
  ch: { code: "ch", currency: "CHF", union: "CH", vatPct: 8.1,
    customs: { insideUnion: 0, outsideUnion: 0, note: "Swiss customs duty on cigars (Tares 2402.1000, CHF per 100 kg) is not included — it could not be read from an official page." },
    specific: { amount: 0.0076, unit: "per_piece" }, adValoremPct: 1,
    effective: "2026-03-01", confidence: "official",
    source: { title: "BAZG — Tabaksteuer (Stand 01.03.2026)", url: "https://www.bazg.admin.ch/dam/de/sd-web/GljEzThGISer/Tabaksteuer.pdf" } },
  it: { code: "it", currency: "EUR", union: "EU", vatPct: 22, customs: EU,
    adValoremPct: 23.5, minimum: { amount: 35, unit: "per_kg", note: "conventional weight: 200 cigars = 1 kg" },
    effective: "2026-07-30", confidence: "official",
    source: { title: "Camera dei Deputati — Accise sui tabacchi lavorati (aggiornato 30 luglio 2026)", url: "https://temi.camera.it/leg19/temi/19_tl18_accise.html" } },
  es: { code: "es", currency: "EUR", union: "EU", vatPct: 21, customs: EU,
    adValoremPct: 15.8, minimum: { amount: 47, unit: "per_1000" },
    effective: "2025-01-01", confidence: "secondary",
    source: { title: "Ley 38/1992 de Impuestos Especiales, art. 60 (as amended by Ley 7/2024)", url: "https://www.boe.es/buscar/act.php?id=BOE-A-1992-28741" } },
  se: { code: "se", currency: "SEK", union: "EU", vatPct: 25, customs: EU,
    specific: { amount: 1.83, unit: "per_piece" },
    effective: "2026-01-01", confidence: "official",
    source: { title: "Skatteverket — Skattesatser för tobak", url: "https://www.skatteverket.se/foretag/skatterochavdrag/punktskatter/tobaksskatt/skattesatserfortobak.4.46ae6b26141980f1e2d4664.html" } },
  uk: { code: "uk", currency: "GBP", union: "UK", vatPct: 20,
    customs: { insideUnion: 0, outsideUnion: 25, note: "UK Global Tariff 2402100000: 25% third-country duty. The EU preference (0%) applies only to goods of EU origin; Cuban cigars shipped from an EU retailer do not qualify." },
    specific: { amount: 440.93, unit: "per_kg" },
    effective: "2025-11-26", confidence: "official",
    scheduled: { from: "2026-10-01", specific: { amount: 508.12, unit: "per_kg" },
      note: "Rate set in the same GOV.UK publication as the November 2025 rise." },
    source: { title: "GOV.UK — Changes to tobacco duty rates from 26 November 2025 and 1 October 2026", url: "https://www.gov.uk/government/publications/tobacco-duty-rate-changes/changes-to-tobacco-duty-rates-from-26-november-2025-and-1-october-2026" } },
  nl: { code: "nl", currency: "EUR", union: "EU", vatPct: 21, customs: EU,
    adValoremPct: 11,
    effective: "2024-04-01", confidence: "official",
    source: { title: "Douane — Tarievenlijst accijns en verbruiksbelasting (1 april 2026)", url: "https://www.douane.nl/wp-content/uploads/2026/03/Tarievenlijst-accijns-en-verbruiksbelasting.pdf" } },
  be: { code: "be", currency: "EUR", union: "EU", vatPct: 21, customs: EU,
    adValoremPct: 5, minimum: { amount: 0.1241, unit: "per_piece" },
    effective: "2025-01-01", confidence: "secondary",
    source: { title: "FOD Financiën — Circulaire 2025/C/1, accijnstarieven tabaksfabricaten", url: "https://financien.belgium.be/nl/douane_accijnzen/ondernemingen/accijnzen/algemene_informatie/accijnstarieven" } },
  at: { code: "at", currency: "EUR", union: "EU", vatPct: 20, customs: EU,
    adValoremPct: 13, minimum: { amount: 120, unit: "per_1000" },
    effective: "2026-02-01", confidence: "official",
    source: { title: "Tabaksteuergesetz 2022 § 4 (RIS)", url: "https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10004877" } },
  dk: { code: "dk", currency: "DKK", union: "EU", vatPct: 25, customs: EU,
    specific: { amount: 1.1851, unit: "per_piece" }, adValoremPct: 10,
    minimum: { amount: 2.279, unit: "per_piece", note: "floor applies to excise plus VAT together" },
    effective: "2026-01-01", confidence: "official",
    source: { title: "Skattestyrelsen — Den juridiske vejledning E.A.10.2.5", url: "https://tax.dk/jv/ea/E_A_10_2_5.htm" } },
  fi: { code: "fi", currency: "EUR", union: "EU", vatPct: 25.5, customs: EU,
    specific: { amount: 0.1674, unit: "per_piece" }, adValoremPct: 34, minimum: { amount: 0.4256, unit: "per_piece" },
    effective: "2026-07-01", confidence: "official",
    note: "Finland re-indexes tobacco excise each 1 January; check Vero's table after the turn of the year.",
    source: { title: "Vero — Excise duty table for tobacco", url: "https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/excise-taxation/excise-duty-on-tobacco/excise-duty-table-for-tobacco/" } },
  pt: { code: "pt", currency: "EUR", union: "EU", vatPct: 23, customs: EU,
    adValoremPct: 25,
    effective: "2013-01-01", confidence: "secondary",
    note: "Whether a minimum floor applies could not be confirmed from the CIEC text; none is applied here.",
    source: { title: "Código dos IEC, art. 104.º (charutos e cigarrilhas)", url: "https://informador.pt/legislacao/lexit/codigos/direito-fiscal/codigo-dos-impostos-especiais-de-consumo/parte-ii-parte-especial/capitulo-iii-imposto-sobre-o-tabaco/artigo-104-o-charutos-e-cigarrilhas/" } },
  ie: { code: "ie", currency: "EUR", union: "EU", vatPct: 23, customs: EU,
    specific: { amount: 541.758, unit: "per_kg" },
    effective: "2025-10-08", confidence: "official",
    source: { title: "Revenue — Excise duty rates, Tobacco Products Tax", url: "https://www.revenue.ie/en/companies-and-charities/excise-and-licences/excise-duty-rates/tpt-ept.aspx" } },
  gr: { code: "gr", currency: "EUR", union: "EU", vatPct: 24, customs: EU,
    adValoremPct: 35,
    effective: "2026-04-03", confidence: "official",
    source: { title: "AADE — Συχνές ερωτήσεις, βιομηχανοποιημένα καπνά", url: "https://www.aade.gr/sites/default/files/2026-07/viomixanopoiimena_kapna.pdf" } },
  cz: { code: "cz", currency: "CZK", union: "EU", vatPct: 21, customs: EU,
    specific: { amount: 2.78, unit: "per_piece" },
    effective: "2026-01-01", confidence: "secondary",
    source: { title: "Zákon č. 353/2003 Sb. — sazby 2026 (via PKF Apogeo)", url: "https://www.pkfapogeo.cz/en/blog/7844/novinky-ve-spotrebni-dani-od-roku-2026-zmeny-u-tabakovych-a-nikotinovych-vyrobku-i-lihu" } },
  no: { code: "no", currency: "NOK", union: "NO", vatPct: 25,
    customs: { insideUnion: 0, outsideUnion: 0, note: "Cigars are outside the EEA agreement, so Norway's own tariff applies; its rate for 2402.1000 could not be read from an official page and is not included." },
    specific: { amount: 3.31, unit: "per_gram" },
    effective: "2026-01-01", confidence: "official",
    source: { title: "Regjeringen — Avgiftssatser 2026", url: "https://www.regjeringen.no/no/tema/okonomi-og-budsjett/skatter-og-avgifter/skatte-og-avgiftssatser/avgiftssatser-2026/id3121982/" } },
  fr: { code: "fr", currency: "EUR", union: "EU", vatPct: 20, customs: EU,
    specific: { amount: 56.2, unit: "per_1000" }, adValoremPct: 36.3, minimum: { amount: 305, unit: "per_1000" },
    effective: "2026-01-01", confidence: "official",
    source: { title: "Douane — Fiscalité appliquée aux tabacs manufacturés", url: "https://www.douane.gouv.fr/fiche/la-fiscalite-appliquee-aux-tabacs-manufactures-et-la-composition-du-prix-de-vente-au-detail" } },
  lu: { code: "lu", currency: "EUR", union: "EU", vatPct: 17, customs: EU,
    adValoremPct: 10, minimum: { amount: 23.5, unit: "per_1000" },
    effective: "2026-01-01", confidence: "official",
    source: { title: "Douanes Luxembourg — Taux d'accises 2026", url: "https://douanes.public.lu/content/dam/douanes/fr/accises/taux-accises-lu-01012026.pdf" } },
};

/**
 * The rate in force on a given day.
 *
 * A published-but-not-yet-live change lives on the rate as `scheduled`; this
 * folds it in once its date has passed, so a page built on 1 October quotes the
 * new figure without anyone editing the table. Only the fields the change names
 * are replaced — a VAT change does not silently reset the excise.
 */
export function rateFor(code: CountryCode, on: Date = new Date()): DutyRate {
  const base = DUTY_RATES[code];
  if (!base?.scheduled) return base;
  const { from, note, ...fields } = base.scheduled;
  if (on < new Date(from + "T00:00:00Z")) return base;
  const next: DutyRate = { ...base, ...fields, effective: from };
  next.note = note ?? base.note;
  delete next.scheduled;
  return next;
}
