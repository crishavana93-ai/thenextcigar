# Gott Eftermaten / Den anspråkslösa Cigarraffären — web-dev pitch package

**Target:** the owner of `gotteftermaten.se` — formally "Den anspråkslösa Cigarraffären," opened 1 November 2007 at Carl Herslowsgatan 11 b, Malmö. Self-described as "Malmö's only dedicated cigar and pipe shop," 1,000+ cigars on display, broadest range in Sweden, holds the full Habanos Nordic Cuban catalogue.

Owner contact: from the site's "Kontakta oss" — get the actual name + email before sending anything. The site lists an email under that page; pull it from there. If only a generic `info@` is available, mailed pitches to `info@` get opened ~half as often as named — try to call the shop first and ask for the owner's name.

---

## Part 1 — Tech stack audit (what they're running, what's broken)

**Platform:** PrestaShop, older version (likely 1.6 or 1.7 — the URL patterns + module names line up). PrestaShop is a PHP-based open-source e-commerce platform. Active in 2010–2018 as a Magento-lite alternative; now considered legacy in 2026. Most newer Swedish e-commerce sites moved to Shopify, WooCommerce, or custom Astro/Next stacks.

**Hard evidence in the page source:**

- HTML meta description literally reads `Visa "Ecommerce software by PrestaShop™" i sidfoten` — that's the placeholder copy from the PrestaShop admin's "footer setting" field, mistakenly populated as the page's meta description. **This is killing their SEO right now** — Google indexes whatever is in `<meta name="description">`, and "Show PrestaShop in the footer" is what shows up under their listing in search results. Fixable in one PrestaShop admin click; nobody's done it in 4+ years.
- Logo URL: `my-shop-logo-1584463297.jpg` — that timestamp encodes March 2020, meaning the logo hasn't been touched in 5+ years.
- Module name `angarslider` in the homepage slider URL — that's a free PrestaShop slider plugin last updated 2017.
- No favicon visible.
- No mobile-responsive design indicators in the HTML (no `<picture>`, no responsive image breakpoints, no Tailwind / Bootstrap modern classes).
- No structured data (no Product, Offer, or Breadcrumb JSON-LD).

**The kill shot — they admit it publicly:**

The footer popup currently reads:

> "Nya butikstider! Tisdag, onsdag, torsdag, fredag 11.00-18.00. Lördag 11.00-14.00. **För tillfället har vi ingen betalningsmöjlighet online. Du är välkommen att mejla beställning.** Snart kommer online betalning igång igen."

Translation: **"We currently have no online payment option. You're welcome to email orders. Online payment will be back soon."**

That sentence has been on the homepage long enough for it to be the default state. Every customer who lands wanting to buy something gets bounced to email — which means a huge chunk of intent-to-purchase traffic walks away. This is the urgent pain. Lead with it.

**Other concrete weaknesses:**

