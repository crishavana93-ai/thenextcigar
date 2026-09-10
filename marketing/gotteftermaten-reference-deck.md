# Gott Eftermaten — Visual Reference & Stack Deck

Companion to `gotteftermaten-pitch.md`. The pitch doc says **what** we're proposing and **how much**. This doc shows **what it will look like** and **what we're building on top of**.

Current site: https://www.gotteftermaten.se/sv/ — PrestaShop, Lato sans on white, payment currently disabled ("För tillfället har vi ingen betalningsmöjlighet online"). That last sentence is the lever.

---

## A. Reference sites — the visual language we steal

### Premium cigar + spirits e-commerce

**1. Davidoff of Geneva** — https://us.davidoffgeneva.com/shop
Full-bleed lifestyle hero, serif headline + sans body, brand-as-editorial product detail pages. Enterprise CMS. *Steal:* their PDP narrative pattern.

**2. The Macallan** — https://www.themacallan.com
Gold standard for "heritage luxury" — AKQA-designed system, classical serif + modern sans, motion-led storytelling. *Steal:* the aesthetic North Star.

**3. Casdagli Cigars** — https://casdaglicigars.com
Small-batch boutique cigar brand done right. Restrained palette, generous whitespace, product photography style for the Habanos Nordic range. WordPress/WooCommerce. *Steal:* the photography mood and PDP layout.

### Luxury heritage retailers (commerce + craft)

**4. Brunello Cucinelli** — https://www.brunellocucinelli.com
Warm cream/stone palette, Italian craftsmanship narrative, editorial-led PDPs. Just relaunched Jan 2026 on Callimacus (proprietary AI platform). *Steal:* typography + tonal restraint.

**5. Aesop** — https://www.aesop.com
The templated answer to "luxury minimal e-commerce." Long-form copy, single-column PDPs, almost no UI chrome. **Runs on Shopify Plus + Contentful headless** — directly relevant to our recommendation.

**6. Loro Piana** — https://www.loropiana.com
Cinematic-but-quiet PDP, full-bleed product video, fabric-detail close-ups. Salesforce Commerce Cloud. *Steal:* the lesson that the front-end sells, the platform is invisible.

### Nordic / European competitors

**7. Roberts Tobak** (Stockholm — LCdH) — https://www.robertstobak.se
Closest Swedish competitor that's an LCdH license holder. Sells Habanos Nordic-distributed Cubans, same range Gott Eftermaten carries. *Steal:* functional but visually thin — credible-but-beatable benchmark.

**8. Habanos Nordic** — https://www.habanosnordic.se
Official Cuban-cigar distributor's identity for the Nordics. *Steal:* the brand-system anchor for Habanos category landing pages — palette, badge usage, "where to buy" pattern.

---

## B. Templates — ready-to-buy compression

### Themeforest (WordPress / WooCommerce)
- **Plamen — Tobacco Store** (Edge-Themes/Qode) — https://themeforest.net/item/plamen-tobacco-store-theme/26551511 — ~$75 Regular / ~$3,400 Extended. Elementor + WooCommerce. Category-leader for tobacco on TF. Default skin needs reskinning — its "smoke shop" vibe ≠ Cucinelli.
- **Becka — Cigar Store Shopify Theme** — https://elements.envato.com (search Becka) — Envato Elements subscription ~$16.50/mo. Shopify-native, 5+ homepage demos, humidor/accessory layouts pre-built.
- **Smokio — Tobacco & Cannabis WordPress Theme** (Duck-Themes) — Themeforest ~$69. Backup.

### Framer
- **SOJA — Luxury Ecommerce Framer Template** — Framer Marketplace ~$79–$99. Editorial spacing, Shopify checkout integration. Most on-brand of the Framer set.
- **Clariel — Responsive Ecommerce Framer Template** — https://www.framer.com/marketplace/templates/clariel/ — ~$99. Built for jewellery; the editorial PDP translates one-to-one to cigars.

### Webflow
- **Levor — Webflow Ecommerce Template** — https://levor.webflow.io/ — ~$84. Luxury fashion baseline.
- **Wristy — Retail & E-Commerce Template** — https://webflow.com/templates/html/wristy-retail-website-template — ~$79. Watch-store DNA = humidor/accessory photography pattern.

### Shopify Plus (top pick)
- **Prestige** (by Maestrooo) — https://themes.shopify.com/themes/prestige — **$480 one-time**. The premium theme luxury Shopify brands gravitate to. 30+ configurable sections, editorial storytelling, native Shopify performance. **Recommended template.**

**Top 3 opinionated picks:**
1. **Prestige (Shopify)** if we migrate platforms — fastest path to luxury aesthetic.
2. **SOJA (Framer)** if owner wants design-led marketing site + Shopify checkout.
3. **Plamen (WordPress)** if budget forces self-hosted.

All licenses permit commercial use for a single end client.

---

## C. Stack recommendation

