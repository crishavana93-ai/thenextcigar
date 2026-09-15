# The Lounge — what makes it unlike every other cigar app, and how to get it into smokers' hands

*15 September 2026. Research pass + product and promotion plan. Nothing here is built yet unless marked.*

## 1. The landscape (what exists, September 2026)

| App | What it is | Model | Weak spot for our reader |
|---|---|---|---|
| Cigar Dojo / Dojoverse | Oldest social cigar app, "Never Smoke Alone", belts and badges, shop locator, busy feed | Free PWA | US-centric, all cigars, no prices, no Cuban focus; feed noise |
| Boxpressd | Photo-led reviews, barcode scan, virtual humidor, social | Free PWA | Review platform first; no market data |
| Cigarro | Humidor + "review by thirds", small chronological feed called the Lounge (yes, same name) | Free to 30 cigars, then $4.99/mo | Paywall on the humidor; no venues, no prices |
| Cigarista / Cigarbase / Cigar AI / Cigar Vault | AI band scanners with a humidor bolted on | 2 free scans then $7–13/mo | Scanner as the product; Cuban bands are the easiest to fake, so a scanner is the wrong tool for our reader |
| Cigar Scanner | 13,000-cigar reference catalogue | Free, Android | Stale (last update Oct 2025), slow with big collections |
| ASHD Cigar Social | New App Store entrant: check-ins by venue, drink pairing, venue submissions, badges, events, DMs | Free, iOS, 3 ratings | Brand new, US, all cigars; proves Apple will now list a tobacco *social* app at 18+ |

Two facts that shape everything: Apple and Google keep most cigar apps out of the stores, so the category is web apps installed to the home screen, exactly what we have. And not one of them does prices, landed cost, or a curated venue map with Casas del Habano marked as such. Every competitor is American and treats a Cuban like any other cigar. Nobody serves the European Cuban smoker.

## 2. The premise, in one line

**The Lounge is the members' room of a newspaper about Cuban cigars in Europe.** The paper tells you what a box costs at your door tonight; the Lounge tells you where to smoke it and who else is there. Everyone else built a scrapbook. We built a market with a map.

What we already have that nobody else does: live box prices at ten European retailers with landed cost per country; a humidor valued against the board (replacement cost, not fantasy auction value); 465 rooms in 212 cities with Casas del Habano, licensed shops and lounges told apart; check-ins with "who is smoking near you tonight"; declared trips; price and restock alerts; a box-code decoder that refuses to guess the factory. And an editorial voice.

## 3. Product: ten things that would make it the app Cuban smokers keep on the home screen

Ordered by impact per week of work. Items 1–4 are the ones I'd ship this autumn.

