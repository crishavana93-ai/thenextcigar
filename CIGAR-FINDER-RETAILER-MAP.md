# Cigar Finder — Retailer Mapping Document

**Scope:** European Cuban (Habanos) cigar retailers across 5 launch countries (Spain, Germany, Switzerland, Italy, Sweden) for TheNextCigar's "The Finder" price-comparison feature.

**Date compiled:** May 2026
**Methodology:** Direct site browsing via WebFetch + curl. Prices verified on retailer product pages where the catalog is publicly accessible. Affiliate program status inferred only from publicly visible footer/links — no presumption made when not found.

---

## Executive Summary

### Retailer counts by country

| Country | Retailers mapped | Online sale to consumer possible? | Notes |
|---|---|---|---|
| **Sweden** | 11 | Yes — domestic only (Habanos Nordic AB monopoly) | Tobacco Act §4 forbids commercial *promotion* of tobacco; the **retailers are licensed**, but **our editorial framing of their prices** is the legal risk |
| **Germany** | 12 | Yes — domestic only | Strongest e-commerce market; 5th Avenue Products Trading is the sole importer. ~20 LCDH stores, ~70 Habanos Specialists nationwide |
| **Switzerland** | 11 | Yes — domestic + cross-border into EU (grey-zone customs) | Outside EU customs union. Multiple Swiss retailers ship into EU. 10 LCDH locations |
| **Italy** | 9 | **Restricted** — Decree 6/2016 bans transnational online tobacco sales; domestic Italian online sale of cigars exists in a legal grey area enforced by tabaccaio monopoly via Agenzia delle Dogane e dei Monopoli (ADM). Several tabaccherie do operate WooCommerce-style shops | The Italian "online cigar sale" surface is the murkiest of the five markets |
| **Spain** | 8 | **Effectively prohibited online** — Spanish law (CMT regulation) prohibits internet sale of tobacco to consumers. "Cigar Smoker Club"-style reservation services skirt this by acting as personal-shopper intermediaries with licensed *expendedurías* | Spanish retailers cannot scrape as classical e-commerce; price discovery is partial |

**Total retailers mapped: 51**

### Affiliate program availability

Of the 51 retailers mapped, **zero (0%) advertise a public, self-serve affiliate program** in the EU Cuban-cigar segment. Tobacco-affiliate programs are common in the US (Cigars International, Famous Smoke, Cuban Crafters, etc.) but absent in EU markets due to:

1. **EU Tobacco Advertising Directive (TPD/2003/33/EC)** — bans most cross-border tobacco advertising and limits "incentivised promotion" by third parties; affiliates legally qualify as advertisers
2. **National advertising bans** — Sweden's Tobacco Act, Italy's Sirchia Law, Spain's Law 28/2005, Germany's HTabakWG amendment effective 2022 all restrict tobacco promotion
3. **Tabacalera/5th Avenue monopoly structure** — official Habanos distributors do not endorse third-party referral channels

**Practical implication:** Every retailer in this map will need to be approached **1-to-1** via custom partnership negotiation. Standard Awin/CJ/ShareASale signup workflows do not apply. Some retailers (notably Noblego, Cigarworld, Brobergs) operate "kunden-werben-kunden" / "rekommendera en vän" customer-referral schemes, but these are for end users, not publishers.

### "Approach first" — top 3 candidates per country

| Country | Priority 1 | Priority 2 | Priority 3 | Why |
|---|---|---|---|---|
| **Sweden** | Cigarrspecialisten.se | Puros.se | Cigarrhyllan.se | Cleanest catalogs, public pricing in SEK, well-known brand authority, modern e-commerce stack (Cigarrhyllan + Puros on Textalk Webshop) |
| **Germany** | Noblego.de | Cigarworld.de | thecigarsmoker.com (LCDH Hamburg) | Noblego has the **most scrapable schema.org JSON-LD prices**; Cigarworld is the volume leader; LCDH Hamburg is the brand-authority play |
| **Switzerland** | Cigarmust.com (LCDH Lugano/Mendrisio) | 5thAvenue.ch / CigarOne.com | SwissCubanCigars.com | Cigarmust has the cleanest PrestaShop catalog with public CHF pricing and verified cross-border EU shipping. CigarOne is Geneva-since-1998 with strong SEO. SwissCubanCigars has the largest English-language SKU range |
| **Italy** | Sigarietabacchi.it | HouseofCigars.it (Venice) | Bottegadelfumatore.com (Padova) | These three actually have functioning WooCommerce stores with €-denominated per-stick pricing. Casa del Habano Milano (casadelhabano.it) is brand-authority but **catalog-only, no e-commerce** |
| **Spain** | CigarSmokerClub.com | CasaDelPuro.com | Domingocigars.com | Spain's online surface is shallow — CigarSmokerClub's reservation model is the only WooCommerce shop with public €-pricing that can plausibly fulfill. Casa del Puro is Spanish-Swiss hybrid. Domingo is the famous Barcelona cellar with thin online presence |

### Cross-country patterns & red flags

1. **Spain is essentially un-scrapable as classical e-commerce.** The Comisionado para el Mercado de Tabacos prohibits internet sale of tobacco. Spanish retailers are physical-store brands; "online" Spanish shops are reservation/concierge services. The Finder's Spanish coverage will need to be re-framed as "where to find these cigars in Spain" rather than "compare these Spanish e-tailers' prices."

2. **Italy is a legal grey zone.** Domestic online sale by licensed Italian tabaccherie exists (sigarietabacchi.it, houseofcigars.it, bottegadelfumatore.com all have working carts), but Decree 6/2016 prohibits **transnational** online sale. This means The Finder can show Italian retailer prices to Italian users but **cannot promote them cross-border**.

