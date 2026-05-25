# UI/UX Pro Max stack — adapted for TNC

This is the 4-step pitch from @thechriscordero's Instagram reel (DX7O_Q-AbbH), adapted for The Next Cigar's Astro codebase.

The reel pitches a **$10,000-quality website in one line of code**. The pitch is real — the tools all exist, work today, and the combination is genuinely powerful. The catch is they're all built for React/Next.js. TNC is Astro. The good news: Astro has first-class React-island support, so we can plug 80% of the stack in without rewriting anything.

---

## What's in the stack

**The 4 steps from the reel:**

| Step | Tool | What it is |
|---|---|---|
| 1 | **Claude Code** | Terminal-based AI coding agent. One-line install: `npm install -g @anthropic-ai/claude-code`. Cris already has the Cowork variant; Claude Code is the CLI version. |
| 2 | **Framer Motion** | React animation library. The smoothest motion system on the web. `npm i framer-motion`. |
| 3 | **UI/UX Pro Max** | Claude Code "Skill" — a 19-MB design knowledge base with 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, 25 chart types, 16 tech stacks, 161 reasoning rules. Tells the AI to "think like a senior designer." Free, MIT-licensed. |
| 4 | **21st.dev** | Component registry — the "npm for design engineers." Marketplace of pre-built shadcn/ui React components. Paste a URL into Claude Code and it installs the component. Many free, some paid. |

The reel claims "build a full site" by combining them. Realistic version: **the stack accelerates a magazine-style redesign from weeks → days, IF the underlying framework supports React.**

---

## How to install on TNC

### Step 1 — Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

You'll need to log in with the same Anthropic account that powers Cowork. The CLI gives you a terminal-native editing experience that complements (doesn't replace) Cowork.

### Step 2 — Install UI/UX Pro Max as a Cowork Skill

In Cowork (this app), Skills can be installed via the Skill marketplace. The reel's skill is published at:

- GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Marketplace: https://claudemarketplaces.com/skills/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max

Install path inside Cowork: `Settings → Skills → Install from URL` and paste the GitHub repo URL.

Or via Claude Code CLI:
```bash
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

Once installed, asking the AI for any UI work triggers the skill automatically. It returns design recommendations grounded in 161 reasoning rules instead of generic LLM output.

### Step 3 — Enable React islands in Astro

TNC is Astro 4. To use Framer Motion + 21st.dev components, we add the React integration:

```bash
cd ~/Documents/thenextcigar
npx astro add react
npm install framer-motion
```

This:
- Adds `@astrojs/react` to `astro.config.mjs`
- Installs `react`, `react-dom`, types
- Doesn't change anything that already works
- Lets us drop `.jsx` / `.tsx` components into existing `.astro` pages with `<MyReactComponent client:load />`

### Step 4 — Add shadcn/ui + 21st.dev

shadcn isn't a package — it's a CLI that copies components into `src/components/ui/`. Setup:

```bash
npx shadcn@latest init
```

That writes `components.json` (config file) and sets up `src/lib/utils.ts` with the `cn()` helper. Then per-component installs:

```bash
# From shadcn's catalogue
npx shadcn@latest add button card dialog

# From 21st.dev (paste any 21st.dev URL)
npx shadcn@latest add "https://21st.dev/r/magicui/marquee"
npx shadcn@latest add "https://21st.dev/r/aceternity/hero-parallax"
```

Each command writes a new React component file into the project. Source code is yours; no runtime dependency on the registry.

---

## The Astro-specific adaptations

### Adaptation 1 — Vanilla-JS fallback for non-React pages

Framer Motion needs React. For Astro pages that we want to keep purely server-rendered (everything under `/finder/`, `/blog/`, `/`), use **Motion-One** instead — same author, vanilla-JS, ~5KB gzipped:

```bash
npm install motion
```

```html
<script>
  import { animate } from "motion";
  animate(".finder-hero__title", { opacity: [0, 1], y: [20, 0] }, { duration: 0.6 });
</script>
```

Result: smooth animations on every page, React only loaded on the Lounge app interior.

### Adaptation 2 — Where to put React islands

Recommended split:

| Surface | Framework | Reason |
|---|---|---|
| `/` (home), `/blog/`, `/finder/` SEO pages | Pure Astro | SEO + speed; no need for React |
| `/lounge/app/finder/` catalogue grid + search | React island | Heavy interactivity; benefits from shadcn `<Command>` |
| `/lounge/app/map/` | Pure Astro + Leaflet | Already works; don't rewrite |
| `/lounge/app/messages/` | React island | Real-time updates benefit from React state |
| `/lounge/app/profile/` | Pure Astro | Form-heavy, no need for React |

### Adaptation 3 — Tailwind compatibility

TNC has its own design tokens in `src/styles/global.css` (`--color-gold`, `--color-burgundy`, etc.). shadcn defaults overwrite these. Fix: after `shadcn init`, edit `src/styles/global.css` to keep TNC's tokens and only add shadcn's required ones (`--background`, `--foreground`, `--primary`, etc.). Map TNC colors to shadcn variable names where they overlap.

---

## Recommended workflow once installed

1. Open Cowork (this app) with UI/UX Pro Max skill loaded
2. Open Claude Code in terminal at `~/Documents/thenextcigar`
3. In Cowork, ask for the design: *"Redesign /finder/ landing as an editorial magazine hero. Use the cigar industry's premium aesthetic — dark amber + cream + black."*
4. UI/UX Pro Max returns a design spec with: typography pairing, color palette, layout pattern, motion direction
5. Browse https://21st.dev and pick 2-3 components that match (hero, marquee, animated cards)
6. In Claude Code: `npx shadcn@latest add "https://21st.dev/r/..."`
7. Wire the components into `/finder/index.astro` as React islands
8. Animate with Framer Motion (in React islands) or Motion-One (in pure Astro pages)

Result: a magazine-quality redesign delivered in days, with TNC's content + the polish of a top-tier agency.

---

## What it costs

- Claude Code CLI: free (uses your existing Anthropic account)
- UI/UX Pro Max: free (MIT-licensed)
- Framer Motion: free
- 21st.dev components: free for community components, $5-50 for premium "pro" components (one-time, no subscription)
- shadcn/ui: free

Total: **$0-50 to get the entire stack running.** The $10K number in the reel refers to what a freelance designer would charge to deliver the equivalent output by hand.

---

## What to do right now

Three options, pick one:

1. **Install the stack now — I'll run the commands.** Sandbox can't write `.git` but can install npm packages. We get React + Framer Motion + shadcn + Motion-One in place by end of session.
2. **Install the stack on your machine first, then we redesign together.** Cris runs the 4 install commands on his Mac. Then we redesign `/finder/` landing as the first canvas, magazine-style.
3. **Defer until after the Lounge bug audit completes.** The audit is the dependency under everything else; finishing it first means the redesign lands on a stable base.

---

## References

- UI/UX Pro Max skill: https://ui-ux-pro-max-skill.com/
- UI/UX Pro Max GitHub: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- 21st.dev marketplace: https://21st.dev/
- Framer Motion: https://www.framer.com/motion/
- Motion-One (Astro-friendly fork): https://motion.dev/
- shadcn/ui: https://ui.shadcn.com/
- Astro React integration: https://docs.astro.build/en/guides/integrations-guide/react/