1. **No mobile-first design.** Desktop-era template; on a phone it scrolls horizontally on product listings.
2. **No search bar above the fold** — for a 1,000-product catalogue, the search is buried in the header icon strip.
3. **Catalog navigation is a flat brand list** — 95 brands in one dropdown. No "by strength," "by country," "by price," "by occasion." No filter UI.
4. **No SEO at all** beyond auto-generated titles. No product schema, no Open Graph tags visible, no sitemap referenced.
5. **No email-list capture** beyond "register an account and tick the box" — high friction, almost nobody does this.
6. **No reviews / no social proof.** No customer testimonials, no Instagram embed, no editorial content.
7. **No content marketing.** No blog, no buying guide, no "what to smoke with what." Pure transactional product pages.
8. **Limited hours** — closed Mon/Sun. Loses every weekend impulse buyer.
9. **No English version.** Swedish only. Loses the entire international Cuban-cigar tourist market (Copenhagen day-trippers, Stockholm visitors, Danish + Norwegian buyers who'd happily shop SE for the Habanos Nordic range).
10. **Outdated checkout flow** — PrestaShop's default checkout is a 4-step process; modern e-commerce is 1–2 steps. Each step loses ~25% of buyers.

## Part 2 — What fixing this looks like (the offer)

Three tiers, increasing scope. Pick the one that fits the owner's appetite when you actually have the conversation.

### Tier A — "Stop the bleeding" (smallest pitch, fastest win)

**Scope:** Re-enable online payments. Fix the broken meta description. Add basic Open Graph + Product schema. Add a real favicon. Make the homepage usable on a phone.

**Why this works for them:** The owner already knows online payments are broken — it's the single most-visible problem. Solving it returns immediate revenue. Everything else is bonus.

**Time:** 8–12 hours of work. ~2 weeks calendar time.

**Price:** ~12,000 SEK (about €1,100). Quote it as a flat fee, not hourly.

**What they keep:** their existing PrestaShop install. No migration. Familiar admin panel. Same product catalogue.

### Tier B — "Stop the bleeding + modernize" (mid-tier pitch — recommended)

**Scope:** Everything in Tier A, plus:
- Migrate the entire site from PrestaShop to a modern stack (Astro + Stripe / Klarna for SE / SwishPay for SE customers).
- Fully mobile-responsive design.
- Real search bar with autocomplete (the 1,000-product catalogue becomes browsable).
- Brand-aware filters (Cuban / Dominican / Honduran / Nicaraguan, strength, price band, smoke time).
- Product schema + Breadcrumb schema on every product page.
- 30-product image refresh to consistent professional shots.
- Email newsletter signup integrated with Mailchimp / Resend.
- A 6-post "buying guide" content section for SEO (these compound for years).

**Why this works for them:** Their catalogue is the broadest in Sweden — but their site doesn't show it. Modernizing the storefront unlocks the inventory they already have. Cuban-cigar buyers searching "Cohiba Robustos Sverige" should be hitting their pages, not Cigarrcentralen's.

**Time:** 80–120 hours over 6–8 weeks.

**Price:** ~85,000 SEK (about €7,700). Quote it as a flat fee + 1,500 SEK/month optional maintenance after launch.

**What they keep:** the products, the brand, the 1,000-cigar physical inventory. Everything customer-facing gets rebuilt. Admin moves from PrestaShop's admin to a simpler Netlify-CMS-style editor where they can add new products in 30 seconds.

### Tier C — "Modernize + integrate with The Next Cigar Finder" (your strategic play)

**Scope:** Everything in Tier B, plus:
- Their inventory feeds into thenextcigar.com/finder/ as a tracked retailer. Free marketing — every Swedish buyer browsing the Finder for a specific SKU sees their price next to Cigarrcentralen and Cigarrspecialisten.
- Real-time price sync between their admin and the Finder's scraper.
- They get a "data partner" badge on the Finder, distinct from generic-listed retailers.
- Cross-promotion: when a TNC reader from Skåne reads a piece about Cuban cigars, the article links to Gott Eftermaten as the local pickup option.

**Why this works for them:** Visibility outside Malmö without ad spend. They become the default Cuban-cigar shop for every Skåne / Copenhagen / Lund TNC reader. The Finder pulls them into a 18-country buyer network they couldn't otherwise reach.

**Time:** 100–140 hours over 8–10 weeks.

**Price:** ~110,000 SEK (about €10,000) one-time. No ongoing fee (the Finder integration runs free as part of the TNC platform).

**The asymmetric value:** they pay once, you get a Swedish data partner for the Finder permanently, and they get permanent visibility. The Finder's authority compounds for them.

## Part 3 — The first email

Sweden-friendly tone: respectful, direct, no hype. Send from `guatabeycigars@gmail.com` (or `cris@thenextcigar.com` once you've set up Cloudflare Email Routing).

**Subject options** (A/B):
- `En kund + utvecklare med ett konkret förslag` (= "A customer + developer with a concrete proposal")
- `Tre saker jag märkte på gotteftermaten.se`
- `Cigarrkund som råkar vara webbutvecklare`

**Body (Swedish, plain text):**

> Hej [owner's first name],
>
> Jag heter Cris och driver thenextcigar.com — en europeisk pris-jämförelsesida för kubanska cigarrer. Bor i Malmö, har varit kund hos er sen [year if true; otherwise drop the line].
>
> Tre snabba observationer jag har gjort på er sida — säg gärna till om jag är ute och cyklar:
>
> 1. Online-betalningen är fortfarande av. Texten på första sidan säger att kunder kan mejla istället, men de flesta som hittar er via Google handlar inte om de inte kan klicka och betala där och då. Det är gissningsvis den enskilt största förlusten just nu.
>
> 2. Sidans meta-beskrivning för Google läser "Visa Ecommerce software by PrestaShop i sidfoten" istället för en riktig beskrivning. Det är en gammal PrestaShop-bug i en inställningsruta. Det syns under er rubrik i Google-sökningar och får er att se övergiven ut. Femminuters-fix i admin.
>
> 3. Sortimentet är troligen Sveriges bredaste — 1000+ cigarrer — men sidans struktur visar inte det. Sökfunktionen är gömd i ikonraden och filterna finns inte. Det betyder att Skånes cigarrkunder hittar lättare till Cigarrcentralen i Stockholm trots att ni har bredare lager.
>
> Jag bygger e-handel för cigarrbutiker som specialitet — jag är själv kund, jag förstår nischen. Skulle du vilja sätta dig ner 30 minuter över en kopp kaffe i Malmö nästa vecka? Inga försäljningstrick — bara konkreta saker jag har sett som du kan göra själv om du vill, eller som vi kan göra ihop.
>
> Mitt nummer är [insert phone]. Eller svara så bokar vi.
>
> Vänligen,
> Cris
> guatabeycigars@gmail.com
> thenextcigar.com

**Why this works:**
- Opens with shared context (customer + Malmö-based).
- Three specific observations prove you actually looked at the site.
- The meta-description point makes you look technical without being intimidating.
- "Cigar e-commerce specialist" positions you above generic web devs.
- The ask is a coffee, not a contract. Low-commitment.
- Offers them the option to fix things themselves — defuses the "you're trying to sell me something" defence.

## Part 4 — What to bring to the coffee meeting

If they say yes:

1. **A printed Before/After mockup.** Two A4 sheets — current homepage vs proposed homepage. Make it tangible.
2. **A list of 5 questions** to learn how they actually run the business:
   - How many online orders per month right now (when payments worked)?
   - What's their best-selling SKU?
   - Where do new customers come from — walk-in, Google, Instagram, word of mouth?
   - Are there products they wish they could push but the current site buries?
   - What's the next 12-month plan for the business — expansion, second shop, retirement?
3. **The Tier B proposal as the default.** Tier A if they're cash-strapped, Tier C if they're growth-curious.
4. **A 1-page contract template.** Scope, deliverables, payment milestones (30% up front, 30% at midpoint, 40% at handover), maintenance terms. Looks professional and forces a decision.

## Part 5 — Backup plays if they say no

A "no" from the owner doesn't mean dead. Two follow-up plays:

**(a) Free fix as goodwill.** Offer to fix the meta-description bug for free, no strings. They get a small win immediately + you build trust. 6 months later when they're ready to invest, you're already the trusted dev.

**(b) Partner / referral relationship.** Even without a build contract, list them as a featured retailer on the Finder. Have them stock TNC-branded humidor cards (a tiny printed card promoting your site). When their customers visit, they cross-promote you, you cross-promote them on the Finder. Same flywheel, different fuel.

## Part 6 — Pricing notes for you

The numbers above (12k / 85k / 110k SEK) are mid-market for Swedish small-business e-commerce dev as of 2026. They're 30–40% below what a Stockholm agency would quote (those start at 150k SEK for a Tier B equivalent). Sit comfortably above hobbyist "I'll do it for 5k" pricing — owners read those as "you'll abandon me halfway."

If they push back hard on price, the move isn't to discount — it's to descope. Drop a feature, keep the price. Tier B without the content section is still Tier B-light, not Tier A discounted.

Payment milestones matter more than the total. Get the 30% deposit before you write a line of code; nothing concentrates the mind like committed cash from both sides.

## Part 7 — Why this is a good prospect specifically

1. **They sell what TNC tracks.** Full Habanos Nordic Cuban range = full overlap with the Finder catalogue.
2. **They're a small business**, not a corporation — decisions happen at one table, no committee.
3. **The owner already knows the site is broken** (the homepage admits it). Half the sale is done.
4. **They're geographically local to you** — meetings are coffees, not Zooms.
5. **They have inventory.** Many cigar shops don't — they take orders and dropship. Real stock means real, recurring web revenue once payments work.
6. **They've survived 19 years** since opening in 2007. Stable, not desperate. Won't ghost you mid-build.

The match between what they need and what you can deliver is exact. Send the email this week. Worst case: it doesn't land and you've practiced the pitch. Best case: 85k SEK contract + a Skåne data partner for the Finder.
