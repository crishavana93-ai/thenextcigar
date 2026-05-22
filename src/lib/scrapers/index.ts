// Parser registry — register a new retailer here once you've written its module.
import type { RetailerParser } from "./types.ts";
import { noblegoParser } from "./retailers/noblego.ts";
import { cigarworldParser } from "./retailers/cigarworld.ts";

export const PARSERS: Record<string, RetailerParser> = {
  [noblegoParser.retailerId]:    noblegoParser,
  [cigarworldParser.retailerId]: cigarworldParser,
  // Add more here as we expand: vabajo, selected-cigars, casabenden, etc.
};

export function getParser(retailerId: string): RetailerParser | undefined {
  return PARSERS[retailerId];
}

export function listParsers(): RetailerParser[] {
  return Object.values(PARSERS);
}

export { parseSchemaOrgPage } from "./schema-org.ts";
export { matchCanonicalSku, extractPackSize } from "./sku-matcher.ts";
export type { ScrapedOffer, ScrapeResult, RetailerParser } from "./types.ts";
