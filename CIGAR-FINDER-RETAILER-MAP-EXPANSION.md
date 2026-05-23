# Cigar Finder – European Retailer Map Expansion

**Date:** 2026-05-22
**Scope:** Cuban (Habanos) cigar retailers in European markets outside the 5 already-mapped countries (SE, DE, CH, IT, ES).
**Method:** WebSearch + WebFetch reconnaissance only. Prototype-grade, not exhaustive.

---

## Executive Note (~95 words)

The UK and Benelux dominate online Cuban-cigar commerce in Europe — most have modern Shopify/Magento storefronts, public pricing, and EU shipping. **France is a structural blocker:** French law forbids online tobacco sales, so even iconic shops (À La Civette, Boutique 22) operate brochure-only sites — no scrapable pricing. **Luxembourg LCDH** is similarly offline-only. **Nordics (NO/FI/DK)** are dominated by Habanos Nordic AB's network; most retailers expose a catalogue but block online purchase. **CEE coverage is thin** outside LCDH Prague; many Eastern European stockists are wholesale-style with login-walled pricing. Expect ~60% of retailers to be scrapable without Playwright.

---

## Retailer Table

### United Kingdom

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| JJ Fox (James J. Fox) | https://www.jjfox.co.uk/ | London | UK / EU / worldwide (age-gated) | LCDH franchise (at Harrods) + Habanos Specialist | Cohiba, Montecristo, Partagas, Romeo y Julieta, Hoyo de Monterrey, Trinidad | price not publicly visible without account on some SKUs; many singles £25–£60 listed publicly | Magento-style; age-gate modal; mostly static HTML, scrapable | https://www.jjfox.co.uk/cigars/country/cuban-cigars.html |
| Sautter Cigars | https://www.sauttercigars.com/ | London (Mayfair) | UK / worldwide | Habanos Specialist (Mount Street) | Cohiba, Trinidad, Partagas, Bolivar, Hoyo, Vintage Cubans | price not publicly visible (many aged stocks "POA") | Shopify-style storefront; light age-gate; scrapable | https://www.sauttercigars.com/ |
| Davidoff of London | https://www.davidofflondon.com/ | London (St James's) | UK / EU | Habanos Specialist + Davidoff Appointed Merchant | Cohiba, Montecristo, Partagas, H. Upmann | price not publicly visible | Likely static HTML / WP; needs verification | https://www.cigaraficionado.com/article/a-coterie-of-aged-cuban-cigars-from-u-k-distributor-hunters-frankau |
| C.Gars Ltd / Turmeaus | https://www.cgarsltd.co.uk/ , https://www.turmeaus.co.uk/ | Liverpool / nationwide | UK / EU / worldwide | Habanos Specialist (multi-store) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Bolivar, Punch | many Cubans price-visible (singles £20–£80, boxes £400–£3,000); aged stocks POA | Classic ASP/PHP store, static HTML; very scrapable; no JS shell | https://www.turmeaus.co.uk/cigars-cuban-cigars-c-325_52.html |
| Havana House | https://www.havanahouse.co.uk/ | Cheshire HQ + 10 UK shops | UK / EU | Habanos Specialist | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad, Vegueros | prices public on most singles & boxes | WooCommerce; standard product schema; scrapable | https://www.havanahouse.co.uk/product-category/cigars/cuban/ |
| Simply Cigars | https://www.simplycigars.co.uk/ | London | UK / EU | Habanos Specialist | Cohiba, Montecristo, Partagas, Romeo, Hoyo | prices publicly visible | osCommerce-style; static HTML; scrapable | https://www.simplycigars.co.uk/cuban-cigars-c-70.html |
| EGM Cigars | https://egmcigars.com/ | London | UK / EU / worldwide | Habanos Specialist | Cohiba, Trinidad, Partagas, Cuaba, Bolivar, Regional Editions | prices public; specialises in rare/aged | Shopify; scrapable | https://egmcigars.com/blogs/the-cuban-cigars-blog-by-egm-cigars/hunters-frankau-announces-new-regional-editions-for-the-uk-and-a-house-reserve-humidor |
| Havana Cigar Exchange | https://www.havanacigarexchange.com/ | London | UK / worldwide | Habanos Specialist | Cohiba, Cuaba, Hoyo, Partagas, Trinidad, vintage | prices public | Shopify; scrapable | https://www.havanacigarexchange.com/ |
| Cigars Unlimited | https://www.cigarsunlimited.co.uk/ | London | UK | Habanos Gold Medal Specialist | Cohiba, Montecristo, Partagas | price not publicly visible (brochure-leaning) | Light HTML; partial pricing | (Knightsbridge guide) https://knightsbridgeldn.co.uk/cigar-lounges-knightsbridge/ |

