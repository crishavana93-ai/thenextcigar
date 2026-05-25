# Phase 2 — Beyond the MVP

The Finder is shipped, the Lounge app has the core features, the catalogue is at 50+ pins. Phase 2 is what turns TNC from "working product" into "category leader."

This doc is the working roadmap. Six parallel streams; the dependency graph is mostly clean — they can be sequenced but most don't block each other.

---

## Stream 1 — Lounge audit + bug sweep (foundation)

**Why first:** Everything else (app store, promo video, social) shows people *the product*. If the product has obvious bugs when 1,000 people land on it via TikTok next month, we lose the moment. The audit is the foundation under all the other streams.

**Scope, top-to-bottom:**

- **Auth flow:** sign-up → email confirm → first sign-in → "complete your profile" → land in /lounge/app/. Test on Safari iOS, Chrome desktop, Chrome Android. Check the OG Member auto-assignment fires correctly (date-based, must run before 1 June 2026).
- **Messaging:** Open thread → send → recipient receives in real time → optimistic-send doesn't double-render → emoji + paste-image works. Test across two devices simultaneously.
- **Finder section inside the Lounge:** Now includes country picker, watchlist, search, deal feed, premium tools teaser. Test catalogue filter, autocomplete dropdown, "save SKU" flow when signed in vs signed out.
- **Map (`/lounge/app/map/`):** All 55 curated pins render. Filter chips (members/lounges/hosts/events) toggle correctly. City picker works. Tapping a pin opens the popup with check-in CTA. Check-in fires Supabase write. Existing check-ins clear the 4-hour expiry correctly.
- **Places (`/lounge/app/places/`):** City typeahead works. Type filter works. The 55 curated places + any Supabase partners show up merged + deduped.
- **Events (`/lounge/app/events/`):** All-Europe view loads. Submit-shop form works and writes to Supabase. Email goes to guatabeycigars@gmail.com (we fixed the cris@ bounce).
- **Profile (`/lounge/app/profile/`):** Edit display name, city, flavor notes, strength, brands. Saves correctly. Recommendations on the Finder reflect changes.
- **Travel mode + Inbox + Directory + Submit-shop:** Sanity-check each route renders without console errors.
- **Watchlist save (public Finder):** Modal opens → submit fires `/api/watchlist/save` → confirmation email arrives via Resend → row appears in Supabase.
- **Service worker:** Hard-reload behavior, offline page fallback, the LOUNGE_APP_VERSION reset.
- **404 + 500 pages:** Custom pages render correctly.
- **Mobile menu (Lounge tab bar):** All tabs reachable, active state correct.

**Deliverable:** A bug list with severity (blocker / high / medium / cosmetic) + estimated fix time. Then we burn it down.

---

## Stream 2 — App Store launch (iOS + Android)

**The legal blockers first:**

Both stores enforce tobacco-content rules. Neither blocks "a directory + price comparison + community" for tobacco products outright, but you need:

- **Age gate** (18+ on entry, in-app — currently we don't have one)
- **Privacy policy URL** (we have `/privacy/` — needs a once-over for app-store completeness)
- **Tobacco/age-restricted content rating** on both stores
- **In-app purchases** for the Lounge $9/mo + $79/yr — Apple takes 30% (15% after year 1 on subscriptions). Working around this requires routing payment through Stripe on the *web* and having the app open the web for upgrade. Acceptable on Apple if the app itself never *shows* the subscription price — they call it "Reader app" exemption.

**Technical path (cheapest, fastest):**

PWA → Capacitor wrap. Steps:
1. `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
2. `npx cap init "The Next Cigar" com.thenextcigar.lounge --web-dir=dist`
3. `npx cap add ios && npx cap add android`
4. Generate icons + splash via `@capacitor/assets`
5. Build native shells, test in Xcode Simulator + Android Studio Emulator
6. Submit

**Account setup (Cris must do):**
- Apple Developer Program: $99/year, 1-2 day review for account
- Google Play Console: $25 one-time + 14-day "closed testing" requirement before public launch
- D-U-N-S number for Apple if registering as a business (free, takes 1 week)

**Estimate:** 2 weeks of work for Capacitor wrap + store assets + first review submission. Apple rejection rate first attempt is ~25% — plan for one re-submit.

---

## Stream 3 — Promo video production

**Three tiers:**

| Budget | Tier | Source | Turnaround |
|---|---|---|---|
| $200-500 | Fiverr Pro freelancer | fiverr.com/categories/video-animation/explainer-video | 5-10 days |
| $1,500-3,000 | Boutique studio | demoduck.com, smartshoot.com, the simple company | 3-4 weeks |
| $5,000-15,000 | Specialised agency | brevity.video, spielcreative.com, demoupcliplister.com | 6-10 weeks |

**Recommended for TNC right now:** Fiverr Pro tier — ~$300, 7 days, 60-second motion-graphics explainer. The product is already visually rich (the Finder, the map, the watchlist UI), so a screen-recording + voiceover approach works.

**Script outline (60 seconds):**
- 0-10s: "European cigar smokers waste hundreds chasing prices across 17 retailers. We built one page that ends that."
- 10-30s: Show /finder/ → click a country → click a SKU → show price ranking → highlight duty-paid badge
- 30-45s: "Save a price alert. The Finder emails you when any retailer drops below your target."
- 45-60s: "Join the Lounge — free for browse, $9/mo for unlimited alerts. The map shows every Casa del Habano in Europe. Smokers find each other in the next city."

**Deliverable:** Final 60s mp4 + 15s social cut + a 6s loop for Instagram Reels covers.

---

## Stream 4 — Social character + IG/TikTok

**The character:**

A persona, not Cris's personal account. Reasons: (1) the brand outlasts the founder, (2) it scales to a small team later, (3) it can be voiced by AI/automation when needed without breaking trust.

**Working name ideas (pick one):**

- **"El Habanero"** — narrator persona, voice of Havana, never on-camera but distinctive typeface + signature opening line
- **"The Torcedor"** — silhouette of a roller, voiceovers narrate stories
- **"Doce" (twelve, for the 12 vitolas)** — abstract character name, dark/gold aesthetic
- **TNC Editor's voice** — no character at all, just a strong editorial point of view (lowest-risk, highest-leverage; pick this if unsure)

**Content pillars (post categories):**

1. **News** — Habanos S.A. announcements, regional limited editions, price changes (3/week)
2. **Drops** — "Cheapest [SKU] in Europe right now" — direct repurpose of the Finder data (2/week)
3. **Education** — vitola explainers, how-to-light, blind taste reviews (1-2/week)
4. **Member stories** — quote cards from OG Members, with permission (1/week)
5. **Repost with credit** — beautiful cigar photography from creators, always tagged + DM'd permission (2-3/week)

**30-day content calendar:** I can draft this once you pick a character.

**Tools:**
- **Canva Pro** for post covers ($15/mo — has 100M+ free-license photos)
- **Buffer or Later** for scheduling ($15/mo)
- **Submagic** for TikTok auto-captioning ($16/mo)
- **CapCut** free for video editing

Total tool budget: ~$50/mo. Time: 4-6 hours/week.

---

## Stream 5 — Magazine-style site redesign

**The brief:** Move from "SaaS marketing site" → "editorial magazine that happens to have a price comparison tool."

**Reference points:**
- The Cigar Aficionado print magazine — masthead, departments, large hero photography
- Monocle Magazine online — typography-led, restrained palette
- The Drift / The Yale Review — content-first, slow reading
- Brunello Cucinelli's site — luxury Italian editorial without being garish

**Redesign scope:**
- `/` — masthead, current issue hero, departments rail (Cubans / Vitolas / Markets / Members), the Finder as one department not the centerpiece
- `/blog` — issue archive view; sort by department + date; the current "blog grid" becomes a "departments" view
- `/lounge` landing — keep current pricing structure but reskin to match magazine aesthetic
- Typography — serif headlines (Editorial New or PP Editorial Old), refined sans body (Inter Tight or PP Neue Montreal)

**Build approach:** Stay on Astro. The magazine layout is a 2-week reskin, not a re-architecture.

**Phase order:** Stream 1 (audit) must finish first. The magazine reskin doesn't help if the underlying app is buggy.

---

## Stream 6 — High-end UI tool research (Cris's IG reel reference)

**The IG reel Cris linked:** https://www.instagram.com/reels/DX7O_Q-AbbH/

I haven't been able to render Instagram content yet (auth-walled). Best guesses based on what "high-end UI builder + viral reel" usually means in 2026:

| Tool | What it is | Use for TNC |
|---|---|---|
| **Framer** | Visual website builder with motion + interactions | Magazine redesign frontend, but not the back end — lock-in trade-off |
| **Webflow** | More mature visual builder, harder learning curve | Same trade-off; bigger ecosystem |
| **Spline** | 3D scenes in browser | Hero illustrations on `/` and `/lounge`, e.g. a rotating 3D cigar |
| **Rive** | Vector animations that run lightweight on the web | Micro-interactions (the price ticker, the map pin entry animations) |
| **Lottie + LottieFiles** | After Effects → JSON animations | Same use case as Rive, more mature |
| **Three.js + GSAP** | Code-first 3D + motion | What we'd use if we want a fully bespoke hero scene |

**Action item:** Cris shows me what the reel actually demonstrates (screenshot or describe the UI) and we pick the right tool. My default recommendation if it's Framer-style fluid motion: **Spline for the hero illustration + Rive for the in-page animations + keep Astro/Tailwind for the rest of the site.**

---

## Suggested sequence

```
Week 1-2:  Stream 1 (Lounge audit + bug sweep)
Week 3:    Stream 4 (social character + first 30 posts) + Stream 6 (UI tool research)
Week 4-5:  Stream 5 (magazine redesign)
Week 6-7:  Stream 3 (promo video production)
Week 8-10: Stream 2 (app store submission)
```

The audit is the floor. The social character is the cheapest growth lever. The magazine redesign before the promo video matters because the video will *show* the site — and if the video shows the v1 site we'll regret it 6 months later. The app store is last because the wrap is mechanical once the audit + redesign are done.

Total: ~10 weeks of work to put TNC at "we're a real magazine + product, not a one-person side project."
