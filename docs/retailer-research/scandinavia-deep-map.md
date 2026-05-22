# Scandinavia Cigar Retailer Deep Map — REAL Research (May 2026)

> Replaces the earlier draft that had extrapolated SE/NO/DK numbers. All five countries now backed by independent deep-research agents.

| Country | Verified directory | Scrape-grade | LCDH | Habanos Specialist | Notes |
|---------|--------|--------------|------|---------------------|-------|
| Sweden  | **41** | **12-17** | **0** confirmed | 8 (Habanos Specialist tier per habanos.com) + 4 LCDH-listed retailers | Habanos Nordic / Elite Trading Scandinavia AB sole importer; Lag 2018:2088 §4 promotion ban; **Mellgren's bankrupt Oct 2022 — exclude** |
| Norway  | **23** | **5-6** | 0 | **2** — Sol Cigar Co. (Oslo, since 2017) + Havana-Magasinet (Stavanger, since 1899) | **Jan 1 2026 cross-border distance-sale ban** (Tobakksskadeloven §21b) — kills EU-arbitrage for Norwegians |
| Denmark | **22** (19 + 3 hotels) | **8-10** | **1 LCDH + 1 LCDH-class + 3 HS = ~5 official accounts** | 5+ | April 2021 display-image ban + Oct 2024 MitID payment gate; **W.Ø. Larsen closed Dec 31 2004 (not 2005)**; **Faraos Cigarer is a comics shop, NOT a tobacconist — exclude** |
| Finland | **7** | **0** | 1 (Havanna-Aitta Helsinki, since 1897) | 2 (incl. Töölön Sikarikauppa) | All online cigar sale **illegal** (Tobacco Act §65); Finnish "websites" are brochure-only; pricing must be hand-entered |
| Iceland | **4** (3 retailers + ÁTVR state monopoly) | 1-2 (Vindill + ÁTVR catalog) | 0 | 1 (Björk Tóbaksverslun Reykjavík) | Cross-border banned; **domestic online via Vindill loophole only** (non-Cuban specialist); ÁTVR sets national reference price |
| **TOTAL** | **97** | **26-35** | **5+** official | **18+** | |

## Sweden — 41 verified retailers

**Top scrape targets** (ranked by stack quality + catalog breadth):

1. **Cigarrspecialisten.se** (Växjö) — WooCommerce + LCDH-listed + 500+ SKUs
2. **Puros.se** (Stockholm) — Magento, broadest Habanos catalog
3. **Tobakshop.se** — WooCommerce, clean Habanos category routing
4. **Swecigars.se** (Södertälje) — Shopify, easy `/products.json` diff
5. **Tobax.se** — Shopify
6. **Sweets'N Cigars** (Gothenburg) — WooCommerce; stepped into Mellgren's vacuum
7. **Mr Andersons Cigars** — WooCommerce, direct Habanos Nordic relationship
8. **Cigarrfabriken.se** (Sundbyberg/Stockholm) — WooCommerce
9. **Tabaquero.se** — WooCommerce
10. **Chefcigars.se** — WooCommerce
11. **Cigarrkompaniet.se** — WooCommerce
12. **Snusfabriken.com** (Haparanda border-trade) — WooCommerce; Cohiba small-format depth
13. **Brobergs.se** (Stockholm/Göteborg/Malmö, founded 1881) — Magento; needs JS rendering
14. **Cigarrummet.com** (Stockholm Stureplan) — custom PHP; 35-yr heritage
15. **Cigarrhyllan.se** (Stockholm Johanneshov) — custom .NET; Habanos Specialist
16. **Cubano.se** (Linköping) — OpenCart; **operated by Habanos Nordic proprietor Ralph Wester** — benchmark anchor
17. **Robusto.se** — custom .NET; best Habanos editorial content among SE shops

**Top Habanos Specialists (per habanos.com directory)**: Roberts Tobak (Stockholm), Fram-Cigarr (Stockholm), Brobergs Stockholm + Gothenburg, Cigarrspecialisten Växjö, Zigge Zigarett (Lund), Sweets'N Cigars (Gothenburg), Sundsvalls Tobaksaffär, Kind Cigars (Helsingborg), Cigarrlagret (Uråsa), Linköpings Cigarrhandel, Malmö Cigarr, Den Anspråkslösa Cigarraffären (Malmö).

**EXCLUDE — confirmed defunct/wrong**:
- Mellgren's Fine Tobacco (Gothenburg) — bankrupt Oct 2022
- Habanos Nordic AB — **rebranded Elite Trading Scandinavia AB** in 2025 (still at August Barks gata 30, Västra Frölunda — distributor, not retail)
- Stockholms Cigarr Lounge (Älvsjö) — non-profit lounge, not a retailer
- Cigarrkungenshus (Åhus) — B&B, not retail
- Tektor Cigars (Gotland) — Honduran tobacco, not Cuban

## Norway — 23 verified retailers

**Top scrape targets**:

1. **solcigar.no** (Oslo) — Habanos Specialist #1 since 2017; clean .NET URLs `/Kategori/1307/Habanos`; deepest Cuban catalog
2. **havanamagasinet.no** (Stavanger) — Habanos Specialist #2 since 1899; WooCommerce; no product images (NO display law)
3. **msorensen.no** (Asker HQ, national B2C) — WooCommerce; broad Cohiba/Montecristo
4. **store.augusto.no** (Oslo Tollbugata 19) — `/nettbutikk/Sigarer/Cubanske` stable URL; only dedicated cigar lounge in Oslo
5. **bamboolt.com** (Trondheim) — custom; clean `/butikk/sigar`
6. **sigar.com / Viking Cigars** (Risør HQ) — Norway's largest cigar inventory by revenue (10M NOK)

**CRITICAL — Jan 1 2026 cross-border distance-sale ban**: Norwegians may not legally order tobacco from foreign retailers via internet/phone/post. Norwegian Customs (Tolletaten) detains and destroys non-compliant parcels with no compensation. The Finder's Norway view must restrict comparison to Norwegian-domiciled retailers.

## Denmark — 22 verified retailers (19 retail + 3 hotels)

**Top scrape targets**:

1. **danishpipeshop.com** (Copenhagen) — deepest Cuban tree at `/l/cigars/Habanos-`; DK + EN locales
2. **cigarstuen.dk** — Shopify (`/products.json` + `/collections/`); best velocity per request
3. **havnens-vin.dk** (Vejle) — Magento 2 with `/cigar/cohiba.html`-style URLs; 200+ SKUs
4. **cigarshopmacanudo-copenhagen.dk** — STG flagship (Davidoff + LCDH for Cubans); canonical DK reference price
5. **jware.dk** — WordPress/WooCommerce + EN mirror; deep Cuban catalog
6. **vinspecialistenaarhus.dk** (Pibehuset) — osCommerce; first 2014 HS cohort
7. **vinspecialistenaalborg.dk** — WooCommerce
8. **vinspecialistenranders.dk** — `/shop/316-cigarer-habanos/`
9. **hjoerring-vinhandel.dk** (Nordjylland) — clean `/cigarer/cubanske-cigarer/` tree; **post-April 2021 displays name + price ONLY, no images**
10. **cognachuset.dk** — `/shop/cohiba-40c1.html` URL; same-day shipping

**Three LCDH-tier accounts**:
- Cigar Shop Macanudo Copenhagen (Silkegade 23) — STG-owned, "Casa del Habano status" per Cigar Aficionado
- Hj Hansen Vinspecialisten Odense — first DK Habanos Specialist 2014
- Kloster Piben (Helsingør Sudergade 34) — LCDH per Cuban Cigar Group

**EXCLUDE — confirmed**:
- W.Ø. Larsen — closed Dec 31 2004 (existing notes said 2005 — off by one year)
- Faraos Cigarer — comics shop pun on Tintin's "Cigars of the Pharaoh"; zero tobacco
- Cigarkompagniet.dk — dormant; SMS-only contact

## Finland — 7 retailers, ZERO scrapable

Online sale of tobacco illegal under Tobacco Act §65. Finnish "websites" are brochure-only. Pricing must be hand-entered from Habanos Nordic suggested retail.

- Havanna-Aitta Oy (Helsinki Kasarmikatu 23) — Finland's oldest tobacconist 1897, only LCDH-tier in FI
- Töölön Sikarikauppa (Helsinki Töölönkatu 32)
- Hempsteri (Helsinki Kallio, Facebook only)
- Turun Tupakkakauppa (Turku, since 1926)
- Tampereen Tupakkakauppa (sister chain)
- Tupakkakauppa Åbong (Tampere)
- Tupakka-Aitta Oulu

## Iceland — 4 entries

- **Björk Tóbaksverslun** (Reykjavík Síðumúla 13) — Habanos Specialist, brochure site
- **Vindill** (vindill.is) — **ONLY legal cigar webshop in Iceland**; non-Cuban specialist (Casdagli/Lampert distributor); domestic-only; **scrapable**
- **Tobacco Shop Reykjavík** (Bankastræti 6) — multi-brand physical, no website
- **ÁTVR / Vínbúðin** (vinbudin.is) — state monopoly importer + 51 nationwide stores; published catalog **scrapable**; serves as national reference price

## Total scrape-grade Block 4 targets across Scandinavia

**26-35 retailers** with public webshops + structured pricing + Cuban inventory:

- SE: 12-17 (Cigarrspecialisten, Puros, Tobakshop, Swecigars, Tobax, Sweets'N, Mr Andersons, Cigarrfabriken, Tabaquero, Chefcigars, Cigarrkompaniet, Snusfabriken, Brobergs, Cigarrummet, Cigarrhyllan, Cubano, Robusto)
- NO: 5-6 (Sol Cigar, Havana-Magasinet, M Sørensen, Augusto, Bamboo-Shop, Sigar.com)
- DK: 8-10 (Danish Pipe Shop, Cigarstuen, Havnens, Cigar Shop Macanudo, JWare, Vinspecialisten x3, Hjørring, Cognachuset)
- FI: 0 (legally impossible)
- IS: 1-2 (Vindill + ÁTVR catalog)
