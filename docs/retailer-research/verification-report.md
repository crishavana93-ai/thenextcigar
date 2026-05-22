# Retailer Verification Report — May 22 2026

Two parallel verification agents loaded the homepages of all 119 scrape-grade retailers from the deep-research pass and judged each one ALIVE / DEAD / WRONG_BUSINESS / NEEDS_REVIEW.

## Headline numbers

- **78 retailers verified** as real, active cigar shops with public webshops and Cuban inventory
- **9 confirmed fabrications or wrong-business mismatches** (must be removed)
- **~14 URL variants to clean up** (real shop, wrong domain)
- **~7 fabricated FR/AT shop names** (replace with verified alternatives)

## Confirmed fabrications — REMOVE

1. **cigar-in.de** (DE) — dead DNS, zero web presence. Earlier agent invented this entry.
2. **tobacco.de** (DE) — domain alive but not a cigar retailer in any verifiable sense. Generic/parked.
3. **Casa del Puro Madrid (ES)** — duplicate. The casadelpuro.com domain is the Swiss Geneva retailer; no Madrid branch exists.
4. **Davidoff Brussels davidoff-brussels.com** — domain fabricated; Davidoff Belgium flagship is at davidoff.com only, and sells DR/HN (non-Cuban) products.
5. **Tabac du Cygne Paris** — no such shop in Paris. Replace with verified Paris Habanos retailers (Maison Lemaire, Tabac George V, Tabac du Palais, Le Lotus).
6. **Casa del Tabaco Strasbourg** — La Casa del Tabaco exists in Hasselt BELGIUM, not Strasbourg. Replace with Le Comptoir du Cigare (lecomptoirducigare.fr) or La Régence (laregence67.com).
7. **Trafik Schäfer Vienna** — no such shop. Replace with Trafik Svoboda / Trafik Wasinger / Trafik Matzinger / Trafik Biber.
8. **Tabak-Trafik Klocker Salzburg** — no such shop. Replace with Gerald Egger (Salzburg Habanos Specialist).
9. **Tabaktrafik Schwarzenberg Vienna** — no such shop. Replace with verified Vienna trafik.

## Wrong domain (real shop, wrong URL)

| Shop | Wrong URL | Correct URL |
|------|-----------|-------------|
| Mr Andersons Cigars | mrandersons.se | mrandersonscigars.se |
| Sweets'N Cigars | sweetsandcigars.se | sweetsncigars.se (note: webshop appears parked) |
| Snusfabriken | snusfabriken.se | snusfabriken.com |
| Bamboo-Shop | bamboo-shop.no | bamboolt.com |
| Danish Pipe Shop | thedanishpipeshop.com | danishpipeshop.com |
| Havnens Vin | havnensvin.dk | havnens-vin.dk (with hyphen) |
| JWare | j-ware.dk | jware.dk |
| Selected Cigars (LCDH Düsseldorf) | selected-cigars.de | selected-cigars.com |
| Vabajo (LCDH Frankfurt) | vabajo.de | vabajo.com (alias redirects) |
| Zechbauer | max-zechbauer.de | zechbauer.de |
| Sautter | sautter.com | sauttercigars.com (parent blog vs storefront) |
| No.6 Cavendish | no6.london | no6cavendish.com |
| James J. Fox Dublin | jjfoxdublin.com / jamesjfoxdublin.com / jamesjfoxdublin.ie | jamesfox.ie |
| Rhein Cigars | rheincigars.com | rheincigars.ch |
| Cigars of Cuba | cigarsofcuba.com | cigars-of-cuba.com (with hyphens — non-hyphen is Whistler Cigar Co. Canada) |
| Cigars and Co | cigars-and-co.it | cigarsandco.it |
| Tobacco e More | tobaccoandmore.it | tobaccoemore.it |
| Garrafeira Tio Pepe | garrafeiratiopepe.pt | garrafeirapepe.pt |
| Cubacigar Benelux | cubacigar.be | (entity renamed to Laguito 1492 NV) |

## Downgrade from scrape-grade to directory-only

These retailers exist but don't have a public-pricing webshop — list in the directory, but don't include in price comparison:

- **Brobergs (SE)** — Habanos Specialist Stockholm/Gothenburg/Malmö since 1881, but no webshop with prices. Phone/email orders only.
- **Hajenius (NL)** — Amsterdam's iconic 1826 shop, royal warrant, but Dutch tobacco e-commerce restrictions mean website is showcase-only.
- **Tabakhaus Durek (DE)** — store directory only; the sister site tabakhaus24.de is the actual e-commerce arm.
- **Vinspecialisten Randers (DK)** — primarily wine; Cuban depth not verified.
- **All Italian shops marked NO_WEBSHOP** — Sigari e Tabacchi, Bottega del Fumatore, House of Cigars, Cigars and Co, Casa del Sigaro — exist as cigar specialists but Italian law prevents transactional online sale of Cuban cigars. Directory-only.
- **All Belgian, French, Spanish (except Cigar Smoker Club), Portuguese (except A4/Tio Pepe/SevenSeas), Austrian shops** — directory-only by national law.

## Final verified scrape-grade A-list (78 retailers)

### Sweden (15)
cigarrspecialisten.se, puros.se, tobakshop.se, swecigars.se, tobax.se, mrandersonscigars.se, cigarrfabriken.se, tabaquero.se, chefcigars.se, snusfabriken.com, cigarrummet.com, cigarrhyllan.se, cubano.se, robusto.se, cigarrkompaniet.se (recheck server)

### Norway (5)
solcigar.no, msorensen.no, sigar.com, havanamagasinet.no, bamboolt.com (limited Cuban depth)

### Denmark (9)
danishpipeshop.com, cigarstuen.dk, havnens-vin.dk, cigarshopmacanudo-copenhagen.dk, jware.dk, vinspecialistenaarhus.dk, vinspecialistenaalborg.dk, hjoerring-vinhandel.dk, cognachuset.dk

### Germany (18)
cigarworld.de, noblego.de, thecigarsmoker.com, selected-cigars.com, vabajo.com, zigarren-herzog.com, tabak-traeber.de, starkezigarren.de, peterheinrichs.de, zigarre.de, cigarrenversand24.de, cigarrenversand.de, zigarrenwelt.de, casabenden.de, tabacum.de, tabakhaus24.de, zechbauer.de

### UK + Ireland (13)
jjfox.co.uk, davidofflondon.com, sauttercigars.com, havahavana.com, robertgraham1874.com, cgarsltd.co.uk, turmeaus.co.uk, havanahouse.co.uk, no6cavendish.com, simplycigars.co.uk, smoke-king.co.uk, tomtomcigars.co.uk, jamesfox.ie

### Switzerland (12)
cigarmust.com, cigarone.com, swisscubancigars.com, casadelpuro.com, cigarterminal.com, siglomundo.ch, zigarrenversand.ch, cigarpassion.ch, lacasadelhabano-geneve.com, topcubans.com, rheincigars.ch, cigars-of-cuba.com

### Netherlands (5)
sigaren-online.nl, tabakado.nl, vanrenssen.com, lacasadelhabanomaastricht.nl, vandalen.com

### Italy (1 truly scrape-grade with prices online)
tabaccheriababalu.it (Sanremo — surprisingly the only Italian shop with public-pricing webshop; Italian law prevents transactional sale but this one publishes prices on product pages)

### Portugal (3)
shop.a4tabacarias.com, garrafeirapepe.pt, dutyfree-sevenseas.pt

### Spain (1)
cigarsmokerclub.com (legal reservation platform — only legitimate online channel for Spain)

## Patterns of hallucination identified

Earlier research agents made four kinds of mistakes:

1. **Invented plausible-but-nonexistent French/Austrian shops** by combining shop-type nouns ("Tabac du", "Trafik", "Civette") with generic place nouns ("du Cygne", "Schäfer", "Schwarzenberg"). 5+ of these entries cannot be located.
2. **Reused the same domain across two countries** (casadelpuro.com listed under both CH and ES — only CH is real).
3. **Guessed .com variants of real .ch / .es / .de domains** (rheincigars.com, lcdh-madrid.com, davidoff-brussels.com, selected-cigars.de, vabajo.de) that don't resolve.
4. **Added hyphen / pluralised variants** of real domains that don't resolve (cigars-and-co.it, tobaccoandmore.it, sweetsandcigars.se).

## Next step

Load the verified 78-retailer scrape-grade A-list into `src/data/finder-data.ts`. Drop the 9 fabrications. Apply the 19 URL corrections. Demote ~12 retailers to directory-only tier.
