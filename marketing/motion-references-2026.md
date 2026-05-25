# Motion references for TNC Direction A — May 2026

9 award-grade sites that show what's possible with the stack we already have (React 19 + Framer Motion + Motion-One + shadcn + UI/UX Pro Max). All verified live. Each entry includes the ONE thing to steal + the Framer Motion API to reach for.

---

## The 9 picks

### 1. i-D Spotlight: Elle Fanning — https://spotlight.i-d.co/ellefanning
**Framer Awards 2025, "Best Storytelling" winner.** Editorial long-read. Closest live reference to what a TNC review article should feel like.

- **Steal:** Section-by-section "scene change" — headline + lead image cross-fade as the column rebreaks. Serif drop-caps scale up on viewport entry.
- **Framer Motion:** `useScroll({ target: sectionRef, offset: ["start end", "start start"] })` + `useTransform` driving opacity 0→1 and y 24→0.
- **Difficulty:** medium · **Fit:** amplifies Direction A.

### 2. Vitra Panton — https://panton.vitra.com
**Framer Awards 2025, "Best Animations" winner.** Furniture treated as editorial.

- **Steal:** Hero word-by-word reveal. Each word fades + lifts independently; product silhouette settles last (mass arrives after meaning). Background colour shifts on scroll via 400ms crossfade keyed to `whileInView`.
- **Framer Motion:** `<motion.h1 variants={parent}>` with `staggerChildren: 0.05`; each word `variants={{ hidden:{y:'100%',opacity:0}, visible:{y:0,opacity:1, transition:{duration:0.6, ease:[0.16,1,0.3,1]}}}}`.
- **Difficulty:** medium · **Fit:** amplifies.

### 3. Ruinart "Digital Fresco" — https://fresque.ruinart.com
**Awwwards SOTD Apr 2026, makemepulse.** Champagne house — same luxury heritage register as cigar.

- **Steal:** Horizontal scroll through a panoramic illustration with text annotations fading over hotspots. Cursor stays default; hover targets get a 1px ring.
- **Framer Motion:** `useScroll` with horizontal container + `useTransform` to translate x; hotspots are `<motion.div whileInView={{opacity:1}} viewport={{once:true, amount:0.6}}>`.
- **Difficulty:** hard (full day) · **Fit:** amplifies as a *one-time* signature feature page only.

### 4. Floema — https://floema.com/en
**Awwwards SOTD May 13 2026, Bürocratik.** Bookshop/florist editorial — serif-led, oversized type, calm.

- **Steal:** Image reveals where photos slide up from behind a clip-path mask with 50ms delay after the caption. Captions sit *underneath* the image, not overlaid. The Cereal-print pattern, animated.
- **Framer Motion:**
  ```tsx
  <motion.div
    initial={{ clipPath: 'inset(100% 0 0 0)' }}
    whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
    transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
    viewport={{ once: true, amount: 0.3 }}
  />
  ```
- **Difficulty:** easy (1 hr) · **Fit:** amplifies. Highest-priority steal for blog templates.

### 5. Temper Studio — https://temper.studio
**Framer Awards 2025, "Best Visual Design" winner.** Minimalist e-commerce — silent, slow, premium.

- **Steal:** Product cards where hover does ONLY two things: image crossfade (no zoom, no tilt) + price slides up 4px revealing "View" link beneath. No spring overshoot. Discipline of *not* animating is the lesson.
- **Framer Motion:**
  ```tsx
  <motion.div whileHover="hover">
    {/* variants: { rest:{y:0}, hover:{y:-4, transition:{duration:0.25, ease:'easeOut'}} } */}
  </motion.div>
  ```
- **Difficulty:** easy · **Fit:** amplifies. Apply to Finder retailer/SKU cards immediately — currently they risk reading SaaS.

### 6. Cereal Magazine — https://readcereal.com
**The literal print-into-web reference.** 8-column grid, 6 type styles max, three grey tones.

- **Steal:** Grid discipline is the steal, not motion. One micro-pattern worth lifting: navigation reveal slides from top in 300ms ease-out, no backdrop blur — page behind stays crisp. Serif logo never animates.
- **Framer Motion:** `<motion.nav initial={{y:'-100%'}} animate={{y:0}} transition={{duration:0.3, ease:'easeOut'}}>`. Nothing more.
- **Difficulty:** easy · **Fit:** amplifies. Lift the 8-column grid wholesale.

