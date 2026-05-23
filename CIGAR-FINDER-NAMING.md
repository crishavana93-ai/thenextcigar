# Cigar Finder — Section Name Shortlist

**Date:** 22 May 2026
**Decision needed by:** before retailer mapping doc + first Astro page scaffold.

The finder lives at `thenextcigar.com/[slug]/` and as a tab inside The Lounge. Same name should work in both places. TNC's existing one-word lowercase slug pattern (`/blog/`, `/shop/`, `/watch/`, `/lounge/`) is the convention to match.

Note: `/watch/` is already in use for the TNC YouTube video aggregator — not available for the price finder.

---

## Recommendation: `/finder/` → "The Finder"

Sharpest pick for these reasons:

- **Clear utility.** Visitor lands on the page and immediately knows what it does. CigarFinder.com is the proven US reference — visitors searching "cigar finder" or "Cuban cigar finder" map directly to us.
- **Fits TNC's voice.** "The Finder" reads like a magazine section (think *The Cut*, *The Strategist*, *The Wirecutter*). Premium editorial framing with a utility payload — the exact TNC sweet spot.
- **Dual meaning.** Find the cigar you want + find the best price. Versatile copy surface.
- **Lounge tab works.** "Finder" as a tab name is short, recognizable, fits the existing tab pattern (Map / Directory / Events / Finder).
- **Expansion-proof.** Doesn't lock us into Cuban-only. If we eventually add Nicaraguan / Dominican coverage, the name still fits.
- **Trademark-safe.** No conflicts.

URL examples:
- `thenextcigar.com/finder/` — landing + country picker
- `thenextcigar.com/finder/es/` — Spain dashboard
- `thenextcigar.com/finder/cohiba-behike-52/` — per-SKU detail page
- `thenextcigar.com/finder/deals/` — biggest drops feed
- `thenextcigar.com/lounge/app/finder/` — Lounge premium tab (or rename if confusing)

---

## Full shortlist

### 1. `/finder/` — "The Finder" ★ Recommended

Pros: Clear, editorial, dual-meaning, expansion-proof, trademark-safe.
Cons: Generic — doesn't signal Cuban specialization in the name itself.
SEO: Medium-strong. "Cigar finder" is a real search term. Page H1 carries the Cuban specialization ("The Finder — Cuban cigar prices across Europe").
Verdict: Best balance of clarity, brand-fit, and expansion room.

### 2. `/habanos/` — "Habanos"

Pros: Signals Cuban specialization instantly. Strongest pure-SEO play — "habanos prices," "habanos comparison" are high-intent commercial searches with weak existing competition in Europe. Authentic to the audience (every serious Cuban smoker uses the word "Habanos" interchangeably with "Cuban cigar").
Cons: Locks us into Cuban-only. Habanos S.A. holds the trademark — using it as a section slug describing the product category is generally defensible as nominative fair use (CigarAficionado does this routinely), but they could send a takedown letter if they decide to be aggressive. Lounge tab "Habanos" is slightly clunky.
SEO: **Strongest of any option here.** Real ranking opportunity for high-intent terms.
Verdict: Highest upside, highest legal noise risk. Pick this if SEO is the priority and we accept the trademark-letter risk.

### 3. `/ledger/` — "The Ledger"

Pros: Premium editorial feel — evokes record-keeping, prices, history, market data. Strongest Hodinkee-tone match. Very distinctive — would own the brand association.
Cons: Obscure on first encounter. Doesn't tell a new visitor what the section does. Bad for SEO. As a Lounge tab "Ledger" reads pretentious.
SEO: Weak.
Verdict: Best brand fit. Worst clarity. Pick this if we believe the audience is sophisticated enough to discover the section organically and we're prioritizing brand depth over funnel width.

### 4. `/market/` — "The Market"

Pros: Implies market data / pricing / movement. Premium feel, fits editorial voice. Short.
Cons: Generic — competes with every "market" page on the internet. Could be confused with a shop/marketplace (TNC already has `/shop/`). Lounge tab "Market" is OK but slightly off-meaning (it's not a marketplace, it's a comparison tool).
SEO: Weak (too broad).
Verdict: Decent fallback if neither Finder nor Habanos lands.

### 5. `/prices/` — "Prices"

Pros: Maximum clarity. Visitor knows exactly what it does.
Cons: Utilitarian. Doesn't fit TNC's editorial voice — reads like a hardware-store sign. Lounge tab "Prices" is fine but uninspiring.
SEO: Medium ("cigar prices" is searched).
Verdict: Functional but off-brand. Only pick if we're optimizing purely for clarity over voice.

### 6. `/index/` — "The Index"

Pros: Sophisticated, evokes stock index, premium editorial feel.
Cons: Confusing — "index" colloquially means table of contents in editorial contexts. Users won't intuit "price index" without explanation.
SEO: Poor (too overloaded a word).
Verdict: Skip.

---

## Lounge tab name (separate decision)

Even if the public section is `/finder/`, the Lounge tab can have a different name if that reads better in the bottom nav. Options:

- **Finder** — matches public section. Cleanest.
- **Watch** — implies monitoring/alerts. Strong active-verb feel. (Not conflicting since the TNC `/watch/` is a separate URL.)
- **Deals** — implies promotional, may attract less serious browsers vs price-monitors.
- **Alerts** — accurate but bureaucratic-sounding.

**Recommended:** mirror the public section name. If `/finder/` → tab is "Finder." If `/habanos/` → tab is "Habanos." Cross-property naming consistency outweighs minor in-app readability gains.

---

## My pick if you want me to just call it

**`/finder/` for the public section, "Finder" as the Lounge tab.** Page H1 can lead with the Cuban wedge ("The Finder — Cuban cigar prices across Europe"). Best blend of clarity, voice, SEO, and expansion room. Habanos S.A. trademark risk avoided. If SEO data later shows "habanos" terms are dramatically out-converting "finder" terms, we can add `/habanos/` as an alias URL that redirects to `/finder/` and capture both.

If you'd rather lean fully into the Cuban specialization at the cost of accepting low-grade trademark risk: pick **`/habanos/` → "Habanos"** instead.
