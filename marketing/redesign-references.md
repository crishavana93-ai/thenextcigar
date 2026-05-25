# TNC Redesign — Reference Library & Direction Picker

Before we write any code, pick which **direction** the redesign goes. Three distinct aesthetic options below, each with 4-6 reference sites to look at. Spend 20 minutes browsing the references, pick one direction (or mix), and we build.

The links open in your browser — just paste each URL and scroll. No screenshots in this doc because they go stale; trust your eye on the live sites.

---

## Direction A — Quiet Luxury Editorial

**The vibe:** Cream paper. Big serif headlines. Tons of whitespace. Subtle gold accents. Slow fades. Feels like a private members' club magazine that ships once a quarter. Cigar Aficionado's content quality but Monocle's restraint.

**References (browse in this order):**

1. **Monocle** — https://monocle.com/ — the gold standard for restrained editorial typography. Look at the hero block, the way the section labels work, the masthead.
2. **Brunello Cucinelli** — https://www.brunellocucinelli.com/en-us — Italian heritage luxury. The "quiet" of luxury. Notice slow image fades, no clutter.
3. **Aesop** — https://www.aesop.com/ — type-led, almost no graphics, perfect kerning. If you wanted a "tobacco library" feel.
4. **The Yale Review** — https://yalereview.org/ — pure editorial restraint. Long-form done right.
5. **The Drift** — https://thedriftmag.com/ — sparse modern editorial. Cream + black + occasional accent.
6. **Apartamento** — https://www.apartamentomagazine.com/ — gorgeous slow photography, magazine-issue archetype.

**For TNC this means:**
- Cream/parchment background (we have one — `--color-bg-soft: #fafafa`)
- One serif typeface (Editorial New, PP Editorial Old, or Source Serif) for headlines
- One refined sans (Inter Tight, PP Neue Montreal) for body
- Gold (`--color-gold`) used surgically — section labels + small flourishes only
- Issue-based content presentation: "May 2026 issue, Issue 02"
- The Finder reframed as a department of the magazine, not the centerpiece