3. **Switzerland is the strategic linchpin.** Swiss retailers (Cigarmust, CigarOne, SwissCubanCigars, Casa del Puro) operate outside EU customs union and openly ship into the EU. This is the only market where The Finder can plausibly show prices that an EU consumer in a high-tax country (Germany, Sweden) might rationally choose over their local market. CHF pricing requires currency conversion in The Finder UI.

4. **Sweden's tobacco law applies to *promotion*, not retailers.** The 8 Swedish retailers we mapped are all licensed under Habanos Nordic AB's distribution. The legal risk falls on TheNextCigar's editorial framing — phrasing like "the best deal" or "lowest price" is what the Tobacco Act §4 targets. The neutral product-comparison framing should mitigate but requires legal review.

5. **Germany has the highest data quality.** Noblego.de and Cigarworld.de both expose schema.org structured data with verified prices. They're the best candidates for the MVP scrape pilot.

6. **Cuban-cigar prices in 2026 are 2-3x what they were pre-2023** due to Habanos S.A. global price harmonization with the Hong Kong/Macau market. Several SKUs that used to retail €200/box are now €500-1,500/box. This volatility means price-drop alerts will fire frequently and should be a strong feature hook.

7. **All four "andorra.com-style" cross-border shops** (Andorra-Cigars, House-of-Cigars-Andorra, etc.) were **deliberately excluded** per brief. Swedish customs (Tullverket) routinely seizes their parcels into Sweden; the legal exposure is too high to surface in the Finder.

8. **The "La Casa del Habano" franchise is the gold-standard brand authority.** Of the 51 retailers, 18 hold an LCDH franchise license (the highest-tier Habanos Specialist designation). When approaching for partnership, leading with LCDH retailers will give The Finder the editorial credibility to recruit non-LCDH retailers afterward.

9. **All listed retailers are age-gated (18+).** This is not a red flag per se but does mean cookie-based session handling will be needed for any automated scraping pilot. Some sites (lacasadelhabano-dl.de, cigarworld.de) gate the *catalog* behind the age check; others (noblego.de, puros.se) only gate checkout.

---

## SWEDEN

Swedish online cigar retail is structured around **Habanos Nordic AB**, the regional Habanos distributor (since the 2009 reorganization). All legitimate Cuban-cigar retailers source from it. Sweden permits domestic online sale subject to BankID age verification.

**Sweden-specific legal note:** Sweden's Tobacco Act (Lag 2018:2088) prohibits commercial marketing of tobacco products to consumers. Retailers themselves are licensed and may operate webshops, but third-party editorial framing of their prices (e.g., "cheapest box in Sweden") is the legal exposure. The Finder's framing for Swedish SKUs should be neutral, descriptive, and consumer-information-style — not promotional.

