# Where to build components & craft prompts with our stack

> Quick context-setter for "I want to design components / generate visuals / write better prompts — where do I actually do that?"

---

## First — about meetcleo.com

You linked **https://web.meetcleo.com/**. That's **Cleo AI**, a personal-finance chatbot (~8M users, $5.99–14.99/mo, cash advances, "roast mode" budgeting). It's not a component or prompt builder — it's a money app for younger users who find traditional finance apps boring.

If you were thinking of Cleo as a *reference* for the conversational-component-building UX ("chat with AI → it builds the thing"), that pattern is exactly what we already have running across the tools below. We don't need to leave to get it.

---

## The actual stack — what's connected and what each is for

| Tool | Where it lives | What it's for |
|---|---|---|
| **Cowork (this chat)** | Claude desktop app | High-level reasoning, file creation, research, calling all the other tools |
| **Claude Code CLI** | Your terminal | Autonomous multi-step edits in `thenextcigar/` repo, with worktree isolation |
| **UI/UX Pro Max skill** | Inside Claude Code | Senior design-systems guidance for component decisions (Direction A enforcement, motion patterns, tokens) |
| **21st.dev community** | https://21st.dev | Component marketplace — copy/paste install commands for shadcn-style components |
| **shadcn/ui CLI** | `npx shadcn add ...` | Installs React components into `src/components/ui/` |
| **Aceternity registry** | `ui.aceternity.com/registry/...` | Motion-heavy components (we already used apple-cards-carousel as a fallback) |
| **Magic UI** | inside 21st.dev | Number ticker, animated text — we shipped their NumberTicker |
| **Higgsfield MCP** | Cowork tool palette | AI image generation (broken right now — "User not found" auth issue) |
| **mcp__visualize__show_widget** | Cowork tool palette | Inline visual mockups, diagrams, charts — renders next to the chat reply |
| **mcp__cowork__create_artifact** | Cowork tool palette | Persistent HTML pages that pull fresh data from connectors |
| **pdf / docx / pptx skills** | Cowork tool palette | Format-specific deliverables once research is done |

---

## "I want to build a component" — the path

1. **Sketch it here in Cowork.** Describe what you want. I can show a mockup with `show_widget`, or draft the actual file via `Write`/`Edit`.
2. **Find prior art.** I search 21st.dev / Aceternity / Magic UI for the closest existing component.
3. **Install it.** Either I run `npx shadcn add <component-url>`, or I write a clean custom version (like we did with `EditorialStoriesRail` to avoid Aceternity's `next/image` dependency).
4. **Adapt it to Direction A.** Replace springs with editorial tweens, swap rounded-3xl for rounded-sm, gold accent instead of indigo, Source Serif headlines, etc.
5. **Wire it into a page.** Modify `src/pages/*.astro` to import and use.
6. **Push.** Either I open a Cloudflare Pages preview branch, or Claude Code commits to main.

## "I want to craft a better prompt" — the path

1. **Write what you want in plain English in this chat.** I rewrite it for whichever tool you're about to use:
   - Higgsfield for product photography
   - Gemini Omni for promo video
   - Midjourney for moodboards
   - Sora / Runway for motion
   - Claude (here) for copy, briefs, structure
2. **Or hand me the messy prompt + the tool name.** I'll tighten it.
3. **Save the good ones.** I add them to `marketing/prompts/` so we can reuse and iterate.

## "I want a visual prototype like the Gott Eftermaten mockup" — the path

Built today: `marketing/gotteftermaten-mockup.html` — standalone HTML, opens in any browser. No build step, no dependencies. We do this whenever you want to *show* a redesign before *committing* to it. Cheaper than Figma for our workflow because:

- I write the HTML/CSS directly (no design-tool translation step)
- The mockup IS the spec — front-end work picks up exactly where the mockup leaves off
- You can send the HTML file or a screenshot to a client without a Figma account

---

## What's missing from the stack

- **Higgsfield auth** — still broken, "User not found." Workarounds: use Higgsfield's web UI directly (the saved prompts work), or fall back to Gemini Imagen / Midjourney for now.
- **Figma MCP** — not connected. Useful if a client insists on Figma as the delivery format.
- **Cleo-style chat-to-build** — that's what *Cowork is.* This thread, where you describe what you want and I produce files, IS the Cleo pattern, applied to design and code instead of personal finance.

---

## Today's deliverables

| File | What it is |
|---|---|
| `marketing/gotteftermaten-reference-deck.md` | The longer stack/reference deck (yesterday) |
| `marketing/gotteftermaten-mockup.html` | Visual prototype — Shopify Prestige × Direction A aesthetic, Swedish content, BankID delivery flow, full homepage with hero, three rooms, featured release, bestsellers, editorial story, journal teasers, newsletter, footer |
| `marketing/gotteftermaten-1page.html` | A4 print-formatted source for the punch summary |
| `marketing/gotteftermaten-1page.pdf` | The 1-page PDF the owner actually gets attached to the pitch email |
| `marketing/component-prompt-stack.md` | This file |

---

*Sources for the Cleo fact-check:*
- [The Penny Hoarder — Cleo App Review 2026](https://www.thepennyhoarder.com/budgeting/cleo-app-review/)
- [Cleo on the App Store](https://apps.apple.com/us/app/cleo-ai-cash-advance-budget/id1447274646)
- [G2 — Cleo Reviews 2026](https://www.g2.com/products/cleo-ai-cleo/reviews)
