# The Next Cigar — to-do

Kept in the repo so it survives sessions. Newest at the top of each list. Strike or delete a line when it ships.

## Cris

- Push `d65cd47` → HEAD (customs line, QA fixes 7–13, newsletter consent, travel-case guide).
- Run `supabase/migrations/034_newsletter_opt_in.sql` in the Supabase SQL editor.
- Stripe: finish the account setup (see the note in chat, 15 Sep).
- Lounge admin → Submissions: reject "QA TEST 15 Sep — reject me" (my test entry from the QA pass).
- Buy the five test products (the cart minus the gold Yigu lighter).
- Amazon support: citizenship / W-8BEN answer still pending.
- Rotate `ADMIN_PASSWORD` (exposed in a screenshot on 11 Sep).

## Build queue (in order)

1. **Product photographs** the day the parcel lands: replace every AliExpress CDN image, then the "What we know" sections get a verdict.
~~2. **Site search** in the masthead covering vitolas, retailers and articles (QA #7 — finding one vitola took a 3,600px scroll on a phone).~~ shipped 15 Sep
~~3. **Mobile front page**: one line above the fold saying what the paper is, linking to the board (QA #8).~~ shipped 15 Sep
~~4. **Prices in the reader's currency** on shop pages, USD as the settlement note (QA #9).~~ shipped 15 Sep
~~5. **Vitola page**: re-rank by landed cost when a country is chosen, as the board does (QA #11).~~ shipped 15 Sep
~~6. `<noscript>` notes on the shop Buy button and the box-code decoder (QA #12).~~ shipped 15 Sep
~~7. Price-alert success dialog restyled to the paper (QA #13).~~ shipped 15 Sep
~~8. Old preview routes Google still finds (`/cinematic-preview/`, `/collection/`, `/shelves/`): noindex or redirect.~~ shipped 15 Sep
~~9. Travel-case guide (two of the five products are cases; cutters guide is the model).~~ shipped 15 Sep
10. The Reel: composite the Omni plate into the "One box. Four countries." cover once the MP4 exists.
11. Retailer letters: send once the click ledger has a month of data (`docs/retailer-letters-2026-09-13.md`).
12. Subscribers: the Lounge signup now asks for newsletter consent (migration 034). The 31 existing members have not consented — send them one in-app/service note inviting them to tick the box, then export the consenting ones with the query in 034 and import to MailerLite. First mailing when photos exist.
13. Instagram bio link with UTM; post carousel 02 first (`docs/social/`).

## Watching

- Click ledger: Lounge admin → Clicks. Read after 22 September, not before.
- Search Console: validations started 14 Sep on the 404 row and three Event fields; Google reports in 1–2 weeks.
- Scrapers: CigarOne, Turmeaus, Cigarrummet first ran 14 Sep 16:28 UTC; check the Actions log stays green for a week.