### Option 1 — Modern headless (Astro / Next.js + Shopify Hydrogen + Sanity)
- **Build:** 180k–320k SEK (~$17–30k), 10–14 weeks.
- **Ongoing:** ~600 SEK/mo Vercel + 2,500 SEK/mo Shopify Advanced + Sanity free-tier.
- **Pros:** senior-dev positioning; editorial CMS for long-form; perfect Core Web Vitals; future-proof.
- **Cons:** overkill for ~150 SKUs/mo online; ongoing maintenance dependency on Cris.
- **Verdict:** phase 2.

### Option 2 — Keep PrestaShop + custom theme
- **Build:** 60–110k SEK (~$5.5–10k), 5–7 weeks.
- **Ongoing:** existing hosting + module licenses.
- **Pros:** cheapest; no data migration; no checkout disruption; owner knows the back-office.
- **Cons:** ceiling is PrestaShop's Smarty theme engine (2010s patterns). Klarna/Swish modules are third-party. Performance ceiling is low.
- **Verdict:** pragmatic fallback if owner blanches at migration.

### Option 3 — **Shopify Advanced + Prestige theme** ⭐ RECOMMENDED
- **Build:** 110–180k SEK (~$10–17k), 7–10 weeks. Catalog migration via LitExtension (~$300). Prestige theme (~5,000 SEK / $480).
- **Ongoing:** Shopify Advanced ~4,400 SEK/mo (or Plus from ~25k SEK/mo if Swish-native needed). Apps ~600 SEK/mo.
- **Pros:** native Klarna (any plan), native Swish on Plus (third-party Svea/Mondido on Advanced), best-in-class checkout conversion, zero server maintenance, the platform Aesop runs on.
- **Cons:** monthly subscription forever; tobacco allowed on Shopify but cannot use Shop Pay Installments; Klarna requires per-account policy review.
- **Verdict:** the right answer for a Malmö independent.

---

## D. Sweden-specific compliance

### Tobacco-sale legality
Swedish law (Folkhälsomyndigheten) permits online tobacco sale but requires:
1. Buyer 18+
2. Seller actually verifies age (checkbox is not enough)
3. Seller registered with local municipality

**Implementation:**
- Hard age-gate on entry (modal, both SV + EN)
- **ID-verified delivery** via PostNord "Mottagningskvittens" or Budbee age-verified handoff. Recipient shows BankID or physical ID at delivery.
- **PrestaShop:** age-gate via third-party modules (~30–60 EUR)
- **Shopify:** better app ecosystem — Isenselabs, Shop Circle, Eastside Co (~$5–15/mo)
- The website gate alone is **not** sufficient under Swedish law — must pair with delivery-side ID check

### Payments
- **Klarna:** native on Shopify, module on PrestaShop. Confirm tobacco eligibility with Klarna account manager.
- **Swish:** native on Shopify Plus only; on Advanced use Svea Ekonomi or Mondido. On PrestaShop, Svea WebPay module.
- **Trustly:** modules exist on both.
- **Recommended:** Klarna Checkout primary (covers card + invoice + Swish in one widget), Swish standalone secondary.

### Languages
Swedish primary, English secondary. Shopify Markets handles natively with hreflang-correct routing. PrestaShop multi-language is functional but messier.

### VAT + excise
- Standard 25% VAT (moms) on tobacco.
- Sweden also levies separate tobacco excise (tobaksskatt) ~1.41 SEK/cigar plus weight-based on pipe tobacco. Excise is baked into product cost, not checkout-time. Both platforms handle the 25% VAT fine.

### EU compliance
- Track-and-trace IDs on packaging are the manufacturer's responsibility for hand-rolled premium cigars; Sweden's implementation exempts premium cigars from some TPD requirements through ongoing framework.
- Cross-border EU sales require registration in each destination country — **pitch staying Sweden-only at launch.**
- Cookie consent (GDPR) — Cookiebot or Klaro on both platforms.

---

## Headline pitch line

> "Move off PrestaShop to **Shopify Advanced + Prestige theme**, build a custom Habanos Nordic editorial layer, ship Klarna + Swish + BankID-verified delivery in 8 weeks for ~140,000 SEK. Aesop runs on this stack. The Macallan's aesthetic is achievable with this toolset. The owner gets back online payments — which the site currently doesn't have — within the first sprint."

---

## All URLs verified live as of 2026-05-25

- https://themes.shopify.com/themes/prestige
- https://themeforest.net/item/plamen-tobacco-store-theme/26551511
- https://us.davidoffgeneva.com/shop
- https://www.themacallan.com
- https://www.aesop.com
- https://www.brunellocucinelli.com
- https://www.robertstobak.se
- https://www.habanosnordic.se
- https://www.framer.com/marketplace/templates/clariel/
- https://levor.webflow.io/
- https://elements.envato.com/becka-cigar-store-shopify-theme-9Z65HPT
