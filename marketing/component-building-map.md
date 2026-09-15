# Where to build components — the tactical map

Companion to `component-prompt-stack.md`. That file said *what each tool is for*. This one says *what command/prompt to actually run* for each kind of work.

---

## The five common jobs

### Job 1 · Find an existing component to install

You want a date-picker, a carousel, an accordion, a number ticker. You don't want to write it from scratch.

**Path:** 21st.dev → shadcn CLI → adapt to Direction A (or GE concept).

```
Step 1.   In this chat, tell me: "I need a [component name] for [page]."
Step 2.   I search 21st.dev/community/components for the closest match.
Step 3.   I show you 2-3 options (different visual takes).
Step 4.   You pick one.
Step 5.   I run, in Claude Code:
              npx shadcn add "https://21st.dev/r/<author>/<component>"
          Or if shadcn fallback fails:
              npx shadcn add "https://ui.aceternity.com/registry/<component>.json"
Step 6.   The component lands in src/components/ui/.
Step 7.   I edit it to match Direction A tokens (gold accent → oxblood for GE,
          rounded-3xl → rounded-sm, useSpring → useTween, etc.)
Step 8.   I wire it into the Astro page that needs it.
```

Real example we just shipped: **NumberTicker** (Magic UI) wired into `ThreePillars`. The default used `useSpring` with floppy bounce — wrong for editorial. Claude Code rewrote it to `useTween` with `[0.16, 1, 0.3, 1]` ease.

---

### Job 2 · Build a brand-new component from scratch

The 21st.dev search came back with nothing, or you don't want a dependency.

**Path:** Cowork (here) → drop a file directly via `Write`.

```
Step 1.   Describe the component: shape, behaviour, props, motion.
Step 2.   I draft a TSX/Astro file in src/components/ui/.
Step 3.   You preview the Cloudflare branch.
Step 4.   You give feedback. I iterate.
```

Real example: **EditorialStoriesRail** — Aceternity's apple-cards-carousel was 296 lines and pulled `next/image` (Next.js only). I wrote a clean 120-line replacement matching their UX but built for Astro + Direction A. No dependency, no migration cost.

---

### Job 3 · Visual prototype of a redesign (no commits, no build)

You want to see what something COULD look like before deciding whether to build it.

**Path:** Cowork → standalone HTML file → opens in any browser.

```
Step 1.   Tell me what the redesign is and any reference sites/photos.
Step 2.   If reference photos are needed: I use Chrome MCP to scrape them
          from the live site (like we just did with gotteftermaten.se).
Step 3.   I write marketing/<project>-mockup.html — single file, no build,
          embeds Google Fonts, uses real images via direct URL.
Step 4.   You open it from /Users/cristianortizsuarez/Documents/thenextcigar/
          marketing/ — works on your machine, can be emailed/shared as-is.
Step 5.   When approved, the mockup becomes the spec.
```

Real example: **gotteftermaten-mockup-v2.html** — full-page prototype with
the actual cigar-band photo from their hero, real product photos from their
catalogue, real prices, real shop hours scraped from their footer. Zero build
step. Opens in any browser.

---

### Job 4 · Generate AI imagery for hero shots

You want product photography that doesn't look like stock photo crap.

**Path A — Higgsfield MCP (when auth is fixed):**

```
Step 1.   Tell me the shot: subject, mood, lighting, camera, format.
Step 2.   I call mcp__68ea5c73__generate_image with a detailed prompt.
Step 3.   You approve / iterate.
```

**Path B — Higgsfield broken (current state):**

Higgsfield MCP is currently returning "User not found" — auth handshake broken.

```
Workaround:   I write the optimized prompt here in chat. You paste it into
              higgsfield.ai directly via web. Or use Gemini Imagen / Midjourney
              for the same prompt. Save the result to /uploads/, point me at it,
              and I'll wire it into the page.
```

**Path C — Lazy fallback that still looks good:**

Pexels stock with `?auto=compress&cs=tinysrgb&w=2400` — works for hero backgrounds when the actual product isn't the subject. We used this for the homepage Cohiba shot before the redesign.

---

### Job 5 · Wire a component into a page and ship it

The component exists, it's beautiful, you want it live.

**Path:** Claude Code in your terminal.

