# The Finder — Free vs Paid Feature Split

**Date:** 22 May 2026
**Status:** Spec — informs Supabase schema, page templates, and Lounge tab implementation.
**Decisions locked:** Section name `/finder/`. Free tier = 1 alert per email signup. Launch markets ES + DE + CH + IT + SE simultaneously.

---

## Three tiers of access

The funnel has three rungs, each unlocked with one more piece of commitment from the user. Every rung gives meaningful value — no rung is a tease.

```
Rung 1: Anonymous visitor          (lands on TNC, sees price comparison)
   ↓ email signup (free TNC account)
Rung 2: Free TNC member            (1 saved alert, basic features)
   ↓ Lounge upgrade ($89/yr)
Rung 3: Lounge member              (unlimited alerts, deal feed, premium features)
```

The wedge between Rung 1 → Rung 2 is the *first alert*. The wedge between Rung 2 → Rung 3 is *unlimited alerts plus the deal feed*. The free TNC account is the email capture that powers everything downstream.

---

## Feature matrix

| Feature | Anonymous | Free TNC | Lounge ($89/yr) |
|---|---|---|---|
| **Browse comparison** |
| See current cheapest price per SKU per country | ✅ | ✅ | ✅ |
| See all retailers carrying a SKU + their prices | ✅ | ✅ | ✅ |
| See stock status (in stock / out of stock) | ✅ | ✅ | ✅ |
| Filter by country / brand / vitola / price range | ✅ | ✅ | ✅ |
| Click out to retailer (affiliate revenue trigger) | ✅ | ✅ | ✅ |
| **Saving + alerts** |
| Save SKUs to favorites/watchlist | ❌ | ✅ (up to 5 saved) | ✅ (unlimited) |
| Price-drop email alert on a watchlist SKU | ❌ | ✅ (1 active alert) | ✅ (unlimited active alerts) |
| Push notification on price drop (PWA) | ❌ | ❌ | ✅ |
| Custom threshold per alert ("under €1,200") | ❌ | ✅ (basic) | ✅ (advanced — % drop, multi-retailer) |
| **Intelligence** |
| Last-known price (single point) | ✅ | ✅ | ✅ |
| Historical price chart (30 days) | ❌ | ✅ | ✅ |
| Historical price chart (90+ days, full history) | ❌ | ❌ | ✅ |
| Price-change badge ("↓ 8% this week") | ✅ | ✅ | ✅ |
| **Deal discovery** |
| "Biggest drops this week" public landing page | ✅ | ✅ | ✅ |
| Daily deal digest email | ❌ | ❌ | ✅ |
| "Curator's pick" weekly drop highlight | ❌ | ❌ | ✅ |
| **Personalization** |
| Set home country (sticky filter) | ❌ | ✅ | ✅ |
| Travel mode integration (auto-switch country) | ❌ | ❌ | ✅ |
| Save preferred retailers (rank them in comparison view) | ❌ | ❌ | ✅ |
| **Community + signal** |
| See how many Lounge members are watching a SKU | ❌ | ❌ | ✅ |
| "Lounge buzz" — trending SKUs in the network | ❌ | ❌ | ✅ |

---

## Why this split works

**Anonymous (Rung 1) carries enough value to rank for SEO and convert organic traffic.** The comparison itself is fully visible. Someone Googling "cheapest Cohiba Behike 52 Spain" lands on a page that answers the question, sees the price, sees all retailers, can click through to buy immediately. We earn affiliate revenue with zero friction. The page is search-engine-friendly because there's no paywall on core content.

**Free TNC (Rung 2) gives the user a real reason to register.** The single saved alert is the exact wedge that converts a one-time visitor into an email-captured lead. It's also genuinely useful — a serious smoker watching one specific box (their preferred everyday cigar) gets enough value to feel the product works. The 5-favorite/1-alert ceiling is tight enough to make the upgrade case obvious to anyone using the system meaningfully.

**Lounge (Rung 3) earns the $89/yr through accumulated utility, not a single big feature.** No single Lounge-only feature is dramatic on its own. The case is the bundle: unlimited alerts + push + historical charts + daily digest + travel-mode integration. A buyer who spends €1,500/year on cigars sees the math instantly — saving 5% on a few box purchases via alerts pays the membership several times over.

**The "Lounge buzz" features are the network-effect layer.** Once a critical mass of Lounge members is watching SKUs, the social signal ("12 members are watching this") becomes a unique data point no competitor can replicate. Reserves Rung 3 for genuinely premium positioning.