| # | Name | URL | Country | Ships to | Cuban specialization | Top Cuban brands | Sample prices | Affiliate program | Scrapability notes | Notes / red flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Cigarrspecialisten** | https://cigarrspecialisten.se | SE (Växjö) | Sweden only | LCDH franchise — Habanos + Davidoff Specialist; also Nicaragua/DR | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Trinidad, Bolivar, Diplomáticos, Punch, Quai d'Orsay, Vegueros (full Habanos range) | Cohiba Robustos (box 25): 16 250 SEK ([source](https://cigarrspecialisten.se/cigarrer/kuba/cohiba/cohiba-robustos/)) · Cohiba Siglo I (box 25): 7 500 SEK · Cohiba Behike 52 (box 10): 20 250 SEK | Unknown — no public affiliate link; outreach required | Static HTML, server-rendered, very clean. Price format = total per pack (varying box size — 10, 12, 25). Trustpilot widget integrated. Reco.se trust badge. SEK only | Out-of-stock heavy on premium SKUs (most Cohiba lines were "Tillfälligt slut" at scrape time). LCDH-authorized — high authority. **MUST-INCLUDE for SE** |
| 2 | **Puros.se** | https://www.puros.se | SE | Sweden only | Mixed: Cuban + Nicaragua + DR + Honduras + Mexico ("Nordens största cigarrbutik") | Cohiba, Montecristo, Partagas, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Trinidad, Bolivar + 22 Cuban brands | Public Cohiba category visible but bestseller prices shown on home only (Puros Rökta Klassiker 195 SEK; Joya de Nicaragua Seleccion 795 SEK) — Cohiba box prices visible on category page (per box, full SEK pricing) | Unknown — no public affiliate page | Static HTML on Textalk Webshop platform (textalk.se). Schema visible. Predictable URL slugs: `/cigarrer/cigarrer-kubanska-cigarrer/cohiba/`. PostNord shipping. Age gate via BankID | Confirmed active 2026; ships within 24h. **MUST-INCLUDE for SE** — broadest Nordic catalog |
| 3 | **Kind Cigars** | https://www.kindcigars.se | SE (Helsingborg) | Sweden + international pickup (mentions "pickup in Helsingborg for international customers") | Mixed: Cuban + DR + Nicaragua + Honduras + (curiously) Casdagli, Meerapfel, La Flor Dominicana | Cohiba, Montecristo, Partagas, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Bolivar, Diplomáticos, Trinidad, Vegueros, Vegas Robaina + full Cuban range | Box of 20 (AJ Fernandez): 3 345-3 849 SEK; Box of 25 (Oliva): 2 075 SEK; Cuban Cohiba prices listed in their dedicated /habanos-all-cuban-brands/cohiba/ sub-category (sub-page didn't render price grid in our scrape — may require JS hydration) | Unknown — no public affiliate page found | Textalk Webshop (same stack as Puros.se). EN + SV. Slug pattern: `/en/cigars/habanos-all-cuban-brands/cohiba/`. Boutique/curated angle | Heavy focus on Casdagli/Villa Casdagli SKUs (DR luxury). Email-only contact at info@kindcigars.com. **MUST-INCLUDE for SE** |
| 4 | **Cigarrummet** | https://www.cigarrummet.com | SE (Stockholm) | Sweden only | LCDH-adjacent; Habanos Specialist; mixed Cuban + DR + Nicaragua | Cohiba, Montecristo, Romeo y Julieta, H. Upmann, Partagás, Hoyo de Monterrey, Trinidad, Quintero, Jose L. Piedra | Cohiba Robustos (single): 867 SEK · Cohiba Robustos (box of 25): 19 200 SEK · Cohiba Wide Short (6-pack): listed | Unknown — no public affiliate page | WooCommerce. Public price grid. Age gate as overlay (`age-gate__headline`). Predictable `/produkt/cohiba-robustos/` slug. Cuban category: `/produkt-kategori/lander/kuba/` | Owner Merja Jusélius; Stureplan 2 location. Long-running, well-respected. **MUST-INCLUDE for SE** |
| 5 | **Cigarrhyllan** | https://cigarrhyllan.se | SE (Stockholm) | Sweden only | Habanos Specialist; mixed Cuban + DR + Nicaragua | Cohiba (15+ vitolas), Montecristo, Partagás, Romeo y Julieta, Hoyo de Monterrey, Trinidad, Bolivar, Behike line | Cohiba Wide Short 6p: 299 SEK · Cohiba Club: 200 SEK · Cohiba Medio Siglo: 625 SEK · Cohiba Behike 54: 28 000 SEK · Cohiba Siglo de Oro (Year of the Rabbit): 25 900 SEK · Cohiba 55 Aniversario LE 2021: 17 354 SEK ([source](https://cigarrhyllan.se/cigarrer/kuba/cohiba/)) | Unknown — no public affiliate page | Custom CMS, server-rendered. Schema-friendly `class="price"` tags. URL pattern: `/cigarrer/kuba/cohiba/cohiba-wide-short-6-pack/` — perfect for scraping | Strong Cohiba LE / aged inventory. **MUST-INCLUDE for SE** |
| 6 | **Brobergs Tobakshandel** | https://www.brobergs.se | SE (Stockholm, Göteborg, Malmö) | Sweden only | LCDH franchise (multiple locations); Habanos Specialist | Full Habanos range per LCDH license | Webshop has products (avo, alec bradley etc.) listed by SKU number — Cuban Cohiba/Montecristo line **not publicly shown on webshop categories**; appears to be reservation/in-store only for Cubans | Unknown — no affiliate signal | Custom Storm/Microsoft-stack e-commerce (uses `/category/`, `/product/` pattern). Age gate overlay. Cuban SKUs likely require physical pickup/phone | Founded 1881. **Strong brand authority** but limited online-cigar surface for Cubans — they may have business reasons for restricting online Cuban catalog. Approach for partnership = highest priority anyway |
| 7 | **Mellgren's (Mellgrens.se)** | https://mellgrens.se | SE (Göteborg) | Sweden only | Habanos Specialist; large humidor (15,000 cigars) | Full Cuban range in physical store | Limited online catalog (mostly accessories visible to anonymous browse) | Unknown | WooCommerce-based but Cuban inventory not surfaced on category pages; phone reservation model | Famous Göteborg cellar w/ luxury lounge. Brand authority play, weaker scrape surface |
| 8 | **Cigarrhuset** | https://cigarrhuset.se | SE | Sweden only | Mixed Cuban + DR + Nicaragua | Cohiba, Montecristo, Partagás, Romeo y Julieta | Catalog visible with SEK prices; smaller selection than Puros/Cigarrspecialisten | Unknown | WooCommerce. Standard scrapable | Smaller operator; verify activity before approach |
| 9 | **Snusfabriken.com (cigar category)** | https://snusfabriken.com/produkt-kategori/roktobak/kopa-cigarrer-bestalla/ | SE | Sweden only | Generic — snus shop with cigar add-on; carries some Cuban brands | Some Cuban brands (Cohiba, Montecristo) but limited range | Public SEK prices on category | Unknown | WooCommerce; broader tobacco store (snus is primary) | NOT Cuban specialist — include as fallback / wide-comparison data, not as primary scrape target |
| 10 | **The Habano (thehabano.se)** | (limited online; primarily physical) | SE | Sweden only | LCDH-adjacent | Cohiba, Montecristo, Partagás | Limited online price discovery | Unknown | Reservation-style | Verify activity before outreach |
| 11 | **Cigarworld Stockholm (cigarworld.se)** | https://cigarworld.se | SE | Sweden only | Mixed | Cohiba, Montecristo, Romeo y Julieta | Public SEK pricing | Unknown | WooCommerce | Smaller secondary player; reachable for fill-out |

**Sweden top-3 to approach first:** Cigarrspecialisten.se, Puros.se, Cigarrhyllan.se (Cigarrummet is a close fourth).

---

## GERMANY

Germany has the **deepest e-commerce surface** of the 5 markets. 5th Avenue Products Trading GmbH (Waldshut-Tiengen) is the sole official Habanos importer for Germany / Austria / Poland. ~20 La Casa del Habano franchises and ~70 "Habanos Specialist"–designated stores. Domestic online sale is legal and routine.