```
Step 1.   In this chat: "Ship <component> on <page>."
Step 2.   I dispatch a Claude Code agent with full context about Direction A,
          existing components, and the page structure.
Step 3.   Claude Code runs in worktree isolation (.claude/settings.json has
          bgIsolation: "none" so it can write directly), modifies the page,
          runs the build, opens a preview branch on Cloudflare.
Step 4.   You scroll the preview on phone + desktop.
Step 5.   When approved, Claude Code commits + pushes to main → Cloudflare
          deploys to production automatically.
```

The reason we use Claude Code instead of just Cowork for this: edits across
8+ files (page + component + tests + types + tailwind config + content
collection schema) are faster as one tool than 8 round trips through me.

---

## The decision tree

```
Do you know the exact component you want?
  ├─ Yes → Job 1 (find + install)
  └─ No  → Describe what it should do
              ├─ "Like X on site Y" → Job 1
              ├─ "Nothing exists yet" → Job 2
              └─ "Not sure, want to see options" → Job 3 (prototype first)

Do you want to see it before building?
  ├─ Yes → Job 3 (mockup)
  └─ No  → straight to Job 1 or 2

Do you need a photograph?
  ├─ Of a real product you own → take iPhone shot, drop in /uploads/
  ├─ Of a concept / mood → Job 4 (Higgsfield or fallback)
  └─ Already exists somewhere → Chrome MCP can scrape it

Ready to ship?
  → Job 5 (Claude Code worktree)
```

---

## What goes WHERE

| If you want to... | Tell me here in Cowork | OR run yourself in Claude Code |
|---|---|---|
| Sketch a component design | "Show me a [thing] for [page]" | n/a |
| Install a 21st.dev component | "Install [URL] for [page]" | `npx shadcn add <url>` |
| Build a custom component | "Write a [component] that does X" | `claude` then describe |
| Prototype a full redesign | "Build a mockup of [vision]" | n/a |
| Generate a hero photo | "Generate a Higgsfield image of X" | n/a (no terminal needed) |
| Ship something live | "Ship [component] on [page]" | `claude` then describe |
| Scrape a site for reference | "Look at <site> and tell me X" | n/a (Chrome MCP is here) |
| Fix a bug | "Fix [bug] in [file]" | `claude` for multi-file fixes |

---

## The "completely different concept" workflow we just used

For **Gott Eftermaten v2**, the divergence from TNC Direction A was deliberate:

| Dimension | TNC (Direction A) | GE v2 (Anspråkslös Modern) |
|---|---|---|
| Type system | Source Serif 4 (serif-led) | Inter Tight (sans-led) + Fraunces italic accent |
| Paper color | Cream #fafaf6 | Warm linen beige #ede4dd (from OUTFIT site) |
| Accent | Gold #c9a961 | Deep cigar-band red #b8392b |
| Voice | Editorial, literary, declarative | Friendly, unpretentious, direct |
| Hero | Big serif headline + ken-burns | Real cigar-band photo + sans headline |
| Sections | Pillars, archive, journal | Departments, products, shop facts |
| Long-form prose | Yes — magazine pillars | No — shop sections kept short |
| Photography | Stock + Higgsfield | Real product photos from their site |

**How the divergence happened in practice:**

1. Cris said "completely different from what we've been building."
2. I scraped gotteftermaten.se via Chrome MCP — got the cigar-band photo + ten product photos with names + prices.
3. I navigated to awwwards.com/sites/outfit (Site of the Day, May 11) and pulled its palette (black + red + warm beige).
4. I wrote a whole new mockup file (`-v2.html`) rather than edit the first one — so you can compare them side by side.

That's the loop: **research → reference → write new file**. Three tools (Chrome MCP, this chat for synthesis, `Write` for output). No Figma, no Adobe.

---

## Re: web.meetcleo.com / "is there a chat-to-build app we should use"

There is no separate chat-to-build app that beats this stack for our work. Cleo is a personal-finance chatbot. The "chat with AI to make a thing" pattern is exactly what Cowork is — applied to design + code instead of money.

The pieces you might be wishing for that *aren't* here yet:

- **Figma MCP** — useful if a client demands Figma as the handoff format. Not connected; can be added.
- **v0.dev** by Vercel — generates Next.js components from prompts. Worth a look as a secondary source for component scaffolds, but the output needs Direction-A pruning before it ships.
- **Lovable.dev / Bolt.new / Replit Agent** — full-app generators. Overkill for adding one component to an existing site.

If any of these starts to look essential, ping me — Cowork can request to install connectors mid-task.
