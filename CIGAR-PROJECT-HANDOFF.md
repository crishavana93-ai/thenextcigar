# Cigar Aggregator — Project Handoff

**Date:** 21 May 2026
**Owner:** Cris (Guatabey Cigars)
**Status:** Strategy phase complete. Ready to pick model and start building.

---

## 1. The original idea

Build a Swedish cigar price aggregator: scrape every Swedish cigar e-tailer, show customers the best price on any cigar, take the order, place it with the licensed seller. Concierge / Kayak-for-cigars model.

---

## 2. What we learned (research summary)

### Sweden — legal landscape
- **Online tobacco sales require a permit** from the kommun (municipality). A website counts as its own "sales point" — separate from any physical store permit.
- **Application fee:** ~9,500–11,000 SEK (Malmö 9,500 / Stockholm 9,970 / Gothenburg 11,080). Annual supervision fee ~8,000 SEK. Processing 6–8 weeks (up to 4 months).
- **Tobacco tax on cigars 2026:** 1.83 SEK per piece. VAT 25%.
- **Age verification** at delivery is mandatory (18+) and case law sets a high bar — needs ID-on-delivery courier (PostNord identifierad utlämning or Budbee).
- **Killer constraint: marketing of tobacco is almost entirely banned.** Tobacco Act SFS 2018:2088 prohibits all "other marketing" including internet promotion. Indirect marketing is also banned. Only "neutral information" (product list + price list) is allowed at the seller's own sales point.
- **Implication:** a consumer-facing comparison or affiliate site for tobacco is legally fragile in Sweden. The original concierge model is essentially blocked.

### Swedish market landscape
- **Puros.se** — market leader, "Nordens största cigarrbutik," runs a public 10-day price-match guarantee, free shipping >999 SEK, 24h dispatch.
- **Brobergs.se** — heritage brand since 1881, physical stores in Stockholm/Gothenburg/Malmö + online.
- **KindCigars.se** — subscription / curated boxes (Bronze / Silver / Gold tiers).
- **Cigarrspecialisten.se** — entry-level / price-focused.

### USA — for comparison
- **PACT Act exempts cigars** (covers cigarettes & smokeless only), so federal interstate shipping is easier for cigars than other tobacco.
- **Pure affiliate model = no tobacco license required.** You're a publisher, not a seller. This is how the existing US aggregators operate.
- **If you take payment or title** → full tobacco retailer obligations (FDA registration, state retailer license per state, OTP tax).
- **No Swedish-style marketing ban** — tobacco can be advertised with FDA rules / warnings.

### The aggregator model ALREADY exists in the US
- **CigarFinder.com** — 58,000+ products across 17 retailers, AI advisors, coupon hub, digital humidor, community. Dominant.
- **Cigar Price Scout** — 25+ retailers, daily price updates, shipping & tax calc.
- **No equivalent exists for Europe or for Cuban cigars.**

---

## 3. Strategic options on the table

| Model | Description | Legal risk | Capital | Time to revenue | Ceiling |
|---|---|---|---|---|---|
| **A. Licensed Swedish retailer + internal price engine** | Own webshop, scraper as internal pricing weapon | Low | ~80k SEK | ~3 mo | High |
| **B. B2B SaaS for cigar retailers** | Price-monitoring tool sold to Puros, Brobergs, etc. | Very low | ~20k SEK | ~3 mo | Low (tiny TAM) |
| **C. Members-only "neutral info" club** | Paid membership in Sweden | High | ~10k SEK | ~6 wk | Low |
| **D. EU Cuban cigar aggregator (CURRENT BEST)** | Pan-European affiliate site for Habanos — the gap US sites can't fill | Medium (jurisdiction-dependent) | ~20–40k SEK | ~2–4 mo | Very high |
| **E. Hybrid: D + A** | EU aggregator brings traffic; Swedish retailer captures full margin on Nordic orders | Medium | ~100k SEK | ~3–4 mo | Very high |

---

## 4. Current best thinking

**The winning angle isn't "Swedish CigarFinder." It's "the European Cuban cigar finder."**

