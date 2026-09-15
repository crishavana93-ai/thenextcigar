/**
 * Reference rates for showing a USD shop price in the reader's money.
 * Fetched once per build from the ECB via frankfurter.app (no key, no
 * tracking). The shop settles in USD through Stripe; these are for the
 * reader's sense of scale only and the page says so. If the fetch fails the
 * page simply shows USD, which is what it showed before.
 */
export interface UsdRates { date: string; rates: Record<string, number> }

let cached: UsdRates | null | undefined;

export async function usdRates(): Promise<UsdRates | null> {
  if (cached !== undefined) return cached;
  try {
    const r = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,SEK,GBP,CHF", { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(String(r.status));
    const j = (await r.json()) as { date: string; rates: Record<string, number> };
    cached = { date: j.date, rates: j.rates };
  } catch {
    cached = null;
  }
  return cached;
}

/** "about €68 · SEK 730 · £58" for a USD amount, or "" when rates are absent. */
export function approx(usd: number, fx: UsdRates | null): string {
  if (!fx) return "";
  const f = (n: number) => Math.round(n).toLocaleString("en-GB");
  const parts: string[] = [];
  if (fx.rates.EUR) parts.push(`€${f(usd * fx.rates.EUR)}`);
  if (fx.rates.SEK) parts.push(`SEK ${f(usd * fx.rates.SEK)}`);
  if (fx.rates.GBP) parts.push(`£${f(usd * fx.rates.GBP)}`);
  return parts.join(" · ");
}
