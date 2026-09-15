# The Next Cigar — to-do

Kept in the repo so it survives sessions. Newest at the top of each list. Strike or delete a line when it ships.

## Cris

- Push `92532ca` → `ef93486` (mobile viewport fix, Finder email fix, QA fixes 2–5).
- Run `supabase/migrations/033_delete_my_account.sql` in the Supabase SQL editor.
- Lounge admin → Submissions: reject "QA TEST 15 Sep — reject me" (my test entry from the QA pass).
- Check subscriptions@ and orders@ inboxes after the deploy: the two alert receipts should arrive once the From-header fix is live; before it, nothing ever did.
- Buy the five test products (the cart minus the gold Yigu lighter).
- Amazon support: citizenship / W-8BEN answer still pending.
- Rotate `ADMIN_PASSWORD` (exposed in a screenshot on 11 Sep).
- Decide the customs line on `/shipping-and-returns/`: it says only orders *outside* the EU may attract duty, but drop-ship parcels from China into the EU carry the €3-per-item customs fee since July 2026. Say who pays.
- Confirm with EGM's owner: Balerna (CH) or London? The Trinidad Reyes editorial says London.

## Build queue (in order)

1. **Product photographs** the day the parcel lands: replace every AliExpress CDN image, then the "What we know" sections get a verdict.
2. **Site search** in the masthead covering vitolas, retailers and articles (QA #7 — finding one vitola took a 3,600px scroll on a phone).
3. **Mobile front page**: one line above the fold saying what the paper is, linking to the board (QA #8).
4. **Prices in the reader's currency** on shop pages, USD as the settlement note (QA #9).
5. **Vitola page**: re-rank by landed cost when a country is chosen, as the board does (QA #11).
6. `<noscript>` notes on the shop Buy button and the box-code decoder (QA #12).
7. Price-alert success dialog restyled to the paper (QA #13).
8. Old preview routes Google still finds (`/cinematic-preview/`, `/collection/`, `/shelves/`): noindex or redirect.
9. Travel-case guide (two of the five products are cases; cutters guide is the model).
10. The Reel: composite the Omni plate into the "One box. Four countries." cover once the MP4 exists.
11. Retailer letters: send once the click ledger has a month of data (`docs/retailer-letters-2026-09-13.md`).
12. Merge the 46 subscribers (15 MailerLite + 31 Lounge) into one list; first mailing when photos exist.
13. Instagram bio link with UTM; post carousel 02 first (`docs/social/`).

## Watching

- Click ledger: Lounge admin → Clicks. Read after 22 September, not before.
- Search Console: validations started 14 Sep on the 404 row and three Event fields; Google reports in 1–2 weeks.
- Scrapers: CigarOne, Turmeaus, Cigarrummet first ran 14 Sep 16:28 UTC; check the Actions log stays green for a week.