**UK distributor (reference, not a retailer):** Hunters & Frankau — https://cigars.co.uk/ — exclusive UK Habanos importer.

---

### Netherlands

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| P.G.C. Hajenius | https://www.hajenius.com/en/ | Amsterdam | NL / EU (limited) | Habanos Specialist (historic, est. 1826) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad | prices publicly visible on most SKUs | Modern PHP/CMS; multilingual; scrapable | https://www.hajenius.com/en/ |
| La Casa del Habano Maastricht | https://www.lacasadelhabanomaastricht.nl/ | Maastricht | NL (boutique focus) | LCDH franchise | Full LCDH Habanos range | price not publicly visible | Brochure WP site; not an e-com store | https://www.lacasadelhabanomaastricht.nl/us/about-us/ |
| La Casa del Habano The Hague | https://lacasadelhabano-thehague.com | The Hague | NL | LCDH franchise | Full LCDH Habanos range | price not publicly visible | WordPress brochure; not e-com | https://lacasadelhabano-thehague.com |
| La Casa del Habano Amsterdam (Conservatorium Hotel) | (linked via hotel; no standalone store) | Amsterdam | walk-in only | LCDH franchise | Full LCDH range | n/a | No online store | https://cigarsamsterdam.com/ |
| Van Lookeren | https://www.vanlookeren.nl/ | Amsterdam | NL | Habanos Specialist | Cohiba, Montecristo, Partagas | price not publicly visible | Likely WooCommerce; needs verification | https://cigarsamsterdam.com/ |
| G. de Graaff | https://gdegraaff.com/ | The Hague | NL / EU | Mixed (Habanos + Dutch dry-cured) | Cohiba, Montecristo, Partagas | prices visible on some SKUs | WooCommerce; scrapable | https://gdegraaff.com/product/g-de-graaff-cigars-cubanitos-havana/ |

---

### France

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| À La Civette | https://alacivette.com/ | Paris (157 Rue Saint-Honoré) | France only, in-store; **no online tobacco sales (illegal in FR)** | Habanos Specialist (est. 1716) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad, Bolivar (400+ refs) | price not publicly visible — French law prohibits | Brochure WP site; no e-com; **non-scrapable for prices** | https://alacivette.com/la-cave-a-cigares/ |
| Boutique 22 (Davidoff Paris) | (Davidoff brand site; boutique brochure only) | Paris (near Arc de Triomphe) | None (in-store only) | Habanos Specialist / Davidoff Appointed | Cohiba, Montecristo, Davidoff | price not publicly visible | Not an e-com | https://www.cigarinspector.com/cigar-library/where-to-buy-and-smoke-cigars-in-paris/ |
| Cave à Cigares de Saint-Sulpice | (no consolidated e-com URL found) | Paris | In-store only | Habanos Specialist | Cohiba, Trinidad, Partagas | price not publicly visible | Brochure / Facebook presence | https://www.cigarsmokers.com/nevermerely/regional/paris1.html |
| Coprova (distributor, reference only) | n/a | Paris | n/a | Official FR Habanos distributor | n/a | n/a | n/a | https://www.habanos.com/en/distributor/ |