---

## Where each feature lives in code

### Public pages on TNC (`/finder/*`)

- `/finder/` — country picker + 5 "what's hot" cards per country (anonymous comparison preview).
- `/finder/[country]/` — country dashboard: cheapest SKUs, biggest drops, full catalog browser.
- `/finder/[country]/[sku-slug]/` — per-SKU detail page: all retailers, prices, stock, "Save / Alert me" CTA.
- `/finder/deals/` — biggest drops across all 5 countries, country-filterable.
- `/finder/brands/[brand]/` — Cohiba / Montecristo / Partagas / RyJ / etc. landing pages (SEO targets).

The "Save / Alert me" CTA on detail pages routes anonymous users to the TNC signup flow with the SKU pre-selected. After signup, the SKU is auto-saved to their first favorite + an alert is auto-configured at the current price minus 5%.

### Lounge tab (`/lounge/app/finder/`)

- `/lounge/app/finder/` — Lounge member home: their watchlist, current prices, alerts firing recently.
- `/lounge/app/finder/watchlist/` — manage saved SKUs, configure alerts.
- `/lounge/app/finder/digest/` — daily/weekly digest preferences.
- `/lounge/app/finder/buzz/` — "Lounge buzz" — most-watched SKUs in the network.

The finder tab gets added to the existing Lounge bottom nav alongside Home / Map / Directory / Messages / Profile. Likely replaces one of the lower-priority tabs or sits as a 6th tab (Lounge nav supports both per the existing UX redesign plan).

---

## Alert behavior — what happens when a price drops

1. Scraper writes new `finder_price_snapshots` row.
2. Post-scrape trigger evaluates: any `finder_watchlists` row where `sku_id` matches and `threshold_price >= new_price`?
3. Match found → write to `finder_alerts`, mark `delivered_channel`.
4. Free TNC users → email only.
5. Lounge users → email + web push (PWA notification) if push subscribed.
6. Anti-spam: dedupe — one alert per SKU per user per 24 hours, regardless of how many retailers drop.
7. Each alert email contains: SKU name + image, new price, old price, retailer name, direct affiliate-tracked link to buy.

The alert email is itself a monetization event — every click in the email is an affiliate click.

---

## Email cadence (free TNC vs Lounge)

| Email | Free TNC | Lounge |
|---|---|---|
| Alert fired on a watchlisted SKU | ✅ | ✅ |
| Welcome / account setup | ✅ | ✅ |
| Monthly TNC editorial newsletter (existing) | ✅ | ✅ |
| Daily deal digest (biggest drops) | ❌ | ✅ (opt-in default ON) |
| Weekly curator's pick | ❌ | ✅ (opt-in default ON) |
| "Your watchlist this week" summary | ❌ | ✅ |

Email cadence stays restrained — premium audience, no spam. All non-transactional emails are unsubscribable. Alert emails are not unsubscribable individually (they're the product) but the whole alert can be disabled.

---

## Upgrade prompts (where we ask free users to convert)

Restrained, never dark-pattern. Four placements:

1. **At the 1-alert ceiling.** Free user creates their 2nd alert → modal: "You're using your free alert slot. Lounge members get unlimited alerts plus push notifications and daily deal digest. $89/year."
2. **At the 5-favorite ceiling.** Same pattern.
3. **On a SKU detail page, in the historical chart section.** Free user sees 30 days; "See full price history (90+ days) with The Lounge."
4. **In the alert email itself.** Footer line: "Want push notifications and unlimited alerts? Join The Lounge."

No upgrade nags on the comparison pages themselves. No interstitials. The product earns the upgrade.

---

## What we explicitly do NOT do (and why)

- **No price-comparison paywall.** The public comparison is fully free. This is what ranks on Google and drives the entire funnel. Paywalling it would kill SEO and the funnel.
- **No "premium retailer" pay-to-rank.** Every retailer is ranked by price + ship-to-user algorithmically. We do not sell placement. The aggregator's credibility is its only moat.
- **No tobacco brand-sponsored content on finder pages.** Editorial separation. Brand sponsorship on TNC editorial side is OK; finder section stays clean.
- **No cigar reviews/ratings in the finder.** Reviews live on TNC blog. The finder is pure pricing. Cross-link liberally but don't blur the two.
- **No price-match handling.** We are not a marketplace; we don't broker the transaction. If a user finds the price wrong, they take it up with the retailer. We refresh the snapshot daily.