Why:
- US embargo means CigarFinder & Cigar Price Scout can never list Cuban cigars (Cohiba, Montecristo, Partagas, Romeo y Julieta) — the most prestigious brands in the world.
- US smokers who want Cubans currently use grey-market forwarders. Latent demand, no aggregator.
- EU smokers compare 3–4 sites manually for Cubans. No tool exists.
- Structurally defensible — US aggregators cannot follow you here.

**Best base country for the aggregator:** Switzerland (not EU, cigar-friendly, Habanos S.A.'s Swiss operations are here, no aggressive marketing ban) or Spain (Habanos distribution hub, large market). NOT Sweden (marketing ban).

**Best structure (Model E hybrid):**
- Aggregator entity in CH or ES → affiliate revenue from EU retailers, US grey-market shoppers, sponsored placements
- Swedish retailer entity (separate) → captures full ~21% net margin on Nordic orders sent through the aggregator

---

## 5. Margins / unit economics

**Affiliate aggregator:** 5–15% commission per referred sale. Typical cigar e-tail program pays 8–10%. ~120–150 SEK profit per 1,500 SEK order. Volume game.

**Licensed Swedish retailer:** ~21% net contribution margin after VAT, tobacco tax, COGS, shipping, payment fees. ~315 SEK profit per 1,500 SEK order. Capital-intensive.

**Hybrid:** stack both — affiliate for non-Sweden EU orders, full margin for Swedish orders.

---

## 6. Open decisions (need from Cris before next phase)

1. **Pick the model.** D (pure EU aggregator), E (hybrid), or A (Sweden only)?
2. **Base country for the aggregator entity.** Switzerland, Spain, or other?
3. **Brand decision.** Use Guatabey, build a neutral aggregator brand, or both (Guatabey as curated sub-brand inside a neutral aggregator)?
4. **Capital available year-one.** Determines how aggressive we can be.

---

## 7. Next steps once decisions are made

1. Map European Cuban cigar retailer landscape (Spain, UK, CH, DE, IT, SE, FR) — who, what SKUs, what prices, affiliate programs.
2. Validate affiliate program availability with top 5–10 EU Cuban retailers.
3. Register domain + entity in chosen base country.
4. Build MVP scraper for top 5 retailers, top 200 SKUs.
5. (If hybrid) start Swedish tobacco permit application in parallel — 6–8 week clock.
6. Launch waitlist landing page to validate demand (legal in CH/ES, not in SE).

---

## 8. Key reference links

**Sweden regulatory**
- Folkhälsomyndigheten — [Trade in tobacco products](https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/living-conditions-and-lifestyle/andtg/legal-requirements/tobacco-products/trade-in-tobacco-products/)
- [Lag 2018:2088 om tobak och liknande produkter](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20182088-om-tobak-och-liknande-produkter_sfs-2018-2088/)
- [Förordning 2025:885 — Tobacco tax rates 2026](https://lagen.nu/2025:885)
- [Malmö stad — Tillstånd för försäljning av tobak](https://malmo.se/For-foretag-och-verksamheter/Forsaljning-av-folkol-tobak-och-nikotinprodukter/Tillstand-for-forsaljning-av-tobak.html)
- [Konsumentverket — Marknadsföring av tobak](https://konsumentverket-se-prod.azurewebsites.net/for-foretag/regler-per-omradebransch/tobak-ecigaretter-och-tobaksfria-nikotinprodukter/marknadsforing-av-tobak/)

**USA regulatory**
- [PACT Act basics — Tobacco Law Blog](https://www.tobaccolawblog.com/2024/04/pact-act-basics-5-things-tobacco-sellers-and-shippers-should-know/)
- [How to Sell Cigars Legally — LegalClarity](https://legalclarity.org/how-to-sell-cigars-legally-licensing-and-compliance/)

**Competitors / market**
- [Puros.se](https://www.puros.se/) | [Brobergs.se](https://www.brobergs.se/) | [KindCigars.se](https://www.kindcigars.se/sv/) | [Cigarrspecialisten.se](https://cigarrspecialisten.se/)
- [CigarFinder.com](https://cigarfinder.com/) — US comparison engine to study
- [Cigar Price Scout](https://cigarpricescout.com/) — US comparison engine to study

**Full strategic plan (Sweden-only Model A version)**
- `Swedish_Cigar_Aggregator_Plan.docx` (in this folder)