**Country note:** French law bans online tobacco sales. Treat France as a discoverability/lookup country, not a price-comparison country. The cigarfinder.com analog cannot show live FR prices.

---

### Belgium

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| La Casa del Habano Antwerp | https://www.lcdhantwerp.com/ | Antwerp | BE / EU | LCDH franchise (Belgium's first) | Bolivar, Cohiba, Montecristo, Partagas, Romeo y Julieta, Hoyo, Trinidad (600+ refs) | prices publicly visible on most SKUs | WooCommerce; scrapable | https://www.lcdhantwerp.com/shop/cuban-cigars/cohiba/ |
| La Casa del Habano Brussels | https://lacasadelhabano.brussels/ | Brussels (Saint-Gilles) | BE / EU | LCDH franchise | Cohiba, Montecristo, Partagas, Trinidad, Limited Editions | prices publicly visible | Shopify; scrapable; collection endpoints clean | https://lacasadelhabano.brussels/collections/lcdh |
| La Casa del Habano Belgium (Knokke/De Loft) | https://www.lacasadelhabano-dl.be/ | Knokke / Brussels | BE | LCDH franchise | Full Habanos range | price not publicly visible (brochure-leaning) | WordPress brochure; partial e-com | https://www.lacasadelhabano-dl.be/ |
| Vandermarliere (J. Cortes group, reference) | https://www.cigarsfamily.com/ | Handzame | n/a — manufacturer, not retailer | Producer/distributor | Oliva (owned) + machine-made; not Habanos retailer | n/a | n/a | https://habanomag.com/cigar-shop-location/belgium/ |

---

### Austria

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| Tabak Wasinger Cigar Corner | (no standalone e-com) | Vienna (Hauptbahnhof, Icon Tower) | In-store only | Habanos Specialist | Cohiba, Montecristo, Partagas, Trinidad | price not publicly visible | No online shop confirmed | https://cubancigargroup.com/cigar-shop/tabak-wasinger-cigar-corner-e-u |
| Tabakfachgeschäft Nancy Friedenthal | https://cubancigargroup.com/cigar-shop/tabakfachgeschaft-nancy-friedenthal | Vienna (Weihburggasse 3) | Duty-free / EU | Habanos Specialist | Cohiba, Montecristo, Partagas, Romeo, Hoyo | duty-free pricing visible via Cuban Cigar Group portal | Aggregator; JS-light; scrapable | https://cubancigargroup.com/cigar-shop/tabakfachgeschaft-nancy-friedenthal |
| 5THAVENUE / Cigarworld.de (AT distributor) | https://www.cigarworld.de/ | Waldshut-Tiengen (DE) — supplies AT & PL | EU | Official AT/DE/PL Habanos importer's retail arm | All Habanos brands | prices publicly visible | Magento; scrapable (already in DE map likely) | https://www.cigarworld.de/en/zigarrenlexikon/kubanische-zigarren-kaufen |

**Note:** Austrian retail is largely in-store; the Cuban Cigar Group aggregator portal is the most scrapable proxy for AT pricing.

---

### Denmark

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| The Danish Pipe Shop | https://www.danishpipeshop.com/l/cigars/Habanos- | Copenhagen | DK / EU / worldwide | Mixed (Habanos + pipes) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad | prices publicly visible (singles DKK 80–600) | Custom CMS; mostly static HTML; scrapable | https://www.danishpipeshop.com/l/cigars/Habanos- |
| Davidoff – My Own Blend | https://davidoff.dk/ | Copenhagen (old town) | DK | Habanos Specialist + Davidoff | Cohiba, Montecristo, Davidoff | price not publicly visible | Brochure-style; partial e-com | https://www.cigarjournal.com/denmark-a-tobacco-nation-in-the-back-rooms/ |
| Macanudo (LCDH status) | (no dedicated e-com URL found; mostly in-store) | Copenhagen | DK | LCDH-status flagship | Full Habanos range (~60% of sales) | price not publicly visible | n/a | https://www.cigarjournal.com/denmark-a-tobacco-nation-in-the-back-rooms/ |

