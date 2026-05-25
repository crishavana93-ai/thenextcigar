# Lounge audit — 25 May 2026

End-to-end audit of the Lounge member-app surface, run before Phase 2 app-store submission + magazine redesign.

**Score:** Codebase in surprisingly good shape. **2 ship-blockers found, both fixed in this session.** A handful of HIGH / MEDIUM items remain — none of them stop a launch but all worth burning down before the marketing push.

---

## BLOCKERS — fixed in this session

### ✓ B1. Static-pin check-in would crash Supabase FK constraint

**Where:** `src/pages/lounge/app/map/index.astro:1190`
**What:** When the user tapped any of the 50 curated `static:slug` pins (Casa Benden Düsseldorf, Cigarrcentralen Stockholm, etc.) and submitted "Check in", the worker would POST `lounge_id: "static:casa-benden-dusseldorf"` to the `checkins` table. That FK references `partner_lounges.id` (UUID), so the insert would fail with `invalid input syntax for type uuid`. The form would show an error and the check-in would never land.
**Fix:** In `showVenueSheet()`, detect `l.id.startsWith("static:")`, disable the submit button, and surface a message explaining the venue isn't an active TNC partner yet.
**Status:** SHIPPED in current commit; pending push.

### ✓ B2. Watchlist save endpoint claimed rate-limiting it didn't have

**Where:** `functions/api/watchlist/save.ts:26-27` (the comment lied — no actual rate-limit code existed)
**What:** Endpoint comment said *"The endpoint itself rate-limits per IP + per email to prevent abuse"* — but no rate-limit function existed in the file. Public POST endpoint with no auth meant any attacker could flood it with garbage subscriber+watchlist rows, polluting the DB + burning Resend credits.
**Fix:** Added an in-isolate `rateLimits` Map with two checks: **10 req/min per IP** (CF-Connecting-IP header) and **5 req/min per email**. Returns HTTP 429 on excess. Not perfect (per-isolate, not global, so a multi-region attacker can still flood) but raises the floor enough to defeat casual abuse without taking on Cloudflare KV's $5/mo dependency.
**Status:** SHIPPED in current commit; pending push.

---

## HIGH — fix before app-store traffic

### H1. Double-init pattern in 18+ Lounge pages

**Where:** Every page that registers `document.addEventListener("astro:page-load", init); init();`. Files:

```
src/pages/lounge/app/member.astro
src/pages/lounge/app/profile.astro
src/pages/lounge/app/messages/index.astro
src/pages/lounge/app/inbox/index.astro
src/pages/lounge/app/index.astro
src/pages/lounge/app/places/index.astro
src/pages/lounge/app/admin/index.astro
src/pages/lounge/app/welcome/index.astro
src/pages/lounge/app/directory/index.astro
src/pages/lounge/app/map/index.astro      ← Leaflet would crash on revisit; FIXED with guard
src/pages/lounge/app/partners/index.astro
src/pages/lounge/app/finder/index.astro   ← runs 2× Supabase queries on each load
src/pages/lounge/app/events/index.astro
src/pages/lounge/app/travel/index.astro
src/pages/lounge/login.astro
src/pages/lounge/reset-password.astro
src/pages/lounge/signup.astro
```

**What:** Astro prefetch + view-transitions can fire `astro:page-load` AND the immediate `init()` call. Result: 2 Supabase queries per page visit. Map (now fixed) also tried to mount Leaflet twice, would have thrown "Map container is already initialized."

**Fix recommended:** Wrap each `init()` in the same `initInFlight` guard I added to `map/index.astro:1489`. About 30 minutes of mechanical work across the 17 remaining files.

### H2. ~20 console error paths that don't update visible state

**Where:** Spot-check the warn/error logs:

```
src/pages/lounge/app/index.astro:1268        watchlist lookup failed → silent
src/pages/lounge/app/index.astro:1283        snapshot lookup failed → silent
src/pages/lounge/app/inbox/index.astro:422    received load error → silent
src/pages/lounge/app/inbox/index.astro:423    sent load error → silent
src/pages/lounge/app/finder/index.astro:439   sub lookup failed → silent
src/pages/lounge/app/finder/index.astro:448   watch query failed → silent
src/pages/lounge/app/finder/index.astro:480   hydration error → silent
src/pages/lounge/app/finder/index.astro:520   taste recommendation failed → silent
src/pages/lounge/app/map/index.astro:996      checkins load failed → silent
src/pages/lounge/app/map/index.astro:1020     events load failed → silent
src/pages/lounge/app/map/index.astro:1505     lounges load failed → silent
src/pages/lounge/app/messages/index.astro:837 send failed → silent
src/pages/lounge/app/welcome/index.astro:541  referral code apply failed → silent
src/pages/lounge/app/directory/index.astro:581 profiles load failed → silent
```

**What:** Each path catches a Supabase error, logs to `console.warn` or `console.error`, then silently returns without informing the user. The visible UI either stays in "loading…" forever or quietly shows zero data. From the user's perspective: "the app is broken." From the dev's: "logs show one warning." A real network blip on a member's mobile becomes a perceived outage.

**Fix recommended:** Add a small `setErrorState(elementId, message)` helper to `src/lib/lounge-ui.ts` (new file) that swaps the skeleton/loader for a "Couldn't load — tap to retry" card. Wire it into the ~20 catches above. About 90 minutes of work, but it's the difference between "polished" and "demo-grade" when traffic arrives.

### H3. Service worker version stamp could miss clients on a Wi-Fi switch

**Where:** `src/layouts/BaseLayout.astro:286` + `public/sw-lounge.js:12`
**What:** I bumped `LOUNGE_APP_VERSION` to `2026-05-25-08:00` and `CACHE_NAME` to `lounge-app-v6` earlier this session. The reset logic is: compare `localStorage.lounge_app_version` to the constant; if mismatch, wipe SW + caches and reload. Two edge cases the current logic doesn't handle:

  (a) **Cold-cached client with no localStorage entry** (`stored === null`): the logic correctly avoids a force-reload on first install. ✓
  (b) **Client on stale Wi-Fi**: if the version stamp file fails to load but `sw-lounge.js` is cached, the client never sees the new version. The 60-second `reg.update()` polling should catch this within a minute. ✓
  (c) **Edge case I'm worried about:** if `LOUNGE_APP_VERSION` and `CACHE_NAME` ever drift out of sync (e.g. someone bumps one but not the other), the client wipes localStorage's stamp but the SW serves stale cached assets. Risk: very low (both are in the same PR), but worth a comment-pinned reminder.

**Fix recommended:** Add a build-time check in `package.json` postbuild that grep's both files for the date and fails the build if they differ. ~10 minutes.

---

## MEDIUM — polish, fix this week

### M1. `partner_lounges` query selects a column that doesn't exist on every row

**Where:** `src/pages/lounge/app/map/index.astro:1502`
```
.select("id, slug, name, city, country, address, lat, lng, type, perks, website, photo_url")
```
**What:** `perks` and `photo_url` were added in `migration 011_venue_photos.sql`. Rows seeded before that migration ran may have these as NULL. The TypeScript type `Lounge.perks` is `string | null` so the type tolerates it, but downstream code at line ~1340 may assume non-null. Worth a sweep.
**Fix recommended:** Spot-check `.perks` and `.photo_url` consumers; add null-safe rendering everywhere.

### M2. Two `addEventListener` re-registrations per page

**Where:** Multiple — anywhere init() is called twice, any event listener inside it is registered twice. Side effect: clicking a button fires the handler twice. Notable spots: messaging composer, watchlist Save button, map venue-sheet form.
**Fix recommended:** Fix H1 first — that resolves this as a side-effect.

