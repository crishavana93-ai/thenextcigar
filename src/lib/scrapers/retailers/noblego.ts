// Noblego.de — Germany's #2 Cuban-cigar retailer by traffic. Magento 2 stack
// with schema.org Product JSON-LD on every PDP. Reference parser for the
// "schema_org_jsonld" stack family (covers ~70% of EU scrape targets).

import type { RetailerParser } from "../types.ts";
import { parseSchemaOrgPage } from "../schema-org.ts";

export const noblegoParser: RetailerParser = {
  retailerId: "de-noblego",
  baseUrl: "https://www.noblego.de",
  stack: "schema_org_jsonld",
  startUrls: [
    "https://www.noblego.de/kubanische-zigarren/",
    "https://www.noblego.de/cohiba/",
    "https://www.noblego.de/montecristo/",
    "https://www.noblego.de/partagas/",
    "https://www.noblego.de/romeo-y-julieta/",
    "https://www.noblego.de/hoyo-de-monterrey/",
    "https://www.noblego.de/trinidad/",
    "https://www.noblego.de/bolivar/",
  ],
  parse(html, url) {
    return parseSchemaOrgPage(html, url);
  },
};