**Pros:** Hardest to get wrong, longest shelf life (won't look dated in 3 years), works for English + Swedish + Spanish readers without redesigning.
**Cons:** Quiet. Doesn't shout. Some users perceive "quiet" as "not a real business" — needs strong content to carry it.

---

## Direction B — Bold Magazine

**The vibe:** Big bold mastheads. Heavy photography. Multiple departments rail. More color, more visual energy. Feels like a magazine you'd see at a newsstand, not a private club. Air Mail meets Cigar Aficionado.

**References:**

1. **Cigar Aficionado** — https://www.cigaraficionado.com/ — the current incumbent in the cigar space. Dated UI but right content model.
2. **Air Mail** — https://airmail.news/ — Graydon Carter's email-first magazine. Modern editorial done bold.
3. **The Atlantic** — https://www.theatlantic.com/ — modern magazine layout, good rhythm between text + photos.
4. **GQ** — https://www.gq.com/ — premium men's magazine with strong product integration.
5. **The Robb Report** — https://robbreport.com/ — luxury lifestyle magazine, closest editorial direction to TNC's positioning.
6. **NY Mag's The Strategist** — https://www.nymag.com/strategist/ — bold + opinionated + product-led. Good model for combining editorial + Finder.

**For TNC this means:**
- Bigger hero images (Cuban torcedor photos, Havana street scenes)
- Multiple color accents (gold + burgundy + cream + black)
- Bigger typographic contrast
- Department-rail navigation
- The Finder lives at `/finder/` as a "Tools" department; the magazine is the homepage

**Pros:** Looks like a "real" magazine; easier to grow content team into; clearer mass-market appeal.
**Cons:** Harder to keep cohesive as it grows; more design decisions per page; can drift into "GQ-clone" if not careful.

---

## Direction C — Heritage Luxury

**The vibe:** Dark surfaces (#0a0a0a, #1a1a1a). Gold + cream typography. Museum-grade photography. Slow, controlled motion. Feels like Davidoff's flagship Geneva store turned into a website.

**References:**

1. **Davidoff Geneva** — https://www.davidoffgeneva.com/ — the actual cigar industry's premium standard.
2. **Patek Philippe** — https://www.patek.com/ — old-money web design. Heritage made digital.
3. **Loro Piana** — https://www.loropiana.com/ — quiet Italian luxury, white + cashmere palette but premium positioning.
4. **Hermès** — https://www.hermes.com/ — playful luxury, dark + color-rich, the gold standard for "luxury can be fun."
5. **Tiffany & Co.** — https://www.tiffany.com/ — heritage with motion. The blue is theirs; ours could be the gold.
6. **Cohiba (official)** — https://www.cohiba.com/ — what TNC's biggest brand looks like on the web. See what to beat.

**For TNC this means:**
- Dark default surface (we already have `.section-dark`)
- Gold + cream as primary palette
- Limited color introductions — every accent earns its place
- Heavy investment in original photography (a real budget)
- Slow Framer Motion entrances, no flashy effects
- Editorial restraint meets museum exhibit

**Pros:** Maximally aligned with the Cuban-cigar luxury heritage; differentiates from every other cigar site (none of them are this dialed-in).
**Cons:** Higher photography budget required; readability harder on dark surfaces; needs strict design discipline or it drifts to "tacky black-and-gold" fast.

---

## My recommendation

**Direction A (Quiet Luxury Editorial) is the strongest fit.**

Why:
1. **Content matches.** TNC's content (long-form Finder copy, vitola explainers, member stories) is editorial-first. Direction A *is* editorial-first.
2. **Sustainability.** You're one person. Direction B needs a content team to feed the bold mastheads; Direction C needs a photography budget. Direction A is sustainable for one founder.
3. **Differentiation.** Every cigar site already does Direction C (dark + gold). Every magazine startup does Direction B. Direction A is what nobody in cigars is doing — that's a moat.
4. **It works across languages.** The Finder serves Swedish, English, Spanish, German readers. Quiet typography travels across languages; bold mastheads don't.
5. **Long shelf-life.** 2030's TNC still works in Direction A. 2030's TNC in Direction B would feel dated.

**The pivot if Direction A doesn't fit:** Direction C as the Lounge app's aesthetic, Direction A as the magazine. Different aesthetic for the marketing surface vs the member surface is normal and works (cf. Substack publication vs Substack member app).

---

## Browse component templates (after picking direction)

Once you pick a direction, this is where to harvest specific components:

1. **21st.dev marketplace** — https://21st.dev/ — search for "hero", "magazine", "editorial". Browse by category. Most components ~$0-15.
2. **shadcn/ui examples** — https://ui.shadcn.com/examples — the canonical reference for shadcn-style components.
3. **Magic UI** — https://magicui.design/ — free animated components built for shadcn. Heavy on motion.
4. **Aceternity UI** — https://ui.aceternity.com/ — also free, more dramatic animations.
5. **Vercel templates** — https://vercel.com/templates — full project templates; many are magazine-shaped already.

For Direction A specifically, two scaffold-grade picks to download and read (don't install — just look):

- **Tailwind UI's "Salient" template** — https://tailwindui.com/templates/salient — close to what we want
- **Vercel's "Magazine Starter"** — https://vercel.com/templates/next.js/magazine-starter — Next.js, but the design tokens transfer directly

---

## What to do right now

1. Open all 6 links under your favorite direction. Spend 5 minutes per site.
2. Reply with: *"Direction A"* (or B or C, or "mix A's restraint with C's dark surface for the Lounge").
3. I take that decision + the existing TNC tokens + the UI/UX Pro Max stack and ship a new `/finder/` landing page within the next session. We use that one page as the design canvas — once it feels right, we extend to `/`, `/blog/`, `/lounge`.

The redesign is the only Phase 2 stream that I can't run in parallel — every other stream waits on which direction we pick. That makes this the highest-leverage 30 minutes of your week.