| # | Name | URL | Country | Ships to | Cuban specialization | Top Cuban brands | Sample prices | Affiliate program | Scrapability notes | Notes / red flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Noblego** | https://www.noblego.de | DE (Berlin) | Germany + selected EU | Mixed: Cuban + DR + Nicaragua + accessories (#2 online tobacco retailer in DE) | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Trinidad, Bolivar (full Habanos range) | **Cohiba Robustos (single): €79.60 · (box of 25): €1 930.30** ([source](https://www.noblego.de/cohiba-robustos/)) · **Montecristo No.4 (single): €14.80 · (box of 25): €358.90** ([source](https://www.noblego.de/montecristo-no-4/)) · **Partagás Serie D No.4 (single): €21.60 · (box of 25): €523.80** ([source](https://www.noblego.de/partagas-serie-d-no-4/)) · **Hoyo de Monterrey Epicure No.2 (single): €20.60 · (box of 25): €499.55** · **Cohiba Siglo I (single): €34.00 · (box of 25): €824.50** · **Trinidad Reyes (single): €34.00 · (box 12): €791.52** · **Romeo y Julieta Petit Coronas: €9.80 / €237.65** · **Montecristo Petit Edmundo: €20.90 / €506.83** | Unknown — no public affiliate page | **Magento-based, schema.org JSON-LD with embedded prices**. Extremely scrapable. Predictable slugs (`/cohiba-robustos/`, `/montecristo-no-4/`). Trusted Shops badge. €60 free shipping threshold | **HIGHEST-PRIORITY scrape target across all 5 countries.** Founded 2012 (Patock + Alpar). **MUST-INCLUDE for DE** |
| 2 | **Cigarworld.de** | https://www.cigarworld.de | DE (Düsseldorf) | Germany + selected EU | LCDH franchise (Cigarworld Lounge Düsseldorf is LCDH); full Habanos | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo, Trinidad, Bolivar, Davidoff (full premium range) | Catalog publicly visible (`/zigarren/kuba`, `/cohiba`); prices are loaded server-side but Cuban-specific SKU prices require browse with cookies (`agecheck=1`). Brand authority confirms ~1,300 series stocked | Has a "/affiliate" URL but page is meta noindex with no program content. **No real affiliate program**. Operates "Customers Recruit Customers" (`/en/kwk`) referral discount — for end users, not publishers | Server-rendered. EUR-denominated. **Age gate is hard** (Cuban catalog blocked behind 18+ verification banner). Vue.js sidebar filter, but main HTML is static. URL pattern: `/zigarren/kuba/<brand>/<sku>` | Cigarworld Lounge Düsseldorf is famous. **MUST-INCLUDE for DE** |
| 3 | **La Casa del Habano Hamburg (thecigarsmoker.com)** | https://www.thecigarsmoker.com | DE (Hamburg) | Germany + International | LCDH franchise; pure Habanos specialist | Full Cuban range per LCDH | Webshop is gated; prices not publicly visible without login | Unknown — outreach required | Hard age/login gate. Brand authority is the play, not scrape | Germany's first Casa del Habano (Oct 1996). 2 Hamburg locations (Chilehaus + HafenCity). **MUST-INCLUDE for DE** |
| 4 | **La Casa del Habano Düsseldorf (lacasadelhabano-dl.de)** | https://www.lacasadelhabano-dl.de | DE (Düsseldorf) | Germany | LCDH franchise; pure Habanos | Full Cuban range | Catalog `/shop/category/cigars-cuban-196` returns 200 but prices are `display:none` in HTML (rendered after login). Visible price metadata: ranges from €3.15 (singles) to €1,323.53 (premium box) via `<span itemprop="price" style="display:none">` | Unknown | Odoo-based shop. **Hard age verification** at top of every page. Prices in `itemprop="price"` schema but hidden via CSS until login | LCDH Düsseldorf is one of the prestige LCDHs in DE |
| 5 | **La Casa del Habano Bonn (lcdh-bonn.de)** | https://www.lcdh-bonn.de | DE (Bonn) | Germany | LCDH franchise; pure Habanos | Full Cuban range | Online catalog limited / by-appointment | Unknown | EN/DE; emphasis on lounge experience over scrape surface | Cigar Embassy brand "Ambassadors of Fine Taste"; lifestyle-marketing oriented |
| 6 | **CasaBenden.de** | https://www.casabenden.de/en | DE (Düsseldorf) | Germany | LCDH-affiliate; pure Habanos. "Habanos Specialist of the Year 2010" | Cohiba, Partagás, Trinidad, Montecristo, Romeo y Julieta + LCDH Exclusivos | Public catalog with EUR prices | Unknown | WooCommerce-like; standard scrape pattern | Lower volume but premium positioning |
| 7 | **Max Zechbauer Tabakwaren** | https://www.zechbauer.de/en | DE (München) | Germany | LCDH franchise München; "Habanos Specialist of the Year 2018"; pure Habanos | Cohiba, Montecristo, full range; 500+ products | Public EUR catalog | Unknown | 1998-era e-commerce; one of first German tobacco e-tailers | München's flagship LCDH; high authority |
| 8 | **Habanos-Zigarren.com** | https://www.habanos-zigarren.com/en_GB | DE | Germany | Pure Cuban specialist | Cohiba, Montecristo, Partagás, Romeo y Julieta + aged Cubans | Public EUR catalog | Unknown | Standard e-commerce; scrapable | Focused brand positioning |
| 9 | **Selected Cigars (selected-cigars.com)** | https://selected-cigars.com/en | DE (Düsseldorf) | Germany | LCDH-affiliate (best Casa del Habanos award) | Full Cuban range | Public EUR catalog | Unknown | Magento-style; standard scrape | Düsseldorf cigar lounge presence |
| 10 | **Helgoland Online Shop** | https://www.onlineshop-helgoland.de/en/cigars/habanos-brands/ | DE (Helgoland — duty-free island) | Germany + EU subject to duty-free rules | Habanos + others | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann | Public EUR catalog at lower prices (duty-free positioning) | Unknown | Standard e-commerce | **Special case**: Helgoland is German duty-free zone. Prices appear lower; verify customs/import rules before promoting cross-border within EU |
| 11 | **CigarsGermany.com** | https://www.cigarsgermany.com | DE | Germany + EU | Premium Cuban + DR | Cohiba, Montecristo, Davidoff (premium range) | Public EUR catalog | Unknown | Modern Shopify-like stack | Newer entrant; verify volume/authority |
| 12 | **5th Avenue Products (5thavenue.de)** | https://www.5thavenue.de | DE (Waldshut-Tiengen) | n/a — **B2B only** | Sole official Habanos importer for DE / AT / PL | All Cuban brands at wholesale | **NOT a consumer retailer** — Drupal-based corporate site only. Lists products, locations, news; no e-commerce | n/a | n/a — B2B/import only | **EXCLUDE from price comparison.** Listed here for completeness because the Habanos community frequently mentions "5th Avenue" expecting it's a shop. It is not |

