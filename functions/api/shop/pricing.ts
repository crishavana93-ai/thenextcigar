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

// All charges are in USD, the list currency. Local-currency conversion was
// removed 17 Sept 2026; the customer's bank converts.
