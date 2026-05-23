# Fastvertising promo video — Gemini Omni + Google Flow

Brief for a 45-second Ryan-Reynolds-style promo for The Next Cigar Finder. Production target: one week from script to posted. Distribution: Instagram Reels, TikTok, YouTube Shorts, X.

The Fastvertising rule: one cultural moment, one hook, one product proof, one CTA. No more. The goal isn't a polished commercial — it's a piece of content that looks like it was made yesterday because it was.

---

## What Gemini Omni is (and why we're using it)

Gemini Omni is Google's new multimodal generative video model, announced at I/O 2026. It generates and edits video from any combination of image + video + audio + text inputs. Two things make it the right tool for a fast promo:

It edits **conversationally**. You don't write one perfect 200-word prompt and pray. You generate a base shot, then refine — *"Change the bee into a swarm of fireflies"*, *"Now make it dusk"* — and the model preserves character, prop, and physics continuity across iterations. That's what makes it usable on a one-week timeline.

It does **digital avatars with your own voice**. You can record a voiceover, hand it to Omni with a reference image, and it generates a video of *you* saying it. We use this for the punchline scenes where filming Cris in five different locations would otherwise take a week of shoots.

**Subscription required:** Google AI Pro (Omni runs inside the Gemini app and Google Flow). Available worldwide.

## What Google Flow is (and why we're using it)

Flow is Google's AI video editor in Labs — the timeline where Omni clips and Veo clips assemble into a finished video. It's project-based, so a 45-second promo becomes one Flow project with 6 scenes you can re-order, trim, and re-render without re-prompting each one. Treat Omni as the generator and Flow as the cutting room.

Note: the specific Flow project URL you sent (`labs.google/fx/es-419/tools/flow/project/91148ea8-…`) is auth-gated, so the brief below works from Google's published Flow + Omni capabilities rather than what's already in that project. Open the project in your browser to import the scenes once we're generating.

## Prompting principles (from the Omni prompt guide)

The Omni prompt guide says: *"the more detail you add, the more control you'll have over the final output."* Build every shot prompt from five elements:

**Shot framing and motion** — locked off, push in, dolly zoom, oner, smartphone-style natural zoom, webcam.
**Style** — risograph grain, claymation, anime, photoreal, 90s home video.
**Lighting** — golden hour, neon underlight, surgical fluorescent, candlelight.
**Location** — Cuban kitchen, abstract void, supermarket aisle, mountain peak.
**Action** — what the subject does in this 7-second slice.

Reference inputs are first-class: drop `<image>` or `<video>` tags inside the prompt to lock the character/prop. Iterate by conversation, not by re-writing the whole prompt.

---

## The promo — 45 seconds, 6 scenes

### Hook (pick this week's beat)

Open by hijacking whatever's already in cigar Twitter / cigar press *this week*. Two evergreen fallbacks if nothing's hot:

1. *"This week, Habanos announced [latest price hike]. Meanwhile, 47 European retailers quietly changed their Cohiba prices in the other direction. You'd never know — unless you tracked all of them."*
2. *"Some guy on r/cigars just paid €240 for a box that was €188 in Berlin the same morning. He didn't know. Most people don't know."*

The hook is the ONLY thing that changes between drafts. Everything below stays.

### Scene 1 — Cold open (filmed) · 0–7s

You. iPhone. Kitchen counter. One cigar in hand. Deadpan.

> "You're being overcharged. Probably right now."

Hold the cigar up. Don't smile. Cut.

### Scene 2 — Visual gag (Omni-generated) · 7–14s

**Prompt:**

> Five European cigar boutique storefronts in a row, animated price tags hanging above each spinning like Las Vegas slot reels. Locked-off shot, eye level. Risograph grain over a flat-design colour palette — navy background, neon coral and mustard accents. Static camera, the only motion is the spinning tags. Cinematic, no people on screen.

VO over it:

> "Same cigar. Five shops. Five prices. Sometimes a hundred euros apart."

### Scene 3 — Product reveal (screen recording) · 14–24s