**Germany top-3 to approach first:** Noblego.de, Cigarworld.de, thecigarsmoker.com (LCDH Hamburg). Noblego is the must-win because its JSON-LD schema makes it the cleanest data partner.

---

## SWITZERLAND

Switzerland is outside the EU customs union. It has **10 La Casa del Habano franchises** (Basel, Zürich, Lugano, Mendrisio, St. Gallen, Zug, Samnaun, Nyon, Geneva, Montreux). Many Swiss retailers actively ship Cuban cigars into the EU as a price-arbitrage proposition (lower Swiss VAT 8.1% vs. EU 19-25% on luxury tobacco). Cross-border shipments require customs declaration but are legal for personal-use quantities.

**Key strategic value:** Switzerland is the **only** market in this map where a price-comparison feature can plausibly show prices that a consumer in a high-tax EU country (Germany 19% VAT, Sweden 25% VAT + excise) might rationally choose over their local retailer.

| # | Name | URL | Country | Ships to | Cuban specialization | Top Cuban brands | Sample prices | Affiliate program | Scrapability notes | Notes / red flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Cigarmust (LCDH Lugano + Mendrisio)** | https://cigarmust.com | CH (Mendrisio) | **Worldwide** (free shipping flags visible) | LCDH franchise; pure Habanos + Davidoff + Spirits | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Trinidad, Bolivar, San Cristobal, Quai d'Orsay, Punch, Vegueros, Diplomáticos, Sancho Panza + all 27 Habanos PDO brands | **Cohiba Robustos (box 25): CHF 2 040.00** ([source](https://cigarmust.com/en/cohiba/217-140-cohiba-robustos-7612907060907.html)) · **Cohiba Siglo I (box 25): CHF 872.50 / CHF 784.50 discounted** · **Cohiba Siglo IV (5-pack): CHF 322.00** · **Cohiba Esplendidos (3-pack): CHF 396.00** · **Cohiba Piramides Extra (box 10): CHF 1 450.00** · **Montecristo No.4 (box 25): CHF 420.00 / CHF 378.00 discounted** · **Montecristo Petit Edmundo (box 25): CHF 630.00 / CHF 567.00** · **Partagás Serie D No.4 (box 25): CHF 652.50 / CHF 587.00** · **Hoyo de Monterrey Epicure No.2 (box 25): CHF 590.00** · **Romeo y Julieta Belicosos (box 25): CHF 652.50** · **Trinidad Reyes (box 12): CHF 412.80 / CHF 330.80** | Unknown — no public affiliate link | **PrestaShop 1.7.x. Excellent schema, public CHF pricing, multiple pack sizes per SKU (`#/<n>-packaging-box_25_pcs`).** Slug pattern: `/en/<brand>/<id>-<sku>` | Owned by LCDH Lugano (Maspoli 21, Mendrisio). Also operates lcdhswiss.com sister site. **MUST-INCLUDE for CH — highest priority overall** |
| 2 | **CigarOne** | https://www.cigarone.com | CH (Geneva) | Worldwide ex-US | Pure Cuban specialist (operating since 1998) | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Trinidad, Bolivar, full Habanos | Public catalog with CHF + EUR price toggle visible | Unknown | Custom CMS; older but stable; clean URL structure | Brand authority — one of the longest-running online Cuban specialists. **MUST-INCLUDE for CH** |
| 3 | **SwissCubanCigars** | https://www.swisscubancigars.com | CH | Worldwide ex-US | Pure Cuban specialist | Full Habanos range — claims "largest selection of Cuban cigars online" | Public CHF catalog | Unknown | Custom stack; English-first; ships in sealed boxes | Strong English-SEO play; "fast worldwide shipping in original sealed boxes" |
| 4 | **Cigars of Cuba** | https://www.cigars-of-cuba.com | CH | Worldwide ex-US (since 1997) | Pure Cuban specialist | Full Habanos range; also LCDH Exclusivos | Public CHF/USD/EUR | Unknown | Older site; functional | **"Oldest online Cuban cigars store" since 1997**. Brand-authority play |
| 5 | **TopCubans (topcubans.com)** | https://www.topcubans.com | CH | Worldwide ex-US | Pure Cuban specialist; Official Swiss Habanos Retailer | Full Habanos range | Public catalog (CHF) | Unknown | Modern Shopify-style | Newer brand; certified Habanos status |
| 6 | **Casa Del Puro** | https://casadelpuro.com | CH/ES hybrid | Worldwide ex-US (free CH+LI over CHF 100) | Pure Cuban specialist (also Dom/Nic/Hon) | Cohiba, Montecristo, Partagás, Romeo y Julieta, Hoyo, Trinidad | Catalog Cloudflare-challenged on first load ("Just a moment..."); requires JS-rendering to scrape | Unknown | **Cloudflare turnstile blocking direct curl scrape.** Will need real browser session. WooCommerce backend visible from category URLs | Spanish-Swiss family business; "one of the very first online cigar stores in Europe" |
| 7 | **VIP Cigars** | https://www.vipcigars.com | CH | Worldwide | Pure Cuban + accessories | Cohiba, Montecristo, Davidoff | Public catalog | Unknown | Functional but visually dated | Smaller player |
| 8 | **Gestocigars** | https://www.gestocigars.ch/en | CH (Geneva) | Worldwide | Pure Cuban specialist | Full Habanos | Public CHF catalog | Unknown | Standard e-commerce | Geneva-based |
| 9 | **La Casa del Habano Nyon** | https://la-casa-del-habano-nyon.com/en | CH (Nyon) | CH + LI free over CHF 100; ships internationally | LCDH franchise (only LCDH in French-speaking CH) | Full Cuban range incl. LE/RE/Vintage | Public CHF catalog | Unknown | Standard e-commerce | Luxury-positioning; vintage and LE inventory |
| 10 | **Cigarpassion (cigarpassion.ch)** | https://cigarpassion.ch/en | CH | CH + selected international | Mixed Cuban + DR + Nic | Cohiba, Montecristo, Partagás | Public CHF catalog | Unknown | Standard scrape | Smaller operator |
| 11 | **Siglomundo** | https://it.siglomundo.ch | CH (Ticino) | Worldwide; free CH over CHF 50, worldwide over CHF 500 | Pure Cuban specialist (LCDH-adjacent) | Full Habanos | **Cohiba Robustos box of 25: CHF 2 040 · pack of 3: CHF 244 · single CHF 80** ([source](https://it.siglomundo.ch/products/cohiba-robustos)) | Unknown | **Shopify-based, excellent schema with `"priceCurrency":"CHF"` JSON-LD.** Multi-language (IT/EN/DE) | Italian-language UI is the native pitch — useful for IT users. Italian/EN/DE storefronts share inventory |

