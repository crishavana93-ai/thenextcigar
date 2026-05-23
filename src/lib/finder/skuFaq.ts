/**
 * Builds the FAQ items used on /finder/sku/[sku] pages.
 *
 * Lives in its own .ts file (not inline in the .astro frontmatter) because
 * esbuild's Astro-frontmatter parser would intermittently fail on the
 * nested template literals + HTML strings + apostrophes used here. Plain
 * .ts files go through the full TypeScript pipeline cleanly.
 */

import type { Sku, PriceSnapshot, Retailer, Country } from "../../data/finder-data";

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

  const compareAnswer = sameBrandLinks.length > 0
    ? "<p>" + editorialIntro + "</p><p>If you want a side-by-side comparison of " + sku.brand + " other vitolas at current European prices, the SKUs we track are: " + sameBrandLinks + ". Each link opens its own live price-comparison page.</p>"
    : "<p>" + editorialIntro + "</p>";

  const dutyAnswer =
    "<p>The Duty / Ships column above tells you exactly that. Each retailer listed price is " +
    "<strong>all-in (excise duty + VAT included) only in their home country</strong>. " +
    "Buy from a German retailer as a German buyer: what you see is what you pay. " +
    "Buy cross-border (e.g. a Swiss retailer shipping to Germany, or any EU retailer " +
    "shipping to the UK, Sweden, Denmark, Finland, or Ireland) and the destination " +
    "country will charge its own tobacco excise + VAT at the door — typically " +
    "<strong>€100–€300 extra</strong> on a box of 25 Habanos, sometimes much more for the UK.</p>" +
    "<p>If you set your destination country on the page, every row that is genuinely " +
    "all-in for you gets highlighted in green. The dimmed rows are honest-looking " +
    "prices that will cost more than they show.</p>";

  const dropAnswer =
    "<p>Habanos S.A. (the Cuban state tobacco monopoly) sets the worldwide " +
    "release-price floor for every Habano in this catalogue. That floor went up " +
    "roughly 40% during the 2022–2024 global price harmonisation, and Habanos " +
    "has signalled further annual increases through 2027. So the long-term trend is up, not down.</p>" +
    "<p>Short-term, prices fluctuate at the retailer level — Swiss promotional " +
    "weeks, German LCDH clearance, the occasional Spanish over-stock. The Finder " +
    "catches those. A drop alert with no target price will email you on any " +
    "meaningful reduction; setting a target locks the alert to your specific budget.</p>";

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
    sku.boxSize + " (about €" + perCigar + " per cigar). The full ranking — " +
    "refreshed every six hours across " + offersCount + " European retailers — is in the table above.</p>" +
    "<p>Prices and availability shift weekly. Save this SKU to your watchlist with the " +
    "Save price alert button to get an email the moment any retailer in your country " +
    "drops below your target price.</p>"
  );
}