---

### Norway

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| Sol Cigar Co. | https://www.solcigar.no/ | Oslo (Henrik Ibsens gt 28) | In-store only; **no online cigar sales** | First Habanos Specialist in Norway (est. 1911) | Cohiba, Montecristo, Partagas, Romeo, Hoyo | price not publicly visible | Brochure WP; not e-com | https://cubancigargroup.com/cigar-shop/sol-cigar-co-a-s |

**Country note:** Norwegian tobacco laws + Habanos Nordic AB allocation rules limit online sales. Catalogue-only for now.

---

### Finland

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| Havanna-Aitta Oy | https://www.havanna-aitta.fi/ | Helsinki (Kasarmikatu 23) | FI (in-store focus) | LCDH franchise (est. 1897 — oldest in FI) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad | price not publicly visible (catalogue without prices) | Light HTML/WP; partial; needs Playwright if pricing surfaces post-login | https://www.havanna-aitta.fi/ |

---

### Portugal

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| Habanero (LCDH Lisboa) | http://www.habanero.pt | Lisbon (Parque das Nações) | PT | LCDH franchise | Full Habanos + Limited Editions | price not publicly visible | Brochure-leaning; partial e-com | https://lacasadelhabano.com/en/habanero-an-original-lcdh-in-lisboa-portugal/ |
| Casa Havaneza | (no consolidated e-com; multi-store) | Lisbon (Chiado, Amoreiras, Colombo) + Porto | PT | Habanos Specialist (est. 1864 — one of oldest in world) | Cohiba, Montecristo, Partagas, Romeo, Hoyo | price not publicly visible | Largely offline / Facebook presence | https://www.habanos.com/en/news/casa-havaneza-una-de-las-tiendas-de-puros-mas-emblematicas-y-antiguas-del-mundo-celebro-su-155-aniversario-en-belas-portugal-en/ |
| La Casa del Habano Porto | (LCDH portal page; no standalone e-com) | Porto (Rua Heróis e Mártires de Angola 81) | PT | LCDH franchise | Full Habanos range | price not publicly visible | Brochure | https://lacasadelhabano.com/en/la-casa-del-habano-porto-four-years-of-success/ |

---

### Czech Republic

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| La Casa del Habano Prague | http://www.lacasadelhabano.cz/en/ | Prague | CZ | LCDH franchise (largest walk-in humidor in CZ; 25+ Cuban brands) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad, Bolivar | price not publicly visible | Brochure-style; not full e-com | http://www.lacasadelhabano.cz/en/ |

---

### Poland / Hungary / Greece

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| (Poland) 5THAVENUE supplied retailers — best aggregated via Cigarworld.de | https://www.cigarworld.de/ | DE/PL | EU | Official PL importer's retail arm | Full Habanos | prices public | Magento — scrapable | https://www.cigarworld.de/en/zigarrenlexikon/kubanische-zigarren-kaufen |
| La Casa Del Habano Athens (Greece) | (LCDH portal listing) | Athens (K. Varnali 42, N. Erithrea) | GR | LCDH franchise | Full Habanos range | price not publicly visible | Instagram-heavy presence; no e-com | https://habanomag.com/cigar-shop/la-casa-del-habano-athens-greece/ |
| Cigars Galaxy (Greece) | https://www.cigarsgalaxy.gr/en/product-category/cigars/cuban-cigars/ | Athens | GR | Mixed (Habanos + New World) | Cohiba, Montecristo, Partagas, Romeo, Hoyo | prices publicly visible | WooCommerce; scrapable | https://www.cigarsgalaxy.gr/en/product-category/cigars/cuban-cigars/ |
| CigarSmoke (Greece) | https://cigarsmoke.gr/en/ | Athens / Thessaloniki / Mykonos | GR | Habanos Specialist | Cohiba, Montecristo, Partagas | prices publicly visible | WooCommerce; scrapable | https://cigarsmoke.gr/en/ |