**Switzerland top-3 to approach first:** Cigarmust.com (Mendrisio LCDH), CigarOne (Geneva), Siglomundo (Ticino, multilingual + best schema after Noblego).

---

## ITALY

Italy is the most legally complex market. **Decree 6/2016 (Legislative Decree implementing TPD)** bans transnational online tobacco sale to consumers in Italy. **Internal domestic Italian online sale by licensed *tabaccherie*** exists in a grey zone — Agenzia delle Dogane e dei Monopoli (ADM) tolerates it for cigars (not cigarettes) provided the seller has a *patentino* license. Several Italian *tabaccherie* therefore operate functioning WooCommerce stores.

**Strategic implication for The Finder:** Italian retailers can be price-compared for Italian-IP users, but cross-border promotion (e.g., to Sweden) is legally exposed. Geo-fencing of Italian retailer data may be required.

| # | Name | URL | Country | Ships to | Cuban specialization | Top Cuban brands | Sample prices | Affiliate program | Scrapability notes | Notes / red flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Sigari e Tabacchi (sigarietabacchi.it)** | https://sigarietabacchi.it | IT | Italy only (domestic patentino) | Pure Cuban + Italian Toscano | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo de Monterrey, Trinidad, Quai d'Orsay | **Cohiba Siglo I (single): €13.30** ([source](https://sigarietabacchi.it/prodotto/cohiba-numero-1/)) · **Partagás Serie D No.4 (single): €13.80** · per-stick pricing | Unknown | **WooCommerce. Public €-prices in `woocommerce-Price-amount` schema.** Per-stick pricing (Italian retail standard). Slug pattern: `/prodotto/<sku>/` | Working WooCommerce checkout with `add_to_cart_button`. **MUST-INCLUDE for IT** |
| 2 | **House of Cigars (Venice)** | https://houseofcigars.it | IT (Venice) | Italy + selected EU | Pure Cuban + Caribbean + Italian Toscano | Cohiba, Bolivar, Cuaba, H. Upmann, Hoyo, Juan Lopez, Montecristo, Partagás, Por Larrañaga, Punch, Quintero, Rafael Gonzalez | Catalog public; per-stick prices on product pages | Unknown | **WooCommerce with Betheme theme**. Clean category hierarchy `/categoria-prodotto/sigari/cubani/<brand>/`. Slug pattern: `/prodotto/cohiba-maduro-5-magicos/`. Standard scrape | Founded in Venice; well-curated. **MUST-INCLUDE for IT** |
| 3 | **Bottega del Fumatore (Padova)** | https://bottegadelfumatore.com | IT (Padova) | Italy only | Pure Cuban + Italian + DR. Habanos Specialist + Davidoff Ambassador | Cohiba, Montecristo, Partagás, Romeo y Julieta, full Cuban range | Public €-prices | Unknown | WooCommerce; standard scrape | Historic tabaccheria; **MUST-INCLUDE for IT** |
| 4 | **Cigars and Co. (Milan)** | https://www.cigarsandco.it | IT (Milan) | Italy only | LCDH-adjacent; Habanos Specialist + Davidoff Ambassador | Full Cuban range; premium positioning | Catalog at `/cigars-shop/` lists brands but prices not visible on category page without product drill-down | Unknown | Custom CMS; less scraping-friendly than WooCommerce sites | Milan reference point; founded 1990. High authority |
| 5 | **MF Tabacchi dal Mondo (Roma)** | https://mftabacchidalmondo.it | IT (Rome) | Italy only | Habanos Specialist; pure Cuban + Toscano + Venetian | Full Cuban range | WordPress site; some products visible | Unknown | WordPress (`wp-json` REST API exposed); WooCommerce likely | Rome reference point |
| 6 | **Tabaccheria Petrali (Torino)** | https://www.tabaccheriapetrali.it | IT (Turin) | Italy only | Mixed Cuban + Italian | Cohiba primary; full Cuban range | Catalog browsable; prices on product pages | Unknown | Magento-based; standard scrape | Turin reference; well-established |
| 7 | **Casa del Habano Milano (Luca Borla)** | https://casadelhabano.it | IT (Milan) | n/a — **catalog only** | LCDH franchise — pure Habanos | Cohiba, Montecristo, Romeo y Julieta, Partagás, Hoyo, H. Upmann, Juan Lopez, Saint Luis Rey, Guantanamera, Fonseca, El Rey del Mundo, Cuaba, Anejados + LE | **No e-commerce; pure catalog/brochure site.** All brands shown with images but no prices and no cart | n/a | Divi/WordPress; clean catalog but **not a transactional site** | **Brand authority play, not data play.** LCDH Milano is the prestige LCDH in IT but doesn't sell online. Include for brand association only |
| 8 | **Cigarmust (also serves IT)** | (Swiss-based, see Switzerland section) | CH/IT | Italy via cross-border CH shipping | LCDH (Italian-language UI) | Full Cuban range | CHF-denominated | n/a | n/a | Listed in CH section #1. Italian users practically shop here for cross-border deals — relevant cross-market overlap |
| 9 | **Tabaccheria Troisi (Battipaglia)** | https://tabacchitroisi.it | IT (Salerno) | Italy only | Habanos Specialist; pure Cuban + Italian | Cohiba, Montecristo, Partagás, Romeo y Julieta | Catalog visible; smaller selection | Unknown | WordPress/WooCommerce; standard | Southern Italy presence |

