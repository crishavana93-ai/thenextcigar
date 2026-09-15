# The shop, as an Instagram carousel — prompts

**15 September 2026.** One carousel of the whole shop, or one carousel per product family, from the same recipe. The recipe has two halves and they are kept apart on purpose: **Gemini makes the photograph; we set the type.** No model is trusted with a headline, a price or the masthead, so every prompt below asks for a picture with empty space, and the words go on afterwards in our template (Canva, or the carousel renderer in `docs/social/`).

## Why this layout converts

The carousels that sell accessories right now share four habits. Slide one is a photograph that could be a magazine cover, with one line of type and no product name — it earns the swipe, it does not sell. Every following slide is the *same composition* with a different object in it, so the thumb learns the rhythm and keeps going. Each product slide has one sentence of use ("three cigars is a weekend") and one fact ("cedar-lined"), never a spec list. The last slide is the only one with a price and a place to go. Saves and shares come from the middle slides; the sale comes from the last.

## The master style block

Paste this at the top of every prompt, unchanged. It is what makes fourteen pictures look like one shoot.

> Editorial product photograph for a broadsheet newspaper's shop page. Camera at 35 degrees above the table, 50 mm, subject centred in the lower two-thirds of the frame, the upper third of the frame left as calm empty walnut so a headline can be set there later. Dark walnut table, a single soft window light from the upper left, deep warm shadows, muted tones, faint film grain, slight vignette. Palette: dark walnut, oxblood, brass, off-white. Square 1:1, 2048 px. **Rules: no text of any kind, no logos, no brand names, no cigar bands, no labels on packets, no hands, no faces, no smoke, no whisky glass.** Cigars, where present, are plain and unbanded.

Reject any output that breaks a rule and send the line: *"Remove every band, label, logo and mark. Plain cigars, plain leather, plain metal, blank packets."*

## Slide 1 — the cover (no product name)

> [master style block] Subject: three kinds of cigar travel case in a loose row — a brown leather three-finger case with three plain cigars standing in it, one brushed aluminium tube with its cap beside it, and a small black hard-shell case open to show an empty foam tray. Nothing else on the table.

Type set afterwards, in the top third: **What travels well.** Kicker above it in small caps: *The Next Cigar · the shop*.

## Product slides — one object each, same composition

Each prompt is the master block plus one "Subject:" line. Keep the object alone on the table; the empty top third is not negotiable.