**Note:** Hungary turned up no prominent standalone Habanos e-com — coverage is via aggregators (CigarsEurope.eu) and local tobacconists without scrapable pricing. Flag as gap.

---

### Ireland

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| James J. Fox Dublin | https://jamesfox.ie/ | Dublin (Grafton Street) | IE / EU (age-gated) | Habanos Specialist (only IE shop with Habanos certificate of authenticity; est. 1881) | Cohiba, Montecristo, Partagas, Romeo, Hoyo, Trinidad, Bolivar | prices publicly visible (e.g., Cohiba Robusto €40–€50 single typical) | **Shopify** — clean, very scrapable | https://jamesfox.ie/en-us/collections/cuban-cigars-selection |
| Decent Cigar Emporium | https://www.decent-cigar.com/ | Dublin (46 Grafton Street) | IE / outside IE via An Post | Habanos Specialist (mixed Cuban + New World) | Cohiba, Montecristo, Partagas, Romeo, Hoyo | prices publicly visible | Legacy osCommerce-style; static HTML; scrapable | https://www.decent-cigar.com/index.php/cPath/81 |

---

### Luxembourg

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| La Casa del Habano Luxembourg | https://www.lacasadelhabano.lu/ | Luxembourg City (22B avenue de la Porte-Neuve) | **In-store only — no shipping** | LCDH franchise (since 1994) | Full Habanos via LAGUITO 1492 (Benelux distributor) | price not publicly visible | Brochure WP site; not e-com | https://www.lacasadelhabano.lu/ |

---

### Monaco

| Name | URL | City | Ships To | Status | Top Cuban Brands | Sample Price | Scrapability | Source |
|---|---|---|---|---|---|---|---|---|
| Monte-Carlo Cigar Club (Dominique London / SBM) | (private-club, no public e-com) | Monte Carlo | n/a (private members) | Private club partnership | Full Habanos curated | price not publicly visible | No public storefront | https://www.cigars-connect.com/en/dominique-london-to-open-a-la-casa-del-habano-in-london/ |

**Note:** Monaco has no public-facing Habanos online retailer. Cigars on-property are served via SBM hotels/casinos and the Cigar Club. Skip from price-comparison; consider listing for discoverability.

---

## Summary Counts

| Country | Retailers documented |
|---|---|
| UK | 9 |
| Netherlands | 6 |
| France | 4 (none scrapable for price) |
| Belgium | 4 |
| Austria | 3 |
| Denmark | 3 |
| Norway | 1 |
| Finland | 1 |
| Portugal | 3 |
| Czech Republic | 1 |
| Poland/Hungary/Greece | 4 |
| Ireland | 2 |
| Luxembourg | 1 |
| Monaco | 1 |
| **Total** | **43** |

---

## Recommendations for Engineering

1. **Tier-1 scrape targets (clean Shopify/WooCommerce, public prices):** James J. Fox Dublin, LCDH Brussels, LCDH Antwerp, Hajenius, C.Gars/Turmeaus, Havana House, Simply Cigars, EGM Cigars, Havana Cigar Exchange, Sautter, Danish Pipe Shop, Cigars Galaxy GR, CigarSmoke GR.
2. **Tier-2 (catalogue only, Playwright or human curation):** JJ Fox UK (age-gate), Havanna-Aitta FI, LCDH Prague, LCDH Luxembourg, Casa Havaneza PT, Habanero PT, LCDH Athens, Sol Cigar NO.
3. **Skip from price-comparison engine (legal/structural):** France (online tobacco sales prohibited), Monaco (private), Luxembourg LCDH (in-store only).
4. **Gaps to fill later:** Hungary (no standout retailer found), Poland direct retailers (currently routed via Cigarworld.de), additional UK regionals (Robert Graham, Sahakian / Davidoff London standalone).