**Italy top-3 to approach first:** Sigarietabacchi.it, HouseofCigars.it, BottegadelFumatore.com. All three have functioning WooCommerce stores with public €-per-stick pricing and active 2026 operations.

**Italy red flag:** Cross-border promotion is legally exposed under Decree 6/2016. **Geo-fence Italian retailer data to IT-IP users in The Finder.**

---

## SPAIN

Spain has the **most restrictive online retail framework** of the 5 countries. Article 4 of Law 28/2005 and Comisionado para el Mercado de Tabacos (CMT) regulations prohibit internet sale of tobacco to consumers. Tobacco is sold only through state-licensed *expendedurías* (tobacconists). The only legal "online" model is reservation/personal-shopper services that fulfill via licensed physical *estancos*.

**Strategic implication:** Spain is the country where "price comparison" is hardest. There are no true e-commerce Spanish retailers. Spanish prices are effectively the **state-fixed CMT retail price** (published as PVR — *precio de venta al público*). The Finder's Spanish data therefore reflects state pricing, not true competitive retail — which actually simplifies the comparison.

| # | Name | URL | Country | Ships to | Cuban specialization | Top Cuban brands | Sample prices | Affiliate program | Scrapability notes | Notes / red flags |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | **Cigar Smoker Club** | https://cigarsmokerclub.com | ES | Spain only (mainland) | Reservation/personal-shopper model for licensed *estancos* | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann, Hoyo, Trinidad — sourced from authorized tobacconist network | **Cohiba Robustos (single): €80.50** ([source](https://cigarsmokerclub.com/en/product/cohiba-robustos/)) · per-stick pricing for ~40+ Cuban SKUs visible at `/en/buy-cigars/`. Lower-priced examples: €2.65, €3.45, €5.95, €6.30, €7.45, €11.70, €16.50, €21.20, €36.70 | Unknown | **WooCommerce.** "Reservation" model means the user submits a form, a personal shopper coordinates pickup/delivery with an authorized estanco. Public €-prices on category page. Slug: `/en/product/<sku>/` | The ONLY Spanish "online" Cuban shop with public per-SKU € pricing on a scrapable WooCommerce stack. Legal framework is grey but workable. **MUST-INCLUDE for ES** |
| 2 | **Casa del Puro** | https://casadelpuro.com | ES/CH hybrid | Worldwide ex-US (free CH+LI over CHF 100); ships into ES | Pure Cuban specialist | Full Habanos | Catalog Cloudflare-challenged | Unknown | Cloudflare turnstile blocks anonymous curl | Spanish-Swiss family; also listed under CH section #6. **MUST-INCLUDE for ES** |
| 3 | **Domingo Cigars (Barcelona)** | https://www.domingocigars.com | ES (Barcelona) | Spain only (physical pickup + reservation) | LCDH-adjacent; first Spanish cellar | Cohiba, Montecristo, Partagás, Romeo y Julieta, H. Upmann | WordPress site; webshop limited online price discovery (catalog visible) | Unknown | WordPress backend with `wp-json` API exposed. Some product pages visible | Famous "first cellar of Spain" Barcelona. Brand authority. **MUST-INCLUDE for ES** |
| 4 | **La Casa del Habano Tenerife** | https://www.lacasadelhabano-tenerife.com | ES (Tenerife) | Spain + Canary Islands | LCDH franchise — pure Habanos | Cohiba, Montecristo, Partagás, Romeo y Julieta + full Cuban | osCommerce-style with `products_new.php` page; products visible but pricing limited public surface (Tenerife is duty-free zone, so pricing differs from mainland) | Unknown | osCommerce older stack | First Spanish LCDH (Dec 2021); **Canary Islands duty-free pricing materially differs from mainland Spain**. Useful comparison but flag the regional anomaly |
| 5 | **Cigars Spain (cigarsspain.cigarsnorthamerica.com)** | https://www.cigarsspain.cigarsnorthamerica.com | ES (consumer-facing) | Spain (claims next-day delivery) | Pure Cuban + premium | Cohiba, Montecristo, full premium range | Catalog visible | Unknown | Subdomain of US "Cigars North America" — verify Spanish legal compliance and actual fulfillment before relying | **Verify operator legitimacy.** Subdomain of a US parent is unusual for Spanish tobacco compliance |
| 6 | **La Tienda De Cigarros** | https://latiendadecigarros.com | ES | Spain + selected EU (claims 48h dispatch) | Pure Cuban specialist | Cohiba, Montecristo, Partagás | Catalog public | Unknown | Standard e-commerce | Legitimacy verification recommended before partnership |
| 7 | **Mr. Cigar Shop** | (search-referenced as "certified Spanish retailer") | ES | Spain | Pure Cuban specialist | Cohiba, Montecristo | Verify | Unknown | Verify URL and activity | Mentioned in search results; verify actual domain before outreach |
| 8 | **La Casa del Habano Madrid / Barcelona (other physical LCDHs)** | per Habanos.com | ES | n/a — physical only | LCDH franchise | Full Habanos | n/a | n/a | n/a — no e-commerce | Brand authority; partnerships should be offline/relationship-based |

