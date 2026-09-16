/** Quantity discount, shared by the checkout function (what is charged) and
 *  the product page (what is shown). Keep the two in one place. */
export const TIERS: { min: number; pct: number }[] = [
  { min: 3, pct: 15 },
  { min: 2, pct: 10 },
];
export function discountPct(qty: number): number {
  for (const t of TIERS) if (qty >= t.min) return t.pct;
  return 0;
}
/** Unit price after the quantity discount, in whole cents. */
export function unitCents(price: number, qty: number): number {
  const cents = Math.round(Number(price) * 100);
  return Math.round(cents * (100 - discountPct(qty)) / 100);
}
