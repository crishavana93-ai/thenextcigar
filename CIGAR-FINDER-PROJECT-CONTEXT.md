# Cigar Finder — Project Context (v2)

**Date:** 22 May 2026
**Owner:** Cris
**Status:** Scope locked. Ready for retailer mapping + section naming.
**Supersedes:** `CIGAR-PROJECT-HANDOFF.md` (kept for reference; scope changed materially).

---

## What this project is now

A **European Cuban cigar price comparison + price-drop alert feature**, built as:

1. A new **public section inside TheNextCigar** (Astro + Supabase, same codebase) — free, SEO-driven, drives traffic.
2. A **premium feature set inside The Lounge app** — gated to $89/year members. Watchlists, price-drop alerts, deal feed, historical price charts.

No standalone brand. No new domain. No new entity. No physical inventory. No Swedish tobacco retailer permit. Pure affiliate model — we send referral traffic to licensed retailers and earn commission on conversions.

---

## What this project is NOT (explicit out-of-scope)

- ❌ Not connected to Guatabey. Guatabey is a separate cigar brand project.
- ❌ Not a standalone aggregator brand (was previously considered as Model D in the prior handoff doc; rejected in favor of TNC integration).
- ❌ Not buying or warehousing inventory.
- ❌ Not taking customer payments for cigars — we never touch the transaction.
- ❌ Not a hybrid retailer/aggregator (Model E in prior doc; rejected — no Swedish entity).
- ❌ Not pan-EU shipping. Cross-border tobacco shipping is broken in the EU due to country-specific excise tax. See "Cross-border constraint" below.

---

## The original idea and how we got here

Original: build a Swedish CigarFinder clone — scrape Swedish e-tailers, show best price, take the order, place it.

Killed by: Swedish Tobacco Act SFS 2018:2088 banning virtually all tobacco marketing including indirect/internet promotion. A consumer-facing comparison site for tobacco is legally fragile in Sweden. Also: word-of-mouth is the only legal acquisition channel for tobacco in Sweden — fine for a retailer, fatal for an aggregator that needs traffic.

Pivot: noticed that **US aggregators (CigarFinder.com, Cigar Price Scout) cannot list Cuban cigars** because of the US embargo. Cuban brands (Cohiba, Montecristo, Partagas, Romeo y Julieta) are the highest-prestige cigars in the world. No European Cuban-cigar aggregator exists. That's the wedge.

Second pivot (this doc): instead of building a standalone EU Cuban aggregator brand, fold it into TheNextCigar as a public section and into The Lounge as a premium feature. Reasons in the "Why this is the right architecture" section below.

---

## The cross-border constraint (the most important operational fact)

Tobacco excise is country-specific in the EU. A Spanish retailer shipping to Germany legally owes German tobacco tax, but Germany has no easy mechanism to collect from a foreign seller, so customs holds the parcel. In practice EU retailers ship within their own country only.

Implications for product:

- **Comparison must be country-localized.** A user in Madrid sees Spanish retailers. A user in Munich sees German retailers. Not pan-EU.
- **Switzerland is the cross-border tier.** Switzerland is outside the EU customs union, so Swiss retailers (5thAvenue.ch, Cigarworld.ch) ship into EU with greyer-area customs handling. Premium buyers will pay for this.
- **Andorra is the grey-market tier.** Low tax, ships into ES/FR with customs risk on the buyer. Not pursued in v1.

Launch markets (locked): **Spain, Germany, Switzerland, Italy.** Four countries with real Cuban culture, multiple retailers each, viable affiliate ecosystems.

---

## The wedge feature: price-drop alerts on watchlisted SKUs

CigarFinder.com does comparison well. What no one in Europe does — and what even CigarFinder does poorly — is **"alert me when this specific box of Cohiba Behike 52 drops below €X at any retailer that ships to me."**

This becomes:

- Email/push notification on price drops
- Watchlist of favorited SKUs (saved per user)
- Configurable threshold per SKU ("alert me when this drops below 1,200 EUR")
- Historical price chart (was 1,400 EUR a month ago, currently 1,280)
- "Deal feed" — curated daily list of biggest price drops across the catalog

This is the sticky retention layer. It justifies email capture on the free tier and justifies the Lounge membership on the paid tier.

---

## Architecture: where everything lives

### Public (TheNextCigar `/[section]/`)

New TNC section. Working name candidates (decision pending — see "Open decisions"):

