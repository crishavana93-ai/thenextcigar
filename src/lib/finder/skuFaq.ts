/**
 * Builds the FAQ items used on /finder/sku/[sku] pages.
 *
 * Lives in its own .ts file (not inline in the .astro frontmatter) because
 * esbuild's Astro-frontmatter parser would intermittently fail on the
 * nested template literals + HTML strings + apostrophes used here. Plain
 * .ts files go through the full TypeScript pipeline cleanly.
 */

import type { Sku, PriceSnapshot, Retailer, Country } from "../../data/finder-live";

type BestOffer = {
  snap: PriceSnapshot;
  retailer: Retailer;
  country: Country;
  eur: number;
} | undefined;

export interface SkuFaqInput {
  sku: Sku;
  best: BestOffer;
  offersCount: number;
  sameBrandSkus: Sku[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export function buildSkuFaq(input: SkuFaqInput): FaqItem[] {
  const { sku, best, offersCount, sameBrandSkus } = input;

  const cheapestCountry  = best ? best.country.name : "Germany";
  const cheapestRetailer = best ? best.retailer.name : "Noblego";
  const cheapestEur      = best ? Math.round(best.eur) : null;

  const sameBrandLinks = sameBrandSkus
    .map((s) => "<a href=\"/finder/sku/" + s.slug + "/\">" + s.brand + " " + s.vitola + "</a>")
    .join(", ");

  // Build the "cheapest place" answer separately so the template literal
  // doesn't get too deeply nested for the Astro parser to like.
  const cheapestAnswer = cheapestEur
    ? buildCheapestAnswer(sku, cheapestRetailer, cheapestCountry, cheapestEur, offersCount)
    : "<p>We are tracking " + offersCount + " European retailers that list " + sku.brand + " " + sku.vitola + ". Stock is moving — refresh this page or save it to your watchlist to be alerted when any retailer restocks at a competitive price.</p>";

  const editorialIntro = sku.editorial.split("\n\n")[0];

  const spec = sku.shape + ", ring " + sku.ring + ", " + sku.lengthMm + " mm, " + sku.strength.replace("_", " ") + " strength, sold in a box of " + sku.boxSize;
  const compareAnswer = sameBrandLinks.length > 0
    ? "<p>" + sku.brand + " " + sku.vitola + " is a " + spec + ". The other " + sku.brand + " vitolas on the board, each with its own price page, are " + sameBrandLinks + ". Per-cigar price is the fair way to compare them: box sizes differ.</p>"
    : "<p>" + sku.brand + " " + sku.vitola + " is a " + spec + ".</p>";

  const dutyAnswer =
    "<p>Only if you live where the retailer is. Every price on this page is " +
    "<strong>all-in (excise duty + VAT included) in the retailer's home country</strong> " +
    "and nowhere else. Buy from a German retailer to a German address and what you see is what you pay. " +
    "Buy across a border — a Swiss retailer shipping into the EU, or any EU retailer shipping to the UK, " +
    "Sweden, Denmark, Finland or Ireland — and the destination country charges its own tobacco excise " +
    "and VAT on arrival. How much depends on the destination's excise rate; our " +
    "<a href=\"/blog/cuban-cigar-import-duty-germany-switzerland-uk-explained-2026/\">import-duty guide</a> walks through the main markets.</p>" +
    "<p>The few retailers whose price is all-in beyond their home market carry a \"duty paid EU\" mark in the table.</p>";

  const dropAnswer =
    "<p>Habanos S.A. (the Cuban state tobacco monopoly) sets the worldwide " +
    "release-price floor for every Habano in this catalogue. That floor went up " +
    "roughly 40% during the 2022–2024 global price harmonisation, and Habanos " +
    "has signalled further annual increases through 2027. So the long-term trend is up, not down.</p>" +
    "<p>Short-term, prices move at the retailer level — promotions, clearance, a restock at a different price. " +
    "Where we have a history, the 90-day line on this page shows what the cheapest box in Europe has actually done. A price alert with no target " +
    "emails you on any drop; setting a target limits it to your budget.</p>";

  return [
    {
      q: "Where is the cheapest place to buy " + sku.brand + " " + sku.vitola + " in Europe right now?",
      a: cheapestAnswer,
    },
    {
      q: "Will the listed price include duty + VAT for my country?",
      a: dutyAnswer,
    },
    {
      q: "How does " + sku.brand + " " + sku.vitola + " compare to other " + sku.brand + " cigars?",
      a: compareAnswer,
    },
    {
      q: "Is the price for " + sku.brand + " " + sku.vitola + " likely to drop?",
      a: dropAnswer,
    },
  ];
}

function buildCheapestAnswer(
  sku: Sku,
  retailer: string,
  country: string,
  eur: number,
  offersCount: number,
): string {
  const perCigar = (eur / sku.boxSize).toFixed(2);
  return (
    "<p>The cheapest verified box of " + sku.brand + " " + sku.vitola +
    " in Europe right now is at <strong>" + retailer + "</strong> in " + country +
    " at approximately <strong>€" + eur.toLocaleString("en-US") + "</strong> for a box of " +
    sku.boxSize + " (about €" + perCigar + " per cigar). All " + offersCount + " retailers we track for this vitola are in the table above, " +
    "each with the date its price was read: rows marked live were re-read by our scraper within the last fortnight, the rest were checked by hand.</p>" +
    "<p>Prices and stock move. Save a price alert and we email you when any retailer drops below your target " +
    "or the box comes back in stock.</p>"
  );
}