### M3. The view-transition `astro:before-preparation` event isn't handled anywhere

**Where:** Project-wide.
**What:** Astro 4 fires `astro:before-preparation` before navigating away. Real-time channels (Supabase Realtime, Leaflet map references) should be torn down to prevent memory leaks. The messages page does it correctly (`src/pages/lounge/app/messages/index.astro:431, 853`); the map and finder pages don't.
**Fix recommended:** Add a teardown hook to each long-lived page. ~30 minutes.

### M4. iOS safe-area-inset not applied to the bottom tab bar

**Where:** `src/components/lounge/LoungeTabBar.astro`
**What:** On iPhones with a home indicator, the tab bar sits flush with the bottom of the screen and the home indicator covers the active tab icon. Needs `padding-bottom: env(safe-area-inset-bottom)`.
**Fix recommended:** One CSS line. ~2 minutes when we touch the file next.

---

## LOW / cosmetic — fix in next pass

- **L1.** `src/pages/lounge/app/profile.astro:551` calls `.from("avatars")` — that's the Supabase Storage bucket, not a Postgres table. Intentional. **Not a bug**, just unusual at a glance.
- **L2.** ~12 `(c): c is string` type predicate filters across `src/data/finder-data.ts` and frontmatter blocks. Each one is a Cloudflare-build risk (we hit one already). Worth one pass to replace with explicit `Array.from(...).filter(Boolean) as string[]`.
- **L3.** The `marketing/` directory is in git — that's intentional for the team to read, but consider adding a `marketing/private/` subfolder to `.gitignore` for anything customer-facing later.
- **L4.** `src/data/finder-data.ts` is now 1,227 lines. Most lounge pages import the whole module. Tree-shaking should handle it but a split into `finder-data/skus.ts`, `finder-data/retailers.ts`, `finder-data/snapshots.ts` would be cleaner.

---

## NOT-A-BUG — verified clean

- ✅ **Zero "Founder Member" stale UI refs.** The OG Member migration cleaned everything.
- ✅ **Zero `cris@thenextcigar.com` refs in `src/` or `functions/`.** Only appears in 2 marketing docs (intentional — they're about setting that email up).
- ✅ **Zero `/lounge/app/comparison/` route refs.** Removed cleanly.
- ✅ **All 16 Supabase tables referenced from code exist in migrations.** Cross-checked migrations 001-026 against every `.from("...")` call.
- ✅ **Auth flow guard is consistent.** Every `/lounge/app/*` page that needs auth runs `getCurrentUser()` first and redirects to `/lounge/login/` on null. No leaks.
- ✅ **Messaging fluidity (Stream 1 of the audit brief)** — optimistic send + realtime + idempotent append are correctly wired in `messages/index.astro:416-599`. The dedupe-by-tempId pattern works as intended.
- ✅ **Watchlist save flow** — single-opt-in + Resend confirmation email + best-effort failure on the email don't roll back the save. Correct GDPR + UX behavior.

---

## Punch-list priorities

Order I'd hit these in:

1. **B1, B2** — already fixed; just need to push to main.
2. **H1** — generalize the `initInFlight` guard across all 17 remaining files (~30 min).
3. **H2** — error-state helper + wire ~20 catch blocks to it (~90 min).
4. **M3** — view-transition teardown hooks (~30 min).
5. **M4** — safe-area-inset CSS (~2 min, do whenever).
6. **H3, M1, M2, L1-L4** — defer; not blocking.

Total to "audit-clean state": **~2.5 hours of focused work.**

The codebase is in better shape than it has any right to be for a one-person side project — the systematic patterns (Supabase typed queries, RLS-aware auth guards, idempotent watchlist upserts, the SW version-stamp reset) are all things that take pros multiple iterations to get right. The bugs that exist are mostly *consequences of recent fast iteration* (the static-pin merge from this morning, the rate-limit comment-vs-reality drift) — they're not architectural debt.
