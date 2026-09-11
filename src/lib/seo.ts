/**
 * The tools an article should send a reader to.
 *
 * Two problems this solves at once. For the reader, an article about import
 * duty that does not link to the duty calculator is making them do arithmetic
 * we have already done. For search, the Finder and the tools are the pages we
 * most want ranked, and until now 49 of 57 articles linked to neither — all
 * the internal link equity circulated among the articles themselves.
 *
 * The match is on what the piece is actually about, not a block bolted to
 * every page: a post that matches nothing gets the board and nothing else.
 */

export interface ToolLink {
  href: string;
  label: string;
  blurb: string;
}

const TOOLS: Record<string, ToolLink> = {
  board: {
    href: "/finder/",
    label: "The board",
    blurb: "What every box costs today, read from the retailers who publish prices.",
  },
  index: {
    href: "/finder/index/",
    label: "The Habanos Index",
    blurb: "What a Cuban cigar costs in Europe, tracked day by day.",
  },
  allowance: {
    href: "/tools/allowance/",
    label: "Traveller's allowance",
    blurb: "How many you may bring home, and what you owe if you bring more.",
  },
  boxcode: {
    href: "/tools/box-code/",
    label: "Box code decoder",
    blurb: "Read the date on the underside of the box — and what it cannot tell you.",
  },
  tools: {
    href: "/tools/",
    label: "All the tools",
    blurb: "Calculators and decoders for people who buy Cuban cigars.",
  },
};

const RULES: Array<{ test: RegExp; keys: string[] }> = [
  { test: /\b(price|prices|cheapest|cost|costs|spread|where to buy|buy|retailer|market|deal)\b/i,
    keys: ["board", "index"] },
  { test: /\b(duty|tax|excise|vat|customs|import|importing|allowance|travel|travell?ing|airport|border)\b/i,
    keys: ["allowance", "board"] },
  { test: /\b(fake|counterfeit|authentic|genuine|box code|date code|factory code|vintage|collecting|aging|aged)\b/i,
    keys: ["boxcode", "board"] },
  { test: /\b(habanos|cuban|cuba|cohiba|montecristo|partag[áa]s|romeo|hoyo|trinidad|bol[íi]var)\b/i,
    keys: ["board", "index"] },
];

/** Two or three genuinely relevant tools, or just the board. */
export function toolsFor(title: string, category?: string | null, excerpt?: string | null): ToolLink[] {
  const hay = `${title} ${category ?? ""} ${excerpt ?? ""}`;
  const keys: string[] = [];
  for (const r of RULES) {
    if (!r.test.test(hay)) continue;
    for (const k of r.keys) if (!keys.includes(k)) keys.push(k);
  }
  if (keys.length === 0) keys.push("board", "tools");
  return keys.slice(0, 3).map((k) => TOOLS[k]);
}

/**
 * A meta description Google will actually print. It truncates around 155-160
 * characters; ours run to 314. Cut on a word boundary and only when needed —
 * the excerpt shown on the page is left at full length.
 */
export function metaDescription(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.—-]+$/, "") + "…";
}

/**
 * A <title> that fits. Google renders roughly 60 characters; the brand suffix
 * costs 17 of them, so it is dropped when the headline needs the room rather
 * than pushing the headline out of the result.
 */
export function pageTitle(headline: string, brand = "The Next Cigar", max = 60): string {
  const h = headline.trim();
  const withBrand = `${h} · ${brand}`;
  if (withBrand.length <= max) return withBrand;
  if (h.length <= max) return h;
  const cut = h.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return (at > max * 0.6 ? cut.slice(0, at) : cut) + "…";
}