### 7. Hermès — https://hermes.com
**Refreshed Jan 2026.** Hand-illustrated marginalia.

- **Steal:** Non-mechanical motion — illustrations enter `scale: 0.96 → 1` with a 2-3px x-jitter on a 60s loop. Reads as *breath*, not animation loop.
- **Framer Motion:** `animate={{ x:[0,2,-1,1,0], y:[0,-1,2,0] }} transition={{ duration:8, repeat:Infinity, ease:'easeInOut' }}` on SVG illustrations.
- **Difficulty:** medium (need commissioned illustrations) · **Fit:** amplifies *only if* TNC commissions real botanical/tobacco art. Stock will betray it.

### 8. Obys Agency — https://obys.agency
**Awwwards SOTD May 4 2026, Studio of the Year.** Typography-driven.

- **Steal:** Page transition where outgoing text translates up + *blurs* (8px → 0px) as new text comes in beneath. Every route treated as an editorial spread.
- **Framer Motion:**
  ```tsx
  <AnimatePresence mode="wait">
    <motion.main
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.main>
  </AnimatePresence>
  ```
  In Astro: mount on the React island that wraps client-navigated regions OR pair with Astro View Transitions + a small Motion-One blur shim.
- **Difficulty:** medium · **Fit:** amplifies. Steal the transition; ignore Obys's louder typographic gymnastics.

### 9. Apple — iPhone / Vision Pro product pages — https://apple.com
**Industry benchmark for scroll-driven motion.**

- **Steal:** Scroll-scrubbed video — device rotates as you read. Apple uses a sprite/video frame swap.
- **TNC adaptation:** ONE "hero artefact" (a specific cigar) rotates through its life-cycle (leaf → roll → ash) as you scroll the homepage hero. **Only ever once site-wide** — becomes a gimmick if repeated.
- **Framer Motion / Motion-One:** Pre-render the cigar as ~60 WebP frames. In a React island: `useScroll` on hero + `useTransform(scrollYProgress, [0,1], [0,59])` → render `frames[Math.round(index)]` via `<img>`.
- **Difficulty:** hard · **Fit:** amplifies *once*, damages on repeat.

---

## Synthesis — top 5 to ship next, in order

1. **Floema clip-path image reveal** (#4) — global image component. **1 hour. Ship first.** Replace every image entry animation in the system.

2. **Vitra Panton word-stagger headline** (#2) — one `<EditorialHeadline>` React island. `staggerChildren: 0.05`, ease `[0.16,1,0.3,1]`, 600ms. Use on hero + article H1 + section H2. Never on body, captions, UI labels.

3. **Cereal grid + Obys page-blur transition** (#6 + #8) — pair them. Cereal's 8-column grid as static skeleton; Obys's blur transition between articles makes the magazine feel like *one* publication.

4. **Temper "do less" hover law** (#5) — encode as a system rule: hover = max two properties, max 250ms, ease-out, never spring. Apply to Finder cards, Lounge thread cards, retailer cards. **Biggest defence against reading SaaS.**

5. **i-D Spotlight long-read scaffold** (#1) — build the article template around section-scene transitions: each H2 triggers a soft viewport fade + serif drop-cap scale-up. Makes a TNC review feel like *Monocle*.

**What to NOT take:** Apple's scroll-scrubbed device (until we have ONE signature artefact), Ruinart's full horizontal scroll (one provenance feature page only), Hermès marginalia (only with real commissioned illustrations). Anything custom-cursor, marquee-ticker, or WebGL-particle-heavy stays out — they shout, magazines whisper.

---

## Stack alignment

Every pattern above maps cleanly to the React 19 + Framer Motion + Motion-One stack already installed. **None require GSAP, Three.js, or Locomotive Scroll.** That means none threaten LCP/CLS budgets or the Astro shipping model.

For Astro-specific implementation:
- Pure-CSS reveals + Motion-One vanilla → use directly in `.astro` files (no React island)
- Variant-stagger or scroll-driven progress → React island with `client:visible` (loads only when scrolled to)
- Cross-page transitions → Astro's built-in View Transitions API (free), enhanced by Motion-One filter animations

---

## Sources verified live (May 25, 2026)

- Awwwards Sites of the Day, April + May 2026
- framer.com/awards (2025 winners list)
- readcereal.com, floema.com/en, panton.vitra.com, obys.agency, hermes.com, temper.studio, spotlight.i-d.co/ellefanning, fresque.ruinart.com, apple.com/iphone-air
