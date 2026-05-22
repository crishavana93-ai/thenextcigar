// Cigarworld.de — Europe's #1 Cuban-cigar retailer by revenue. Shopware 6 stack.
// Same schema.org Product JSON-LD pattern as Noblego.

import type { RetailerParser } from "../types.ts";
import { parseSchemaOrgPage } from "../schema-org.ts";

export const cigarworldParser: RetailerParser = {
  retailerId: "de-cigarworld",
  baseUrl: "https://www.cigarworld.de",
  stack: "schema_org_jsonld",
  startUrls: [
    "https://www.cigarworld.de/zigarren/kuba/",
    "https://www.cigarworld.de/zigarren/kuba/cohiba/",
    "https://www.cigarworld.de/zigarren/kuba/montecristo/",
    "https://www.cigarworld.de/zigarren/kuba/partagas/",
    "https://www.cigarworld.de/zigarren/kuba/romeo-y-julieta/",
    "https://www.cigarworld.de/zigarren/kuba/hoyo-de-monterrey/",
    "https://www.cigarworld.de/zigarren/kuba/trinidad/",
    "https://www.cigarworld.de/zigarren/kuba/bolivar/",
  ],
  parse(html, url) {
    return parseSchemaOrgPage(html, url);
  },
};