| # | Product | Subject line for Gemini | Type set afterwards (top third) |
|---|---|---|---|
| 2 | Cedar-Lined Three-Finger Leather Case | a brown leather three-finger cigar case, flap open, three plain cigars inside, a thin sliver of pale cedar visible at the lip | **Three cigars is a weekend.** · *Cedar-lined* |
| 3 | Four-Tube Travel Case with Cutter Set | a brown leather zip case open flat, four brushed metal cigar tubes in a row inside, a small flat cutter and a punch in the elastic beside them | **Four sealed tubes, three cuts.** · *Case, not humidor* |
| 4 | Leather Four-Cigar Case with Tool Pockets | a dark brown flap-top leather case standing upright, four plain cigars standing in it, a slim brass lighter and a small cutter in the two side slots | **The whole evening in one piece.** · *Lighter and cutter pockets* |
| 5 | Leather Zip Wallet for Cigars and Tools | a coffee-brown zip-around leather folio open flat, three plain cigars under an elastic strap on one side, a cutter and a lighter on the other | **The cheapest honest way to carry a night.** · *Overnight case* |
| 6 | Hard Travel Humidor for Ten | a matte black hard-shell travel case open, black foam tray cut for ten cigars, a round analogue hygrometer set into the lid, two cutters and a punch in the tray, two blank paper humidity packets | **A week away, humidified.** · *Ten cigars, hygrometer, cutters* |
| 7 | Aluminium Cigar Travel Tube | one brushed aluminium cigar tube, cap unscrewed and lying beside it, a single plain cigar half-drawn from the tube | **One cigar, sealed.** · *For the jacket pocket* |
| 8 | 4-in-1 V-Cutter Multitool | a compact black and steel cigar multitool, V-blade open, standing on its end beside one plain cigar | **One tool. V, straight, punch.** · *For the travel case* |
| 9 | Five-in-One Cutter Toolkit | a slim leather roll open flat, five small steel cigar tools laid in a row in their loops | **Every cut, one roll.** · *Five tools* |
| 10 | Lubinski Large-Diameter Guillotine | a large chrome double-blade guillotine cutter, blades open wide, a thick plain cigar resting in the aperture, a plain dark gift box behind it | **Built for the 60s.** · *Shipped from Germany* |
| 11 | Triple-Jet Torch Lighter | a matte black torch lighter standing upright, lid open, three unlit jets visible, one plain cigar beside it | **Three jets, no wind.** · *Torch* |
| 12 | Quad-Flame Lighter with V-Cutter | a gunmetal lighter with a fold-out V-cutter at its base, lid open, standing beside one plain cigar | **Light and cut, one hand.** · *Quad flame* |
| 13 | Jobon Triple-Flame Torch Lighter | a slim brushed-steel torch lighter lying at an angle, lid open, one plain cigar beside it | **The one that stays lit.** · *Triple flame* |
| 14 | Crystal Four-Rest Ashtray | a heavy clear crystal ashtray with four rests, empty and clean, catching the window light | **For four people who stay.** · *Crystal* |
| 15 | Mini Digital Hygrometer | a small round digital hygrometer face-up on a slab of pale cedar, display blank, beside two plain cigars | **Know the number.** · *Digital* |
| 16 | Two-Way Humidity Packs | three blank matte paper humidity packets fanned on cedar, one plain cigar across them | **Sixty-nine, all week.** · *Two-way* |
| 17 | Spanish Cedar Sheets | a short stack of thin pale cedar sheets, one leaning against the stack, two plain cigars resting on top | **Line anything.** · *Ten sheets* |

Numbers 10 and 15–16: if the model prints digits on the packets or a reading on the hygrometer, reject and resend the rule line; the numbers go on in our type, not the model's.

## Last slide — the only one with prices

Plain paper, no photograph: the masthead, "The Shop", and a four-line list in Newsreader — *Cases from $59 · Cutters from $69 · Lighters from $49 · Humidor from $109* — then **thenextcigar.com/shop** and the line the paper always ends with: *Drop-shipped, tracked, fourteen-day returns. Photographed by us when it lands.*

## The template (set once, reuse)

Square 1080×1080 export. Photograph full-bleed. In the top third, over the empty walnut: headline in Newsreader 400, 96 px, off-white `#F2F0EA`, two lines maximum, left-aligned at 80 px from the edge; kicker in IBM Plex Sans 500, 26 px, letter-spaced 0.2 em, small caps, oxblood `#7B2622` on a 6 px off-white underline. Bottom-right, 40 px from the edges: a thin off-white rule and *The Next Cigar* in Plex 24 px. Nothing else. No price on any product slide; no "shop now" stickers; no arrows.

## Caption (one for the whole set)

> The shop, in one swipe. Everything here is an accessory — we never sell tobacco — and every page says what we know, what buyers have reported, and what we have not verified yet. Our own photographs replace the supplier's the week each parcel lands. Link in bio.

Hashtags in the first comment, not the caption: #cigaraccessories #cigarcase #travelhumidor #cigarcutter #humidor #cigarlife #cigarsociety #thenextcigar.

## Posting order and what to watch

Post the travel-case family first (slides 1–6 + last slide) because the guide is live and the cutters guide is the site's fastest-growing page; then cutters (8–10), then lighters, then humidor care. Read saves/reach on slides 2–6 and link clicks on the last slide; if a product slide is where people leave, its sentence is wrong, not the photograph.
