// ============================================================================
// Landed cost — what a box actually costs at the door
// ============================================================================
// Pure functions, browser-safe. Used by the SKU page's destination picker.
//
// Model (stated on the page in plain words):
//   base     = listed price, minus the retailer's VAT when the parcel leaves
//              its customs territory (exports are zero-rated), left as listed
//              inside the EU (distance sellers rarely deduct it)
//   customs  = base × customs rate, when the parcel crosses a customs border
//   excise   = destination excise on the box — specific part by piece / kg /
//              gram (weight estimated from the vitola's dimensions) plus the
//              ad valorem part on the price paid, never less than the floor
//   VAT      = destination VAT on base + customs + excise
//   landed   = base + customs + excise + VAT
// Carrier handling fees are not included: they vary by carrier and are shown
// to the reader as a caveat, not a number.
// ============================================================================

import type { CountryCode, Currency } from "../../data/finder-data";
import { CZK_TO_EUR, rateFor, type DutyRate, type DutyUnit } from "../../data/duty-rates";

export interface LandedInput {
  price: number;
  currency: Currency;
  fromCountry: CountryCode;
  toCountry: CountryCode;
  boxSize: number;
  ring: number;       // 64ths of an inch
  lengthMm: number;
  fx: Record<Currency, number>; // to EUR
}

export interface LandedLine { label: string; eur: number; note?: string }
export interface LandedResult {
  sameCountry: boolean;
  baseEur: number;
  lines: LandedLine[];
  totalEur: number;
  perCigarEur: number;
  gramsPerCigar: number;
  rate: DutyRate;
  caveats: string[];
}

/** Rough weight of a hand-made cigar from its dimensions. A robusto (50 × 124 mm)
 *  comes out at ~12 g, which is what one weighs. */
export function estimateGrams(ring: number, lengthMm: number): number {
  const rCm = (ring / 64) * 2.54 / 2;
  const volCm3 = Math.PI * rCm * rCm * (lengthMm / 10);
  return Math.round(volCm3 * 0.33 * 10) / 10;
}

function toEur(amount: number, cur: Currency | "CZK", fx: Record<Currency, number>): number {
  return cur === "CZK" ? amount * CZK_TO_EUR : amount * fx[cur];
}

function quantity(unit: DutyUnit, n: number, grams: number): number {
  switch (unit) {
    case "per_piece": return n;
    case "per_1000": return n / 1000;
    case "per_kg": return (n * grams) / 1000;
    case "per_gram": return n * grams;
  }
}

export function landedCost(i: LandedInput): LandedResult {
  const to = rateFor(i.toCountry);
  const from = rateFor(i.fromCountry);
  const grams = estimateGrams(i.ring, i.lengthMm);
  const listedEur = i.price * i.fx[i.currency];
  const caveats: string[] = [];

  if (i.fromCountry === i.toCountry) {
    return { sameCountry: true, baseEur: listedEur, lines: [], totalEur: listedEur, perCigarEur: listedEur / i.boxSize, gramsPerCigar: grams, rate: to, caveats };
  }

  const crossesCustoms = from.union !== to.union;
  // Exports leave the origin VAT behind; intra-EU distance sales usually don't.
  const baseEur = crossesCustoms ? listedEur / (1 + from.vatPct / 100) : listedEur;
  const lines: LandedLine[] = [];

  let customsEur = 0;
  if (crossesCustoms) {
    const pct = to.customs.outsideUnion;
    if (pct > 0) { customsEur = baseEur * (pct / 100); lines.push({ label: `Customs duty ${pct}%`, eur: customsEur }); }
    if (to.customs.note) caveats.push(to.customs.note);
  }

  // Excise: specific + ad valorem, floored at the minimum.
  let exciseEur = 0;
  const parts: string[] = [];
  if (to.specific) {
    exciseEur += toEur(to.specific.amount * quantity(to.specific.unit, i.boxSize, grams), to.currency, i.fx);
    parts.push(to.specific.unit === "per_kg" || to.specific.unit === "per_gram" ? "by weight" : "per cigar");
  }
  if (to.adValoremPct) {
    exciseEur += baseEur * (to.adValoremPct / 100);
    parts.push(`${to.adValoremPct}% of price`);
  }
  if (to.minimum) {
    const floor = toEur(to.minimum.amount * quantity(to.minimum.unit, i.boxSize, grams), to.currency, i.fx);
    if (floor > exciseEur) { exciseEur = floor; parts.push("at the minimum"); }
  }
  lines.push({ label: `Excise (${parts.join(" + ") || "none"})`, eur: exciseEur, note: to.note });

  const vatEur = (baseEur + customsEur + exciseEur) * (to.vatPct / 100);
  lines.push({ label: `VAT ${to.vatPct}%`, eur: vatEur });

  if (crossesCustoms) caveats.push("Carrier customs-handling fees are not included; they are set by the carrier, not the state.");
  if (to.confidence !== "official") caveats.push("The destination rate was read from a secondary copy of the official text.");

  const totalEur = baseEur + customsEur + exciseEur + vatEur;
  return { sameCountry: false, baseEur, lines, totalEur, perCigarEur: totalEur / i.boxSize, gramsPerCigar: grams, rate: to, caveats };
}