1. **"Light up" — one-tap check-in with the cigar.** Today the check-in says where; it should also say *what* (vitola, from your humidor or the board list) and the drink. The venue card then shows "3 lighting up here tonight: Monte 2, Epicure 2, Siglo VI". That is the Untappd moment, and ASHD is the only competitor doing it, in the US. *(Two evenings: one column on `checkins`, a picker in the sheet, the venue card line.)*
2. **City pages for the map — `/lounge/map/london/`, `/lounge/map/malmö/` … 212 static pages.** Each: the rooms, the cheapest live box delivered to that country, members' count, "tonight" if any. This is the SEO engine: "cigar lounge Hamburg", "Casa del Habano Barcelona", "where to smoke a cigar in Stockholm" are searches with weak answers today. Built from the same snapshot as the public map. *(One day; pure Astro.)*
3. **Rooms that host: the "Check in here" table tent.** A one-page PDF per venue with a QR to `/lounge/map/<city>/#<slug>` and the line "Members of The Next Cigar check in here." Free to the venue. Casas del Habano and the lounges are our distribution — they have the smokers; we have the map. Manager account (already in the schema: `manager_user_id`) sees check-ins and can post "tonight: Romeo y Julieta tasting". *(Two days; the PDF is generated from the venue data.)*
4. **Passport stamps.** Every city you have checked in becomes a stamp on your profile: "Smoked in 9 cities". No belts, no points, no leaderboards; a traveller's passport, in the paper's typography. Ties to Travel: declare a trip, and the app tells you the rooms and which members will be in town. *(One day.)*
5. **Box passport on the humidor.** Enter the box code once → the entry carries the packing month/year, age in the box (exists), what you paid, and the board's price today (exists); add a photo of the seal and the code. Not authentication — a record. When you gift or sell the box the passport goes with it. *(Half a day on top of what exists.)*
6. **Weekend Edition push.** The Friday email (planned) also lands as a notification in the installed app: Box of the week, three biggest spreads, one guide, one product. Needs a push subscription; web push works on iOS 16.4+ for installed apps. *(Two days incl. the send.)*
7. **Ask the room.** A question board per city, chronological, no algorithm: "Anyone know if LCDH Palma has Behikes?" Members in that city get it. Small by design, like Cigarro's feed but useful. *(Two days.)*
8. **Trip mode.** When a declared trip starts, the app's home becomes that city: rooms, members in town, the allowance calculator pre-filled for the way home, and "what a box costs here vs at home". *(Two days; mostly composition of what exists.)*
9. **Verified room notes.** Members leave one-line practical notes on a venue (walk-in policy, humidor depth, "no Cubans on Sundays"), shown newest first, editable by the manager. *(One day.)*
10. **Members' own rooms.** A member with a good home lounge can list "open humidor, Thursdays" for members in their city, RSVP-only. This is the thing no app does and the thing cigar people actually do. Needs a house rule page and a report button. *(Three days.)*

Things I would not do: AI band scanning (wrong tool for Cubans, and everyone has it), star ratings out of 100, a token economy, a paid tier before 1,000 members.

## 4. Promotion: how it spreads

**The map is the funnel.** Every public map page ends in "Members see who is here tonight — join free". Once the 212 city pages exist, the paper ranks for the venue searches and the map converts them. This is the only channel that compounds without spend.

**Rooms as partners.** Send the table tent to the 97 Casas del Habano first, in Spanish, English and German, from the paper (not the app): "We list you; here is a card for the counter; your manager account is free." Ten rooms that actually put the card out beat any ad.

**Instagram.** Keep the carousel line (decks 04–06 are ready). Add a weekly "Tonight in <city>" story built from real check-ins once there are any; until then, "Rooms of <city>" carousels from the map (three cities a week, no photos we don't own — the paper template, typographic).

**The Germany story is a press hook.** A newspaper that ran the numbers on a national shortage, with a live board behind it. Pitch to the cigar press (Cigar Journal, Cigars-connect, Tabakzeitung) and to general business press in Germany as a data story; every mention links to the board and the map.

**Referral codes exist already.** Turn them into founding-member stamps: the first 200 members get a "Founding member · 2026" line on the profile and their code in the Weekend Edition. Creators (cigar YouTubers in the UK and Germany) get a code and a landed-cost calculator link they can actually use in videos.

**Communities to be present in, as the paper, not as an ad:** r/cubancigars and r/cigars (data posts: the board's monthly spread, Box of the week), UK Cigar Forums, the German Zigarren-Forum, Swedish cigar clubs (Malmö first), and Habanos events (InterTabac Dortmund is on the diary).

**Retailers on the board** (EGM, Turmeaus, CigarOne, Cigarmust) already get traffic from us; offer them a "listed on The Next Cigar board" badge and a monthly report of clicks. It makes them link back.

## 5. Guardrails

No tobacco sold, ever, anywhere in the app. No swapping or selling between members through the app (excise law in every EU state; "meet and share" in person is fine, the app only introduces). 18+ gate stays. No invented venue photos; photos come from managers or members with consent. Notes are moderated by the desk, and every room has a report button before item 10 ships.

## 6. What I'd do next week, in order

Light up (1) → city pages (2) → passport stamps (4) → table tent PDF (3). Then the Weekend Edition, once you decide the sending service.

*Sources: Cigarista's tracker comparison, Cigarro's 2026 roundup, Cigar Dojo app page, Boxpressd, ASHD on the App Store; all read 15 September 2026.*