- `/finder/` — clean, descriptive, fits TNC's existing one-word section pattern
- `/ledger/` — premium editorial feel
- `/habanos/` — leans into the Cuban wedge for SEO
- `/market/` — short, market-data feel
- `/index/` — sophisticated, evokes a stock index for cigars

Sub-routes:

- `/[section]/` — landing, explains the feature, country picker
- `/[section]/es/`, `/de/`, `/ch/`, `/it/` — country-specific dashboards (cheapest SKUs by country)
- `/[section]/[sku-slug]/` — per-SKU detail page (price across retailers in user's country, historical chart, "alert me" CTA → Lounge signup)
- `/[section]/deals/` — biggest drops in last 7 days, country-filtered

Public tier features:

- Browse current cheapest price per SKU per country
- See all retailers carrying a given SKU (price + shipping + stock status)
- "Alert me when this drops" CTA → Lounge signup flow
- One-time email signup → 1 free alert (lead magnet for Lounge conversion)

### Premium (The Lounge `/lounge/app/[tab]/`)

New Lounge tab — added to the bottom nav alongside existing tabs (Home / Map / Directory / etc).

Working name for the tab: **"Watch"** or **"Deals"** or **"Market"** (mirrors the public section name).

Lounge member features (gated behind $89/yr):

- Unlimited watchlist (favorite any SKU)
- Email + push notifications on price drops
- Custom thresholds per SKU
- Full historical price chart (90 days+)
- Daily deal digest email
- Country-specific feeds (set home country, see relevant retailers)
- Travel mode integration — when in Madrid for the weekend, see Spanish prices instead of home country

---

## Why this architecture is the right call

1. **No new entity, no new domain, no new brand to build trust for.** TNC already has the audience, the SEO authority, the editorial voice, and the trust signal. Launching the aggregator under TNC inherits all of that.

2. **The Lounge gets a new reason to exist.** Until now The Lounge's value prop was the community + check-in + travel map. Adding price alerts gives every Lounge member a recurring, utility-driven reason to open the app — strengthening retention on the existing $89/yr subscription.

3. **Free tier funnels into paid tier with clean logic.** "Alert me when this drops" → "create free TNC account for 1 alert" → "join The Lounge for unlimited alerts + deal feed." The aggregator is the highest-intent acquisition channel imaginable for The Lounge.

4. **Tech stack alignment is perfect.** TNC already runs Astro + Supabase + Cloudflare. The scraper becomes a scheduled Cloudflare Worker. Price snapshots go to Supabase. Astro renders the comparison pages. The Lounge auth (Supabase) gates the alerts. Zero new infrastructure.

5. **Affiliate revenue funds both properties.** Every click out to a retailer earns 8–10% commission. That revenue flows back into TNC editorial and Lounge improvements. The aggregator is a monetization layer for the editorial property, not a separate business.

6. **SEO compounds.** TNC already ranks for cigar editorial content. Adding price comparison content ("cheapest Cohiba Behike 52 in Spain") layers high-intent commercial SEO on top of the editorial authority. Each new SKU page is a fresh long-tail target.

---

## Affiliate plumbing (revised understanding)

The big affiliate networks (Awin, ShareASale, CJ) refuse tobacco merchants. That's a non-issue for us because pure affiliate sites don't need them. Retailers handle their own tracking via:

- Postback URLs / pixel
- Custom promo codes (one per affiliate, applied at checkout for tracking)
- Direct referral links with their own dashboards

For each retailer in our 4 launch countries we either:

1. Sign up to their existing public affiliate program (5thAvenue.ch has one; some UK Habanos specialists do too)
2. Negotiate direct partnership (8–10% per referred sale, tracked via unique code)
3. List them anyway without affiliate revenue if they refuse (for comparison completeness)

No payment processor needed — we never touch the transaction.

---

## Tech stack (locked)

- **Frontend:** Astro 5 (existing TNC codebase)
- **Database:** Supabase Postgres (existing project; new tables to add)
- **Auth:** Supabase Auth (existing; same user pool as TNC + Lounge)
- **Hosting:** Cloudflare Pages (existing TNC deployment)
- **Scraper:** Cloudflare Workers, scheduled cron, nightly snapshots
- **Email:** Supabase + Resend (existing TNC setup)
- **Push notifications:** Web Push API (PWA, already wired in The Lounge)
- **Maps:** Leaflet (already in Lounge — not needed for finder but cross-app consistency)

New Supabase tables to add:

- `finder_retailers` — name, country, url, affiliate_program (bool), tracking_method, commission_rate
- `finder_skus` — brand, vitola, length, ring, box_size, slug, image
- `finder_price_snapshots` — sku_id, retailer_id, price, currency, in_stock, scraped_at
- `finder_watchlists` — user_id (Supabase auth), sku_id, threshold_price, country
- `finder_alerts` — watchlist_id, fired_at, snapshot_id, delivered_channel

---

## Margins (revised, no inventory)

Per affiliate click → conversion:

- Average EU Cuban order: ~150 EUR (single box, popular SKU)
- Average premium order: ~400 EUR (large box like Behike or Esplendidos)
- Commission: 8–10% standard
- Revenue per converted referral: ~12–40 EUR

Assumptions for projection:

- 10,000 monthly visitors at month 6 (TNC currently does X, will lift this)
- 5% click-out rate to retailer
- 8% retailer conversion rate
- 9% average commission
- Result: ~40 sales/month × ~22 EUR avg commission = ~880 EUR/month at month 6

Volume game. The unit economics only work with traffic, which is why the TNC SEO authority matters so much. Standalone aggregator from scratch would have struggled on traffic for 12+ months. Hosted inside TNC, we inherit the audience.

---

## Open decisions

1. **Section name + URL slug.** Finder / Ledger / Habanos / Market / Index — pick one. (Working recommendation: `/finder/` for clarity, with editorial naming "The Finder" or "The Habanos Finder" on the page itself.)
2. **Lounge tab name.** Should mirror the public section. (Working recommendation: "Watch" or "Market" depending on (1).)
3. **Free tier ceiling.** How many alerts can a free TNC account create before they need to upgrade to Lounge? 0, 1, or 3? Trade-off: 0 = hard paywall (worse top-of-funnel), 3 = leaky but viral (worse conversion). Recommended: **1 free alert** as the wedge.
4. **Country launch order.** All 4 simultaneously, or sequence ES → IT → DE → CH? Sequencing reduces v1 scope but slows revenue. Recommended: **ES + CH first** (Spain for market size + LatAm SEO, CH for cross-border tier), then IT + DE in month 2.

---

## Immediate work queue (in order)

1. ⏳ This doc (project context reset) — DONE.
2. ⏳ Section name shortlist + recommendation — NEXT.
3. ⏳ Free vs paid feature split spec.
4. ⏳ Supabase schema additions.
5. ⏳ Retailer mapping: top 8–12 Cuban cigar retailers per launch country.
6. ⏳ Affiliate program validation for top 3 retailers per country.
7. ⏳ Scraper architecture plan.
8. ⏳ Verification pass.

Then build: scraper MVP → schema migrations → 1 public page per country → 1 Lounge tab → waitlist for launch.

---

## Key reference files in this folder

- `CIGAR-PROJECT-HANDOFF.md` — prior handoff doc (Sweden-focused, superseded by this).
- `Swedish_Cigar_Aggregator_Plan.docx` — full Sweden-only model A plan (rejected, kept for reference).
- `outreach/lounge-mvp-build-strategy.md` — Lounge tech stack rationale (Astro + Supabase + Stripe).
- `outreach/lounge-ux-redesign-plan.md` — current Lounge UX patterns we should mirror in the finder tab.
- `src/pages/lounge/app/` — existing Lounge tab implementations to model the new Watch/Market tab after.
- `supabase/migrations/` — existing schema; new finder_* tables will be additive.

---

## Sources (regulatory + market)

- Folkhälsomyndigheten — [Trade in tobacco products](https://www.folkhalsomyndigheten.se/the-public-health-agency-of-sweden/living-conditions-and-lifestyle/andtg/legal-requirements/tobacco-products/trade-in-tobacco-products/)
- [Lag 2018:2088 om tobak och liknande produkter](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-20182088-om-tobak-och-liknande-produkter_sfs-2018-2088/)
- [PACT Act basics — Tobacco Law Blog](https://www.tobaccolawblog.com/2024/04/pact-act-basics-5-things-tobacco-sellers-and-shippers-should-know/)
- [CigarFinder.com](https://cigarfinder.com/) — US comparison engine, the reference implementation
- [Cigar Price Scout](https://cigarpricescout.com/) — US comparison engine, secondary reference
- [Puros.se](https://www.puros.se/) — Swedish market leader (informs Nordic expansion later)
- [5thAvenue.ch](https://www.5thavenue.ch/) — Swiss reference retailer, cross-border tier