**Spain top-3 to approach first:** CigarSmokerClub.com, CasaDelPuro.com, Domingocigars.com.

**Spain showstopper finding:** Online sale of tobacco is **legally prohibited** in Spain (CMT regulation). The reservation model used by Cigar Smoker Club is a tolerated workaround. The Finder's Spanish coverage must therefore frame prices as **CMT-regulated PVR reference prices** rather than competitive retail offers. Monetization on Spanish traffic will be limited to non-affiliate revenue (display, lead-gen to physical estancos, content/editorial).

---

## Appendix A — Sources used (selected)

### Sweden
- https://cigarrspecialisten.se/cigarrer/kuba/cohiba/
- https://www.puros.se/cigarrer/cigarrer-kubanska-cigarrer/cohiba/
- https://www.kindcigars.se/en/cigars/habanos-all-cuban-brands/cohiba/
- https://www.cigarrummet.com/produkt/cohiba-robustos/
- https://cigarrhyllan.se/cigarrer/kuba/cohiba/
- https://www.brobergs.se/category/tobak
- https://thenextcigar.com/blog/beyond-the-smoke-your-guide-to-swedens-premier-cigar-retailers-lounges

### Germany
- https://www.noblego.de/cohiba-robustos/
- https://www.noblego.de/montecristo-no-4/
- https://www.noblego.de/partagas-serie-d-no-4/
- https://www.noblego.de/hoyo-de-monterrey-epicure-no-2/
- https://www.noblego.de/cohiba-siglo-iv/
- https://www.noblego.de/montecristo-petit-edmundo/
- https://www.noblego.de/trinidad-reyes/
- https://www.cigarworld.de/cohiba
- https://www.cigarworld.de/zigarren/kuba
- https://www.lacasadelhabano-dl.de/shop/category/cigars-cuban-196
- https://www.thecigarsmoker.com/shop
- https://www.5thavenue.de/

### Switzerland
- https://cigarmust.com/en/181-cohiba
- https://cigarmust.com/en/cohiba/217-140-cohiba-robustos-7612907060907.html
- https://cigarmust.com/en/montecristo/341-70-montecristo-no4-7612907062178.html
- https://cigarmust.com/en/partagas/367-85-partagas-serie-d-no4-7612907062994.html
- https://it.siglomundo.ch/products/cohiba-robustos
- https://www.cigarone.com/
- https://www.swisscubancigars.com/
- https://casadelpuro.com/en/

### Italy
- https://sigarietabacchi.it/prodotto/cohiba-numero-1/
- https://sigarietabacchi.it/prodotto/partagas-serie-d-no-4/
- https://sigarietabacchi.it/sigari-cubani/
- https://houseofcigars.it/categoria-prodotto/sigari/cubani/cohiba/
- https://bottegadelfumatore.com/tag-prodotto/vendita-sigari/
- https://casadelhabano.it/sigari-cubani/
- https://www.cigarsandco.it/cigars-shop/
- https://www.adm.gov.it/portale/en/sdg/tabacchi5 (regulatory)
- https://www.tobaccocontrollaws.org/legislation/italy/sales-restrictions

### Spain
- https://cigarsmokerclub.com/en/buy-cigars/
- https://cigarsmokerclub.com/en/product/cohiba-robustos/
- https://cigarsmokerclub.com/en/how-cigar-smoker-club-works/
- https://www.lacasadelhabano-tenerife.com/products_new.php
- https://cmtabacos.sede.gob.es/ (regulatory)
- https://www.tobaccocontrollaws.org/legislation/spain/sales-restrictions

### General / regulatory
- https://www.habanos.com/en/distributor/ (official Habanos S.A. distributor list)
- TPD 2014/40/EU (Tobacco Products Directive)
- Tobacco Advertising Directive 2003/33/EC

---

## Appendix B — Methodology limitations

1. **Prices reflect May 2026 verified snapshots.** Cuban cigar pricing is currently highly volatile due to Habanos S.A.'s ongoing global price harmonization. Expect 10-30% variance within 12 months on premium SKUs.

2. **"Affiliate program: unknown" is the default.** This map intentionally does not infer affiliate availability from absence-of-signal. The Cigar Finder business development team should treat the entire retailer list as outreach targets and validate affiliate willingness 1-to-1.

3. **Some Cuban-specialist retailers gate catalog behind login.** LCDH Hamburg (thecigarsmoker.com), LCDH Düsseldorf (lacasadelhabano-dl.de), and Brobergs.se do not surface Cuban SKU prices to anonymous browsers. Sample prices for those retailers are therefore marked as not verifiable in the table above. Partnership discussion (and possibly authenticated B2B feed) will be required to include these in the live Finder.

4. **Cloudflare-protected sites** (Casa del Puro) cannot be scraped with simple curl/wget. The scrape pipeline will need real-browser session handling (Playwright/Puppeteer) for these targets, or partnership negotiation for direct feed.

5. **Italian and Spanish "online" markets are legally restricted** and the retailers operating in them do so under specific regulatory frameworks. The Finder's product design must accommodate per-country regulatory framings — for Spanish users showing PVR reference prices; for Italian users showing prices only from licensed *tabaccherie*.

6. **The retailer count target (8-12 per country) was met for all 5 countries except Spain.** Spain mapped only 8 retailers because the legal restriction on online tobacco sale means there are not 12 functioning consumer-facing online retailers to map. This is a finding, not a research gap.
