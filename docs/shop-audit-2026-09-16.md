# Shop audit — 16 September 2026, desktop and phone

Checked after the CIGARLOONG rebuild: 15 live lines, cart, total-order discount, filter chips, folded sections and sticky add-to-cart on phones. Rendered at 1200 px and 390 px.

## What is in place (and why it matters for conversion)

- One-page product → cart → Stripe Checkout, no account, address and phone collected by Stripe, Apple Pay / Google Pay appear automatically once enabled in the Stripe dashboard. Guest checkout is the single biggest conversion lever; done.
- Price shown with an EUR/SEK/GBP approximation at the ECB rate, and the delivery promise (free, tracked, duties included, 1–2 weeks, 14-day return) sits next to the button, not in a footer.
- Add to cart with immediate feedback, a persistent cart bar showing pieces and total, and a cart page with quantity controls, the discount as a line, the "add N more for X% off" nudge and a three-card cross-sell. The discount is charged as one Stripe discount line so the receipt matches the page.
- Phone: sticky add-to-cart bar when the buttons scroll away; Amazon-style folded sections (About open; The file and Also in this drawer closed); sticky filter chips on the shop index.
- Honesty as the trust signal: "held, not just listed", maker's photos labelled as the maker's, no invented reviews, no fake scarcity. Product JSON-LD with offers for Google Shopping listings.

## Still to do, in order of return

1. Stripe dashboard: turn on Apple Pay and Google Pay (Settings → Payment methods) and add thenextcigar.com as an Apple Pay domain. Cris. Ten minutes; the largest remaining mobile-conversion gain.
2. EUR pricing. Readers in Germany pay in USD and their bank converts; charging EUR (Stripe multi-currency prices) removes a hesitation for the biggest market. Half a day once the DDP quote fixes the cost base.
3. Post-purchase: the customer email exists; add a second email at "shipped" with the tracking number (needs the tracking number from the supplier per order → a small admin form or a Supabase row edit that triggers Resend). One day.
4. Retention: a "Join the Lounge" line on the thank-you page and in the order email with the parcel-card QR link; first-order members get their passport stamp for the city they ordered from. Half a day.
5. Abandoned cart: cart is client-side only, so no email recovery. Cheap version: a Lounge member's cart syncs to their profile and the Weekend Edition mentions it. Later.
6. Reviews from real buyers only: after delivery + 10 days, an email asking for one line and a photo; shown on the product page with the date. Needs (3).
7. Header cart icon on non-shop pages — today the count shows only inside the shop. Small.
8. Photography: replace maker's images with our own when samples land; product video for the lighters (flame in wind) is the one asset that sells lighters.

## Not doing, on purpose

Countdown timers, "12 people are viewing", fake low-stock flags, exit pop-ups, discount pop-ups on entry. They lift short-term conversion and cost the paper its credibility, which is the asset the shop rides on.
