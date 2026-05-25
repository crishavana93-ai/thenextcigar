# 21st.dev Component Picks — TNC Magazine

Curated list of 21st.dev components ranked by fit for Direction A (Quiet Luxury Editorial). All use only `framer-motion` (already installed) and work as Astro React islands.

---

## Top 3 to ship this week

### 1. Magic UI — Number Ticker
- **URL:** `https://21st.dev/magicui/number-ticker`
- **Lands:** Homepage Finder stats strip · /finder/ result counts
- **Why:** Numbers ticking up in Inter Tight tabular-nums next to a gold rule = Monocle data callouts.
- **Override:** Default easeOut → slower `[0.16, 1, 0.3, 1]`. Disable decimals.
- **Install:** `npx shadcn@latest add "https://21st.dev/r/magicui/number-ticker"`

### 2. Aceternity — Apple Cards Carousel
- **URL:** `https://21st.dev/community/components/aceternity/apple-cards-carousel`
- **Lands:** Homepage "This Week's Stories" rail below the hero
- **Why:** The Hodinkee/Apple pattern. The single biggest component for establishing editorial credibility.
- **Overrides:** rounded-3xl → rounded-sm. Strip gradient overlay → 30% cream-to-transparent mask. Replace bouncy spring → `duration: 0.6, ease: [0.22, 1, 0.36, 1]`.
- **Install:** `npx shadcn@latest add "https://21st.dev/r/aceternity/apple-cards-carousel"`

### 3. Aceternity — Hero Parallax
- **URL:** `https://21st.dev/community/components/aceternity/hero-parallax/default`
- **Lands:** Homepage hero — three rows of cigar imagery that drift on scroll
- **Why:** Replaces static hero with motion that says "magazine" not "SaaS landing"
- **Overrides:** Cut parallax delta in half. Drop rotateX. Cream wash behind headline overlay.
- **Install:** `npx shadcn@latest add "https://21st.dev/r/aceternity/hero-parallax"`

---

## Tier 2 — Next 2-3 weeks

### 4. Aceternity — Sticky Scroll Reveal
- **Lands:** /lounge/ "How TNC works" + /blog/[slug] photo-essay features
- **Floema-esque** — text scrolls, image stays sticky
- **Install:** `npx shadcn@latest add "https://21st.dev/r/aceternity/sticky-scroll-reveal"`

### 5. Aceternity — Bento Grid
- **Lands:** Homepage ThreePillars upgrade + /lounge/ member benefits
- **Override:** Hairline 1px borders, rounded-sm, strip hover-glow
- **Install:** `npx shadcn@latest add "https://21st.dev/r/aceternity/feature-section-with-bento-grid"`

### 6. Magic UI — Marquee
- **Lands:** Homepage "Today's Drops" thin rail (28px secondary strip ONLY — never primary nav)
- **Override:** Slow to 60s/loop. Hard cream cutoff (not gradient). All-caps Inter Tight 11px tabular-nums. Pause-on-hover ON.
- **Install:** `npx shadcn@latest add "https://21st.dev/r/magicui/marquee"`

### 7. Aceternity — Card Hover Effect
- **Lands:** /blog/ index grid + /finder/ retailer cards
- **Why:** "Blur the rest" focus pattern is editorial. Drop the gradient border for a 1px gold left rule.
- **Install:** `npx shadcn@latest add "https://21st.dev/r/aceternity/card-hover-effect"`

---

## Tier 3 — Nice to have

### 8. Aceternity — Parallax Scroll (image grid)
- **Lands:** /lounge/ member gallery, /blog/ photo essays

### 9. Reuno UI — Card Carousel (no autoplay)
- **Lands:** /lounge/ member testimonials. Source Serif 4 italic quotes, Inter Tight all-caps attribution.

### 10. Serafim — Hover Effect (clip-path)
- **Lands:** /blog/ editorial cards, /finder/ SKU rows. Print-magazine reveal.

---

## Rejected (would damage Direction A)

- 3D Marquee · Aceternity 3D Card Effect · Animated Text Hover · Magic UI Feature Block (gradient-glow) · Any auto-rotating slider · Bouncy spring components · Glassmorphism · Custom cursors

---

## Drop cap

21st.dev doesn't have an editorially-correct one. We already built our own in `src/styles/global.css` — Source Serif 4 at 5.2em, float-left, scale-in on page load. **Keep ours.**

---

## How to install (Claude Code or terminal)

```bash
cd ~/Documents/thenextcigar
npx shadcn@latest add "https://21st.dev/r/magicui/number-ticker"
npx shadcn@latest add "https://21st.dev/r/aceternity/apple-cards-carousel"
npx shadcn@latest add "https://21st.dev/r/aceternity/hero-parallax"
```

Each writes a new `.tsx` into `src/components/ui/`. Then I (in Cowork) wire them into the right page with Direction A overrides.

---

## Combined effort to ship Top 3

~1.5 days of focused work. None introduce new dependencies (all use framer-motion already in `package.json`). All work as React islands with `client:load` / `client:visible`.
