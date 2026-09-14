# Gemini Omni prompts — the moving newspaper

**13 September 2026.** For Gemini Omni (Gemini app / Flow). One short film per carousel, built from the cover slide we already have. Vertical, 9:16, 8 seconds. The rule that governs every prompt: **the paper stands still, only the photograph moves.**

Omni is conversational — you refine turn by turn — so each film is written as an opening prompt plus the follow-up lines you will most likely need. Start every film by attaching the cover PNG (`docs/social/carousels/<deck>/01.png`) as the input image.

## What to check on every output, before it goes anywhere

Scrub frame by frame. Reject the clip if any of these happen, and use the correction line for it:

- Any letter of the masthead, headline, price or footer shifts, blurs, re-spells or "breathes". → *"Keep every printed character pixel-identical to the input image for the full duration. The page is a physical sheet of paper and does not move."*
- A cigar band, box label, logo or wordmark appears. → *"No bands, labels, logos, lettering or branding on any object. Plain cedar, plain paper, plain glass."*
- A face, hand with a ring, or anything that could be a real person. → *"Hands only, no faces, no jewellery."*
- Smoke reads as vape or steam. → *"Thin, slow cigar smoke: grey-blue, rising in one lazy ribbon, dissipating within the frame."*

These four are the ones that get a cigar account throttled or a fake-looking post. Nothing goes out with any of them.

---

## Film 02 — *One box. Four countries.* (post first)

Attach `02-one-box-four-countries/01.png`.

**Opening prompt**

> Turn this newspaper front page into a moving newspaper, in the manner of an enchanted printed page: the sheet itself is completely still, printed on warm off-white newsprint with faint paper grain, and every character of text stays perfectly frozen and razor sharp for the whole clip. In the empty space below the paragraph, a black-and-white photograph is printed on the page, with a thin black rule around it, and the photograph is alive. Inside it: a plain unlabelled cedar cigar box sits on a dark wooden table, three-quarter view, lid closed. Over eight seconds, a pair of hands enters from the right and slowly lifts the lid to about forty-five degrees, revealing two neat rows of identical cigars inside; a single ribbon of grey smoke from an unseen ashtray at the left drifts up through the frame. The photograph is monochrome, high contrast, grainy, like halftone newsprint, and the motion is slow and deliberate. Camera inside the photograph is locked off, no zoom, no pan. Nothing outside the photograph's rule moves. No bands, no labels, no logos, no lettering anywhere on the box or cigars. No faces. Vertical 9:16, eight seconds, silent.

**Likely second turn**

> Good. Now make the number "€330" the only other thing that moves: it stays in place and in the same typeface, but it flickers once like a stock ticker refreshing, then holds. Everything else unchanged.

(If the refresh damages the digits, drop it — we can do the ticker in post.)

**Likely third turn**

> Slow the lid to half speed and let the smoke start two seconds later so the first two seconds are completely still.

Why the still opening: the feed autoplays without sound, and a page that begins motionless then moves is the hook. It reads as a photograph until it doesn't.

---

## Film 01 — *The board this week.*

Attach `01-the-board-this-week/01.png`.

**Opening prompt**

> Turn this newspaper front page into a moving newspaper: the sheet is entirely still, warm off-white newsprint with subtle paper grain, and all text remains perfectly frozen and sharp throughout. Below the paragraph, print a black-and-white halftone photograph on the page with a thin black rule around it, and let the photograph move. Inside it: a shop counter seen from the customer's side, a wooden shelf behind it stacked with plain unlabelled cedar boxes of different sizes. Over eight seconds a shopkeeper's hands, seen only from the wrist down, take one box from the shelf and set it on the counter, then slide a small white paper price tag — blank, no writing — in front of it. A slow ribbon of smoke crosses the top of the frame. Monochrome, grainy, newsprint halftone, locked-off camera, slow motion. Nothing outside the photograph's rule moves. No labels, bands, logos or lettering on anything. No faces. Vertical 9:16, eight seconds, silent.

**Likely second turn**

> The tag must stay blank — remove anything printed on it. Make the shelf boxes plainer, just raw cedar.

---

## Film 03 — *Is this box real?*

Attach `03-is-this-box-real/01.png`.

**Opening prompt**

> Turn this newspaper front page into a moving newspaper: the sheet is completely still, off-white newsprint with faint grain, every character of text frozen and sharp for the whole clip. Below the paragraph, print a black-and-white halftone photograph with a thin black rule around it, and let the photograph move. Inside it: a plain cedar cigar box on a dark table, lid closed. Over eight seconds two hands lift the box, turn it over slowly to show the plain underside of the lid, and hold it there. The underside is bare cedar — no ink stamp, no code, no seal, no lettering of any kind; the point is the gesture of turning it over, not what is on it. A small magnifying glass rests on the table beside it. Monochrome, grainy, newsprint halftone, locked-off camera, slow motion. Nothing outside the photograph's rule moves. No labels, bands, logos or lettering anywhere. No faces. Vertical 9:16, eight seconds, silent.

**Likely second turn**

> If any stamp or marks appeared on the underside, remove them completely. Bare wood only.

Why bare: a made-up factory code on screen is exactly the invented detail the decoder exists to expose. The film shows the act of checking; the tool shows the answer.

---

## Post

Whichever tool wins, the finishing is ours, not the model's:

1. **Crop to 1080×1920** with the page centred and the off-white paper colour extended above and below so it sits full-bleed in Reels.
2. **Freeze the first 20 frames** (copy frame 1) so the clip opens as a still photograph — same reason as above.
3. **Sound:** one room-tone bed and a single paper-rustle at second 2 when motion starts. No music; music dates a post and it is not the paper's voice.
4. **Caption:** the deck's caption from `docs/social/captions-2026-09-13.md`, unchanged — no prices, no buy language, link in bio.
5. **Cover frame** for the grid: frame 1, so the profile stays a newspaper.

Metrics to watch, in order: completion rate, then saves/reach, then shares/reach. If Film 02 clears the carousels on completion, the moving newspaper becomes the format and the other two get made; if it doesn't, the money is better spent on product photography.

## If Omni can't hold the text

It may not — no model is reliable with type yet. Then generate **only the photograph** (same prompts, drop the newspaper sentences, ask for a 4:5 black-and-white halftone clip) and I composite it into the slide with ffmpeg. The result is the same on screen and the text is guaranteed, because it never went through the model.
