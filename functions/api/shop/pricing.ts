/** Quantity discount on the ORDER TOTAL, shared by the checkout function
 *  (what is charged, as one Stripe discount line) and the pages (what is
 *  shown). Counted in pieces across the whole cart. */
export const TIERS: { min: number; pct: number }[] = [
  { min: 4, pct: 15 },
  { min: 2, pct: 10 },
];
export function discountPct(pieces: number): number {
  for (const t of TIERS) if (pieces >= t.min) return t.pct;
  return 0;
}
export const TIER_LINE = "Two or three pieces: 10% off the total. Four or more: 15% off.";

/** Local-currency checkout. Shop prices are set in USD; at checkout the
 *  customer is charged in their currency at these fixed rates, reviewed by
 *  hand (last review 16 Sept 2026, ECB mid-rates rounded in the customer's
 *  favour). Everything else stays in USD. */
export const RATES: Record<string, number> = { EUR: 0.86, GBP: 0.73, SEK: 9.7 };
const EU = new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES"]);
export function currencyFor(country?: string | null): string {
  const c = (country || "").toUpperCase();
  if (c === "SE") return "SEK";
  if (c === "GB") return "GBP";
  if (EU.has(c)) return "EUR";
  return "USD";
}
/** USD list price → charged amount in the smallest unit of `cur`. EUR/GBP
 *  round to the nearest .50, SEK to the nearest 5 kr. */
export function amountIn(usd: number, cur: string): number {
  if (cur === "USD") return Math.round(usd * 100);
  const v = usd * RATES[cur];
  if (cur === "SEK") return Math.round(v / 5) * 5 * 100;
  return Math.round(v * 2) / 2 * 100;
}
