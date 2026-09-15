# The Next Cigar — Cinematic Rebuild Strategy

*Answering: (a) where is TNC now, (b) how do we take it to a Turquino-cinematic magazine, (c) accessories + merch + guayaberas + fabric, (d) Fastvertising, (e) Instagram question.*

Written 9 August 2026 · Cristian Ortiz Suárez · one internal strategy doc, not a client deliverable.

---

## 1 · Where TNC actually is right now

**Live site** — thenextcigar.com renders Direction A editorial cleanly. Home is masthead + three pillars + highlight news + latest news + videos + four category bands. Editorial voice is confident. Content depth is real: **56 stories**, categories humming (Cigar 101, Cubans, Havana Cigar Life, Cigar Culture, Cigar Accessories, Latest News, Cigar Events), affiliate disclosure present, newsletter live, Ascend/Amazon partnerize verifications live, socials wired (IG, YouTube, X).

**What's shipped that no one's noticed** — Finder is live with 162 verified prices across 116 retailers in 18 countries. The Behike 52 price-tracker piece is genuinely useful. Sweden retail guide is ranking. The Watch page pulls YouTube. The Lounge exists but reads as light.

**What's empty or unfinished:**

| Section | State |
|---|---|
| `/shop` | Route exists, effectively empty |
| `/watch` | Pulls YouTube feeds, works but visually flat |
| `/lounge` | Free tier exists; OG-Member gate live but no member content beyond the map |
| Fastvertising promo video (task #101) | Still pending |
| App Store launch (#143) | Pending |
| Social character / IG voice (#145) | Pending |
| Magazine-style redesign (#146) | Pending — this doc IS that |
| Merch / accessories | Doesn't exist |

**Recent commit tempo (last 20 commits):**

15 of 20 are `feat(redesign)` — Direction A editorial rollout across /, /finder/, /blog/[slug]/, /lounge/. Most recent: `fbc27a4 feat(redesign): Direction A stories rail`. All the Gott Eftermaten mockup files from earlier this session are still uncommitted in `marketing/`. Direction A works but it's *quiet*. It reads. It doesn't yet make anyone say "who built this."

That last sentence is the whole reason this document exists.

---

## 2 · The vision — Turquino-cinematic applied to TNC

**The unspoken advantage:** Turquino Studios is Cris's agency. TNC is Cris's magazine. The Turquino site (turquinostudios.com) is already the visual grammar Cris wants — full-bleed video hero, big cursor, marquee, numbered service props, "cinematic finish" as the recurring phrase. Making TNC feel like Turquino built it is not a stretch — it's *bringing TNC into alignment with the agency's own signature*.

**What "Turquino-cinematic magazine" means, translated to TNC:**

1. **Full-page video hero** where the current serif headline lives. Not a static Cohiba photo — a 12-second cinematic loop of tobacco leaves being sorted, a torcedor's hands, smoke curling over a Casa del Habano lounge in Havana. Poster fallback = current hero image.
2. **Giant custom cursor** that follows the mouse, dims on links, shows preview thumbnails when hovering story cards.
3. **Marquee band** between sections — the way Turquino does *"Websites ✳ Branding ✳ Marketing…"* — but ours reads: *"Havana ✳ Vitolas ✳ Finder ✳ Lounge ✳ Reviews ✳ News ✳"*.
4. **Numbered feature cards** — Turquino's "01 Website Building / 02 Branding" pattern — becomes ours: **01 The Finder · 02 The Lounge · 03 The Magazine · 04 The Shop**. Big serif number, single sentence, cinematic hover.
5. **Live demos, not screenshots** — Turquino's demos page is the model. On TNC that becomes: an interactive Finder widget on the homepage (pick a Cohiba, see live prices across 18 countries update); an animated "compare vitolas" strip on Cigar 101 stories; a "sample a lounge chat" tile that peeks at the members' feed.
6. **Cinematic scroll transitions** — page-to-page uses Obys blur (already shipped), reinforced with a slow horizontal camera pan on section changes (GSAP `ScrollTrigger` pin + `xPercent` translate — 6-line GSAP block).
7. **Video-in-card** — story cards on hover play a muted 3-second cinemagraph tied to the story (a Behike being cut, a Behike being lit, a Behike ashtray shot). Direction A stayed still. This moves.
8. **Sticky word-mark that dissolves** — the *"THE NEXT CIGAR"* wordmark stays pinned bottom-left through the entire scroll, letters dissolving and reforming as different sections enter view. Turquino runs the same trick with their `TURQUINO STUDIOS` mark.
9. **One-click CTA in every scene** — Turquino's *"One click. That's the whole ask."* becomes our *"One page. Every price."* on the Finder CTA and *"One room. All the smokers."* on the Lounge CTA.

**What we don't change:** the words. The 56 stories stay. The Finder data pipeline stays. The Lounge stack stays. This is a **skin + motion rebuild on top of the Direction A engine**, not a content rewrite.

**Tech stack for the rebuild** — no new dependencies, all already in the repo:

- **Motion**: Framer Motion (already installed) + GSAP + `@studio-freight/lenis` smooth-scroll (3 lines to add)
- **Video**: MP4 in `/public/hero/` — hero shot with cinemagraph mode
- **Custom cursor**: single React component, ~80 lines
- **Marquee**: single React component, ~40 lines
- **View transitions**: Astro's built-in `ViewTransitions` — already wired

Ship cost estimate: **6–8 days of my time (parallel to Cris)**, no infra changes, no cost to Cloudflare Pages plan.

---

## 3 · Scene-by-scene — what the new home would look like

| # | Section | Motion | Purpose |
|---|---|---|---|
| Scene 0 | Preloader — big serif `TNC` mark fades out over 800ms as hero video loads | Fade + blur exit | Sets cinematic register from the first millisecond |
| Scene 1 | Hero video (12s loop, muted, no controls) + one line of copy in Fraunces italic: *"For the ones who actually smoke."* + one CTA *"Enter the magazine"* | Ken-burns + custom cursor already active | The "moment" that makes people stop scrolling other tabs |
| Scene 2 | Marquee band — `Havana ✳ Finder ✳ Lounge ✳ Reviews ✳ Vitolas ✳ News` — infinite scroll left | Continuous CSS marquee | Bridges hero → structure |
| Scene 3 | **Four numbered pillars** — 01 Finder / 02 Lounge / 03 Magazine / 04 Shop — each with a live micro-demo (see Turquino demos page) | Pinned scroll with pillar changes | Communicates the whole product in 4 scrolls |
| Scene 4 | Cover story hero — largest-play, cinemagraph background, quote pulled out at 60vh height | Floema clip-path reveal (already shipped) | The one story we want you to read first |
| Scene 5 | Live Finder widget — pick a Habanos, watch prices populate | React island, real API | Turquino's "not screenshots" principle |
| Scene 6 | 6-card story rail with cinemagraph hovers | Apple Cards Carousel (already shipped, upgrade to autoplay preview) | Editorial density in one scroll |
| Scene 7 | Watch — YouTube feed styled as a video wall, autoplay muted on scroll-into-view | Grid + IntersectionObserver | Turns dead video links into a room |
| Scene 8 | Shop — 8 accessory tiles, Fastvertising-style copy, click-to-buy | Framer Motion stagger | The new money maker |
| Scene 9 | Membership — dark, still, single big serif quote from the Lounge, "Join us" button | No motion (rest moment) | Contrast breather + conversion |
| Scene 10 | Marquee footer — same band, this time with retailer names *"Noblego ✳ Cigarmust ✳ Cigarrspecialisten…"* | Marquee | Rounds the shape |
| Scene 11 | Newsletter capture, sticky wordmark dissolves into black | Fade | Ending shot |

Total: 11 scenes, each ~1-2 viewports. A person scrolling normally sees the whole story in 90 seconds.

---

## 4 · Motion patterns to steal directly from turquinostudios.com

I read the full site markup. These are the seven moves I'd port straight over, with the actual technique:

1. **Full-page MP4 hero, poster fallback.** `<video autoplay muted loop playsinline poster="…jpg">`. Turquino's is `assets/turquino-web.mp4`. Ours goes in `/public/hero/tnc-hero.mp4` — 8-12 MB, H.264, 1920×1080, loop-safe cut.
2. **"Scroll" cue letter-by-letter** in Turquino's hero corner. Direct copy — `[S] [C] [R] [O] [L] [L]` staggered.
3. **"Yes, the giant cursor is a metaphor. We're very deep."** — the self-aware caption under the hero. This copy voice is *Cris's voice.* Bring it. Our version: *"Yes, that Cohiba is real. So are the prices."*
4. **Numbered service cards with hover-lift + inline arrow** — Turquino's 01–06. Ours: 01–04.
5. **Marquee between every 2 sections** — infinite scroll band as a rhythm device. Uses `keyframes` + `will-change: transform`. 40 lines total.
6. **Trusted-by logo strip that loops** — Turquino has a client-logo marquee. Ours becomes a **retailer logo marquee** (Noblego, Cigarmust, Cigarrspecialisten, Cigarworld, EGM, Sub-Cinq…). Doubles as trust signal for the Finder.
7. **"One click. That's the whole ask." CTA block** — full-width, giant type, single button. Ours per page: home = *"One page. Every price."* / lounge = *"One room. Every smoker."* / shop = *"One click. It ships tomorrow."*

---

## 5 · Merch & accessories — the /shop rebuild

### 5a · Accessories — buy vs partner

**Recommendation: partner, don't inventory.** TNC's edge is editorial + audience. Holding stock is capital-intensive and slow. Every accessory brand below already has drop-ship or small-batch wholesale pathways. TNC lists them, edits them, ships them (their fulfilment, our checkout).

**Top 5 accessory suppliers worth contacting first (research verified):**

| # | Brand | Country | What | Tier | Wholesale to small EU? |
|---|---|---|---|---|---|
| 1 | **Adorini** | DE | Humidors, cabinets, accessories | Mid-premium | Yes — B2B-only site with retailer registration |
| 2 | **Les Fines Lames** | FR (Marseille) | Cigar knives, concrete ashtrays, punch bracelets | Premium | Yes — active pro program (`contact@lesfineslames.com`) |
| 3 | **Xikar** | USA (KC) | Cutters, torches, humidors | Mid | Yes — public wholesale page, ships EU via distributors (`info@xikar.com`) |
| 4 | **Prometheus International** | USA (CA) | Godfather lighters, God-of-Fire tier | Premium | Regional distributor model, 25 countries |
| 5 | **Elie Bleu** | FR | Marquetry humidors, ashtrays | Ultra-premium | Dealer program — vetted, low-volume friendly |

**Wildcard for differentiation:** **Passatore** (Italian, distributed via Bendixen-Braun DE) — carbon-fibre cases and cedar humidors that nobody outside DACH stocks. Ideal *"discovered here first"* editorial angle.

**What's actually trending in 2025-2026** (matters for what we merchandise):

- Tactile-luxury ashtrays as design objects — concrete, cast stone (Les Fines Lames' Beton line)
- Travel humidors + Boveda-compatible cases — post-pandemic travel driver
- Single-blade cigar knives — Les Fines Lames created a whole sub-category
- Hybrid torch/soft-flame lighters with refined finishes
- Premium leather 3-cigar cases — Google Trends spikes in 2025

**Outreach email template — TNC → supplier:**

> **Subject:** Wholesale enquiry — The Next Cigar (Malmö / Lisbon)
>
> I'm Cristian Ortiz Suárez, founder of **The Next Cigar** (thenextcigar.com), a European editorial platform focused on Cuban cigars. We operate a magazine, a price-comparison Finder indexing EU retailers, and a members' Lounge. We're opening an integrated accessories shop for our audience of quality-first European Cuban-cigar smokers.
>
> Your [product line] is a natural fit: [one specific reason — e.g., "your concrete Beton ashtray already appears in three of our editorial features"]. We'd like to explore a wholesale or drop-ship arrangement for the EU market — a curated capsule of 6-10 SKUs, scaling with proven sell-through. Editorial coverage (long-form review + newsletter feature) is part of the launch.
>
> Could you share your wholesale pricing, MOQ, EU logistics (we ship from Sweden/Portugal), and the name of the account manager we should work with? Happy to send our media kit and Q1 2026 marketing calendar.
>
> Best,
> Cristian Ortiz Suárez — guatabeycigars@gmail.com — thenextcigar.com

Priority order for the first three emails: **Les Fines Lames** (best story fit) → **Adorini** (best price-ladder for entry SKUs) → **Xikar** (best warranty story). Send this week.

### 5b · Merch — t-shirts and guayaberas

**T-shirts.** Existing print-on-demand infra beats trying to inventory. **Everpress** (UK) and **Printful** (EU warehouse) both do premium-weight tees with wholesale-quality print, no minimum. Design system: three or four hero graphics riffing on our editorial voice (a full-bleed vitola diagram, a Cohiba band typographic redesign, a *"For the ones who actually smoke."* small-print chest logo). Retail at €35-45. Zero inventory risk.

**Guayaberas.** This is the hero merch piece and the reason the whole line matters. Cris already has a maker/tailor. What's needed is *fabric that lives up to the story*.

### 5c · Guayabera fabric — full sourcing brief (research verified)

**What actually goes into a proper guayabera** — Grade A is either 100% Irish linen, cotton batiste (fine combed cotton), or a linen-cotton blend. Target weight: 100–150 gsm, apparel-weight, width 140–150 cm. Cream / white / beige / pale-blue palette.

**Five suppliers worth contacting** — verified live:

| # | Supplier | Country | MOQ | Ships EU? | Contact |
|---|---|---|---|---|---|
| 1 | **John England** — Northern Irish mill, Irish Linen Guild + Masters of Linen® certified. **The strongest lead.** | Northern Ireland | 6 m in-stock, 12 m bespoke | Worldwide | `johnengland@neillygroup.com` / +44 28 406 20400 |
| 2 | **Saber Fazer** — Porto shop, Portuguese-woven European flax, ideal Lisbon proximity | Portugal | 0.5 m | PT/EU standard | `info@saberfazer.org` |
| 3 | **Wild Linens** — OEKO-TEX Lithuanian linen, small-batch friendly | UK (Lithuania mill) | 6 m off-roll | Yes | `wildlinens.com/pages/wholesale` |
| 4 | **Mood Fabrics** — huge stock, Italian/Portuguese deadstock linen batiste regularly appears | USA | 0.5 yd retail; 20 yd wholesale | Yes + duty | `info@moodfabrics.com` |
| 5 | **Ropalino Mérida** — Yucatán guayabera atelier that often over-orders fabric | Mexico | Contact directly | Uncertain | `ropalino.com/?sl=en` |

**Boutique / authentic path** — Cuba is closed as a direct fabric supplier (US embargo). Yucatán fabric district (Mérida) is the realistic *"heartland"* lead. Ropalino above is the warmest intro — they speak "guayabera fabric" fluently.

**Realistic budget for a 50-shirt run:**

Each guayabera consumes ~2.5-3 m of 150 cm cloth (front, back, sleeves, pockets, pleats, +15% waste). So 50 shirts = ~140 m fabric.

| Tier | Source | €/m | 140 m total | €/shirt raw material |
|---|---|---|---|---|
| Budget | Fabriclore / Chinese/Indian linen | 8-15 | 1,100-2,100 | 22-42 |
| Mid | Saber Fazer / Mood batiste | 12-25 | 1,700-3,500 | 34-70 |
| **Premium (recommended)** | **John England Irish linen** | **35-55** | **4,900-7,700** | **98-155** |
| Ultra | John England bespoke | 60-90+ | 8,400-12,600+ | 170-250 |

**My recommendation for launch:** two-track. Order **3 m from Saber Fazer this week** (fast, cheap, Portuguese) to sew the first prototype and confirm the pattern with the tailor. Once prototype is approved, order **140 m from John England** at ~€40/m for the actual 50-shirt club-edition run. Hangtag reads *"Irish linen, Cuban cut, made for The Next Cigar in [tailor location]."* That's the story.

**Fabric-supplier outreach template:**

> Subject: Small trade order enquiry — guayabera-weight linen for Swedish/Portuguese label
>
> I'm Cristian Ortiz Suárez, founder of **The Next Cigar** (thenextcigar.com), with hubs in Malmö and Lisbon. We're producing a small-batch, magazine-branded guayabera with a tailor we work with, sourcing the cloth ourselves.
>
> First run: **10-20 m**, split across 3 colours (ivory, pale-blue, natural). Ideal spec: 100% Irish linen or fine linen/cotton blend, 100-140 gsm, 140-150 cm width, soft-washed handle. Please send: swatches, per-metre trade price at 10-20 m, shipping cost + lead time to Lisbon and Malmö.
>
> If this run works, we'd repeat 2-3× per year at 50-100 m.
>
> Best,
> Cristian Ortiz Suárez — guatabeycigars@gmail.com

---

## 6 · Fastvertising — how to weave it through

Turquino already has a blog post titled *"Fastvertising, explained — what Ryan Reynolds taught us about making ads people actually want to watch."* The concept is fully in Cris's playbook.

**Fastvertising translated to TNC:**

- **Merch drop announcements** in the tone of Ryan Reynolds' Aviation Gin — self-aware, one-take, funny, tight. The guayabera launch video is the first candidate: 30 seconds, phone-shot, cinematic grade, Cris in the shirt, one line of copy on screen: *"Turns out cigar smokers do have a uniform."*
- **Behike price-drop alerts** as social content — the Finder pings a drop, we shoot a 6-second video of Cris saying *"Cheapest Behike in Europe just moved 300 kr. It's Cigarmust. Link in bio."* Post within an hour. This is Fastvertising's whole premise.
- **Fastvertising blog category on TNC** — mirror the Turquino post but from TNC's angle. Draft: *"How we shot the guayabera launch on an iPhone in a Malmö park."* Ties Turquino ↔ TNC without either feeling like an ad for the other.
- **Retailer-of-the-week micro-ads** — 15-second Fastvertising spots for the retailers in the Finder. They pay TNC to make and run them. New revenue line, tiny production cost, on-brand for both agency and magazine.

**First Fastvertising asset to ship:** the guayabera launch video, timed to arrive the same week the John England fabric ships to the tailor. Countdown mechanic: *"14 days. 50 shirts. That's it."*

---

## 7 · The Instagram question

Cris asked: *combine professional shoot photos with @thenextcigar, or spin up a separate account for the photo shoots?*

**Recommendation: one main account, second account only if there's a merch/shop reason.**

**Why one main account:**

- @thenextcigar already exists in the site footer, has authority, and represents "the magazine + everything under it"
- Instagram audiences hate account fragmentation — every new account restarts the growth curve at zero
- Product photos WITH the story context (the Behike price piece + a shot of the Behike being cut) is *more* editorial than product-catalogue-only shots
- Turquino's own agency uses one account. Don't out-fragment the founder's own template.

**When you'd spin up a second:**

- If the merch line (guayabera + tees) grows to 20+ SKUs and needs a shoppable feed distinct from editorial → **@thenextcigar.shop** as a satellite account, linked from the main bio.
- Not before Q4 2026 unless merch demand explodes.

**What to change on the existing @thenextcigar account this month:**

1. Bio rewrite: *"European editorial for Cuban-cigar smokers. Prices, places, people. Read the Finder → thenextcigar.com/finder"*
2. Highlights covers redesigned in the same numbered-01/02/03 pattern as the new site
3. Grid strategy: alternate rows — story cover / product shot / behind-the-scenes shot — reads like a magazine spread when someone lands on the profile
4. First reel: the *"Yes, the giant cursor is a metaphor"* Turquino-style intro applied to the new site launch

---

## 8 · Suggested next three moves (in order)

**Move 1 — this week.** Send three supplier emails: Les Fines Lames, Adorini, Xikar. Send one fabric email: John England. Zero code changes required.

**Move 2 — next 10 days.** I build the cinematic-hero + custom-cursor + marquee upgrade on a new branch. You approve on Cloudflare preview. We merge. TNC visually enters Turquino register.

**Move 3 — next 3 weeks.** Sew guayabera prototype (Saber Fazer fabric, existing tailor). Shoot the launch video, Fastvertising style. First accessory partner (whichever of the three replies first) goes live in /shop with 3-6 SKUs. Announcement post on the reborn @thenextcigar with the new visual language.

Nothing here requires new infra, new hires, or spending before the first supplier confirms.

---

## 9 · Prompt appendix — starter prompts for the elements

*You said you want prompts later. Here's a two-line preview per element so you know the register I'll write them in. Each of these expands to a full 200-400-word prompt when you're ready:*

- **Hero video (Higgsfield / Runway):** *"Slow-motion shot, warm-tungsten backlight through smoke. Torcedor's hands rolling a Habano at a cedar table. 12s loop. Grain, filmic contrast, no dialogue."*
- **Custom cursor React component:** *"Astro/React island, tracks mouse via `useMotionValue`, expands 3× on hoverable elements, dims to 40% on video-scrub sections, dark-mode aware."*
- **Marquee band:** *"Infinite CSS marquee, 40 lines, `Havana ✳ Vitolas ✳ Finder ✳ Lounge ✳` motif, reversible on scroll direction."*
- **Guayabera launch reel (Fastvertising):** *"30-second phone shoot, Cris in cream Irish-linen guayabera at Malmö park bench, cinematic 24fps grade, one line of text: 'Turns out cigar smokers do have a uniform.' End card: thenextcigar.com/shop."*
- **Retailer-logo marquee:** *"Bottom-of-page marquee, greyscale retailer logos, hover-fills to brand colour, click-through to Finder country page."*
- **Accessory launch OG image:** *"Concrete Les Fines Lames Beton ashtray, single Cohiba resting, Malmö golden-hour light, editorial magazine layout with `01` overlaid in Fraunces italic."*

Ready when you say the word.

---

## Sources

**Turquino Studios reference (Cris's own agency):**
- [Turquino Studios — homepage](https://turquinostudios.com/)
- [Turquino Studios — Live demos](https://turquinostudios.com/demos.html)
- [Turquino Studios — Fastvertising, explained](https://turquinostudios.com/blog-fastvertising.html)

**Accessory suppliers:**
- [Xikar Wholesale](https://xikar.com/pages/wholesale)
- [Adorini](https://www.adorini.com/about_us)
- [Les Fines Lames — Contact](https://www.lesfineslames.com/en-usd/pages/contact-us)
- [Prometheus International](https://www.prometheuskkp.com/)
- [Elie Bleu](https://eliebleu.com/) · [Elie Bleu USA Dealers](https://www.eliebleu-usa.com/dealer-listing.html)
- [Passatore via Bendixen-Braun](https://bendixen-braun.de/en/collections/passatore)

**Fabric suppliers:**
- [John England Wholesale Irish Linen](https://johnengland.com/wholesale-irish-linen)
- [Saber Fazer](https://www.shop.saberfazer.org/en/products/white-linen-fabric)
- [Wild Linens](https://wildlinens.com/pages/wholesale)
- [Mood Fabrics](https://www.moodfabrics.com/pages/wholesale-fabric)
- [Ropalino Mérida](https://www.ropalino.com/?sl=en)

**Accessory trend research:**
- [Ultimate Luxury Cigar Accessories 2026 — Your Elegant Bar](https://yourelegantbar.com/blogs/cigars/ultimate-luxury-cigar-accessories-list)
- [Best Travel Humidors 2025 — Smoking Hub](https://smoking-hub.com/best-travel-humidors/)

**TNC current state:**
- [TNC — Homepage](https://thenextcigar.com/)
- [TNC — Cheapest Cohiba Behike 52 (May 2026)](https://thenextcigar.com/blog/cheapest-cohiba-behike-52-europe-may-2026)
- [TNC — Sweden's Premier Cigar Retailers](https://thenextcigar.com/blog/beyond-the-smoke-your-guide-to-swedens-premier-cigar-retailers-lounges/)
