# Black Friday 2026: plan (20 Nov to 30 Nov)

Black Friday is Fri 27 Nov 2026, Cyber Monday is Mon 30 Nov. Our page: /blog/black-friday-cigar-accessory-deals-2026/ (22 accessories, no prices shown, Amazon affiliate links).

## Rules
- Social stays news. Black Friday posts are **advertising**: every one carries a small "Annons" tag and only links to the Black Friday page or the accessories guides. No cigars, no tobacco brands, no prices, no "best price" claims.
- The bio link stays on the homepage. Affiliate links only go in labelled Stories.
- Nothing about tobacco products is promoted. The page covers accessories only (humidors, hygrometers, cutters, lighters, cases, glassware, books).

## Calendar
| When | Where | What | Status |
|---|---|---|---|
| Fri 20 Nov, 18:30 | Instagram Story (2 frames) | Frame 1: "Annons · Black Friday is next Friday. Buying a humidor, cutter or lighter as a gift? Check the 'before' price, not the percent." Frame 2: "The 22 accessories we're watching and how to spot a fake deal" + link sticker to the BF page (utm_campaign=bf-week). | Ready to post (Cris) |
| Sat 21 Nov, 09:00 | Dispatch No. 2 | Section 04 "Black Friday, the real deals", labelled "Advertising · affiliate links" | Draft, needs Cris's yes |
| Wed 25 Nov | Site (Claude) | Check that all 22 links on the BF page still open a live listing; swap any dead ones; commit; Cris pushes | To do |
| Fri 27 Nov, 10:00 | Instagram Story (1 frame) | "Annons · Black Friday is today. The accessories we're watching, and three checks before you buy" + link sticker (utm_campaign=bf-day) | To do |
| Fri 27 Nov, 18:30 | Facebook page | Same as the Story, as a labelled link post | To do |
| Mon 30 Nov, 10:00 | Instagram Story (1 frame) | "Annons · Cyber Monday, last day" + link sticker (utm_campaign=cyber-monday) | To do |
| Tue 1 Dec | Claude | Report: clicks and orders by tracking ID for 20–30 Nov (Associates Central) | To do |

## The one thing that would lift sales most: product images back
Amazon only allows product images and star ratings that come from its API, and the API needs 10 qualifying sales in 30 days. **We now qualify: 144 items ordered in the last 30 days** (Associates Central, 18 Oct to 16 Nov 2026).
1. Cris: in Associates Central → Tools → Creators API → Create App. Keep the keys private; never paste them into a chat.
2. Cris: add the two keys in Cloudflare Pages → Settings → Environment variables (AMAZON_CREATORS_ID, AMAZON_CREATORS_SECRET). Claude never touches Cloudflare or keys.
3. Claude: build a small step that fetches images from the API when the site builds, plus a daily rebuild so the image links stay under 24 hours old.
