# Where the money is, and what nobody has built

**13 September 2026.** Read from Cigar Aficionado, halfwheel, Cigar Dojo, CigarFinder.eu, Cigar Price Scout and Cigar Ledger, checked against your own Search Console.

---

## First, a correction to something you may believe

**European cigar price comparison is not an empty field.** I assumed it was. It isn't.

- **CigarFinder.eu** — "Compare prices from European online retailers. Thousands of cigars, one search." Covers Cuban brands explicitly.
- **Cigar Ledger** (UK) — price comparison plus an Android app.
- **Cigar Price Scout** — 25+ retailers, box prices, affiliate-funded. US-only, so not your competitor, but it shows the model works.

The good news is what they are *not*. CigarFinder.eu shows prices "from €0.18" — singles, not boxes — carries a disclaimer that prices "are indicative and may vary," gives no timestamp, and discloses no business model at all. It is a thin aggregator. Yours quotes dated box prices from named retailers with a freshness window and price history. That is a better product, but it is a **depth** advantage, not a novelty one, and the marketing has to say so.

---

## Where you are already winning, on your own data

Two things ranked on page one when I searched today without meaning to find you:

**"cigar import duty VAT calculator EU"** → *Cuban Cigar Import Duty: Germany vs Switzerland vs UK Explained (2026)* — yours.
**"cigar price comparison Europe"** → both `/finder/` and the retailer map — yours.

And Search Console says your top two pages are the retailer map (297 clicks) and the Finder (267). Your audience is not looking for reviews. **They are trying to work out where and how to buy across a border.** That is the whole business, and it is not what Cigar Aficionado or halfwheel is for.

---

## The tool nobody has built

### Total landed cost, retailer to doorstep

Every generic duty calculator I found — dutiable.io, CARVO, DutyGlobal, customs-lookup — works from HS codes and models customs duty plus VAT. **None of them handle tobacco excise**, which for cigars is not a rounding error, it is most of the bill. A €300 box crossing the wrong border can arrive at €500 and no existing tool will tell you that before you click buy.

You already own every component:

- `finder-live.ts` — the box price at a named retailer
- `duty-rates.ts` — excise by country, with `rateFor(code, on)` and scheduled changes already in it, including the UK's £508.12/kg from October
- the retailer's country, and the buyer's country

The tool is: *pick a cigar, pick where you live, see what it actually costs delivered from each retailer, ranked by total rather than by sticker price.* That single change reorders the entire board — the cheapest listed price is frequently not the cheapest landed price, and nobody anywhere is showing that.

This is the one I would build. It is defensible because the data is yours, it answers the question your traffic is already asking, and it makes the Finder materially better rather than adding a separate gadget.

### Second: "is this a good price right now"

You have `PRICE_HISTORY` and nobody else shows history at all. *Cheapest it has been in six months* / *12% above its usual* is a one-line addition to a Finder row and it is the difference between a price list and a buying tool.

### What I would not build

**Humidor trackers are a solved and crowded problem** — Cigarbase, Boxpressd, Cigarro, Cigarista, Cigarino, plus Cigar Dojo's social app. You have one in the Lounge; leave it as a member perk and do not invest further.

**A ratings database is unwinnable.** Cigar Aficionado has 23,000 tasting notes going back decades. That is their moat and you cannot dig it in a year.

---

## Money you are not collecting

### 1. Sell advertising to European retailers — the biggest gap

**halfwheel's entire business is display advertising sold "almost exclusively to cigar companies and retailers."** No magazine, no shop, no events. Cigar Dojo runs banners for Rocky Patel, Davidoff, Perdomo and fifteen others.

You have been thinking about retailers as affiliate partners, and we established none of them run publisher programmes. **That was the wrong question.** They do not need an affiliate programme to buy an advert. You have 297 people a quarter landing on a page titled *Where to buy Cuban cigars in Europe*, and every retailer on that map wants those people.

The pitch writes itself: your listing is free and stays free, ranked on price; a clearly-marked featured slot costs money. The neutrality of the Finder is the asset — sell around it, never inside it. A labelled banner is honest; a paid position in a price ranking is not, and would destroy the thing you are selling.

Start with the retailers already in your board who see the most clicks. Ask for a three-month trial at a low number, because your first job is a reference customer, not a rate card.

### 2. License the price data

You have something none of them have: dated Cuban box prices across European retailers, with history. **The retailers themselves are the buyers.** Noblego wants to know what Cigarworld charged for Bolívar Royal Coronas last month. That is a B2B product with no audience-building overhead attached, and the dataset already exists.

### 3. Paid placement in the Lounge directory

Physical lounges and shops pay to be listed or featured on the map. Lower value than retailer advertising, but it is close to free to operate once the map is geocoded.

### 4. Membership — later, not now

Cigar Aficionado charges for the ratings archive. Your equivalent is price alerts plus history plus the landed-cost tool. It is a real product, but you have 46 people and one Finder subscriber. Charging is a question for when the list is 500, not 46.

---

## What I would actually do, in order

1. **Build the landed-cost calculator into the Finder.** It is the only genuinely unowned tool in this market, you already have the data, and it deepens the two pages that already carry your traffic.
2. **Add price history to Finder rows.** A day's work, and it turns a list into a recommendation.
3. **Write to five European retailers offering a labelled featured slot.** This is the fastest real revenue on the list and it does not depend on Amazon, Stripe, or a parcel arriving from China.
4. **Then the shop**, once you have handled the products and photographed them.

The pattern across all of it: you are not a review site and you will lose if you try to be one. You are the place people go to work out **where to buy, what it will really cost, and whether it is genuine.** Every hour spent on that is defensible. Every hour spent on tasting notes is competing with a magazine that has a thirty-year head start.