QuickTime screen-grab on your laptop. Open thenextcigar.com/finder/, type "cohiba robusto", let the live results render. Highlight the cheapest row. No motion graphics. Just the actual product working.

VO:

> "The Finder. Five retailers across Germany and Switzerland. Refreshed every six hours. Free."

### Scene 4 — Punchline (Omni avatar) · 24–32s

Use Omni's digital-avatar feature. Record a 6-second VO of yourself. Hand Omni a reference photo of you. Generate three absurd-location shots:

**Prompt 1:** *"Reference: <image of Cris>. Cris stands in a 1980s boardroom in a sharp grey suit, smoking the same cigar. Push-in shot, fluorescent overhead lighting, faint cigarette haze. Cinematic."*

**Prompt 2:** *"Reference: <image of Cris>. Same outfit. Cris stands at the periscope of a submarine, blue emergency lighting, fish-eye lens distortion. He glances at the camera."*

**Prompt 3:** *"Reference: <image of Cris>. Mount Olympus, golden hour, marble pillars in the background. Cris in a toga, holding the cigar like Zeus holds a thunderbolt. Locked off."*

Cut between all three in 2-second snaps. VO continuous across all three:

> "I don't sleep. I just check prices. So you don't have to."

### Scene 5 — Social proof (Omni text rendering) · 32–40s

**Prompt:**

> Word by word, one word on the screen at a time. Words: "free.", "forever.", "no signup.", "just prices." Each word appears with a different animated style — typewriter, stamp, neon glow, glitter. Perfect pacing to a slow Cuban son rhythm. Sizzle reel.

No VO. Let the music breathe.

### Scene 6 — CTA · 40–45s

Clean static frame. Cream background. One line of text in your brand font:

> **thenextcigar.com**
> compare. don't get burned.

Three seconds, then cut to black.

---

## Production checklist

**Day 1 (Monday):** Pick the week's hook. Write the hook line + Scene 4 VO. Record both on your phone.

**Day 2:** Film Scene 1 + Scene 3 in your kitchen / on your laptop. 30 minutes.

**Day 3:** Generate Scene 2 + Scene 4 in Gemini Omni inside the Gemini app. Plan on 3-5 iteration rounds per shot. Lock the character reference image once at the top of the session.

**Day 4:** Generate Scene 5 (text rendering) in Omni. Generate the Cuban son backing track in Suno or pull from Artlist.

**Day 5:** Assemble all 6 scenes in Google Flow. Add the VO. Add the music. Add the SynthID watermark (auto).

**Day 6:** Cut three aspect-ratio variants — 9:16 (Reels/TikTok/Shorts), 1:1 (feed posts), 16:9 (YouTube + X).

**Day 7:** Post. Lead on TikTok at 9pm CET, mirror to Reels and Shorts the same hour, X by morning. Reply to the first comment with the finder link.

---

## Why this works (Fastvertising rationale)

Maximum Effort's model isn't "make it cheap" — it's "make it now". Reynolds wins because his promos ship inside the news cycle that triggered them. The visual production is intentionally rough because rough reads as honest; polished reads as paid. Three things make ours work the same way:

The hook ties to a real-world thing that happened this week — gives it timeliness urgency the algorithm rewards.

Scene 3 is the product actually working. No mockup, no rendered UI, no After Effects polish. The screen recording IS the demo IS the proof.

The CTA is one word: thenextcigar.com. No "swipe up", no "use code", no "limited time". The Finder is free; we're not selling, we're inviting.

---

## What this WON'T do

Won't drive immediate signups — there's nothing to sign up for. It drives traffic to the public Finder, which converts a small percentage into newsletter / Lounge signups over the following week.

Won't go viral on the first post. The Fastvertising payoff is *cadence*: post one of these every 2-3 weeks tied to a fresh cultural beat, and the third or fourth one starts to land because the audience has now seen the pattern.

Won't replace SEO content. The blog posts on /finder/ are what Google ranks; this video is what makes someone *click* the link a friend shared on WhatsApp.
