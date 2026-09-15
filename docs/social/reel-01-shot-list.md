# Reel 01 — "One box. Four countries." · shot list

**Format:** 1080×1920, 24 fps, 22–26 seconds, silent-first (works muted), one warm grade over everything. Built the way the ORO reel is built: six short generated shots, each one simple motion, cut in an editor; the paper's frame and the numbers are added in the edit, never generated.

**Rules for every generated shot:** no faces; no bands, labels, seals, logos or lettering on anything; plain cedar, plain paper, plain glass; locked-off camera; one motion per shot; 3–4 seconds; black-and-white halftone is optional per shot but the grade is applied afterwards to all of them the same way.

| # | Length | Shot (prompt to the model) | Text over it (added in edit, paper type) |
|---|---|---|---|
| 1 | 3 s | Extreme close-up, a plain cedar box lid, closed, on dark wood; a thin ribbon of grey smoke drifts across the top of frame from an unseen ashtray at left. Nothing else moves. | *(none — the still opening, so the feed thinks it's a photo)* |
| 2 | 4 s | Same box, three-quarter view; two hands enter from the right and lift the lid slowly to forty-five degrees, two rows of identical unbanded cigars inside. | **One box.** |
| 3 | 3 s | A narrow European street in late afternoon, cobbles, no people, a red door far down the street; one leaf blows across the foreground. | **Bought in Switzerland.** |
| 4 | 4 s | A plain brown parcel on a doorstep, top-down, a hand sets it down and withdraws; morning light. | **Delivered to Germany · €168** (counter runs up from €0) |
| 5 | 4 s | The same parcel, same framing, on a different doorstep — grey stone, wet, Nordic light. | **Delivered to Sweden · €179** → **Finland · €227** (cut on the number) |
| 6 | 4 s | The same parcel on a London doorstep: black railings, white step, rain on the stone. | **Delivered to the UK · €330** |
| 7 | 3 s | Static: the "One box. Four countries." cover slide, full frame, no motion except a slow 3 % push-in. | **thenextcigar.com/finder** |

**Edit notes.** Freeze the first 20 frames of shot 1. The numbers are the only thing that should feel designed: same typeface as the paper, oxblood, count-up over 0.6 s, hold. No music on the first cut; one room-tone bed and a paper rustle at the cut from 1 to 2. Cover frame for the grid: shot 1, frame 1. Caption: the one already in `docs/social/captions-2026-09-13.md` for deck 02 — no prices in the caption, they live in the image.

**Why this order.** It is the carousel's argument told in pictures: one object, one price at the shop, four prices at four doors. The parcel-on-a-doorstep repeat is the trick the ORO reel uses with the Fiat and the lemon: one recurring object makes six generated clips read as one film.

**Where the numbers come from.** Live Finder, José L. Piedra Brevas box of 25 from EGM Cigars, landed by `landedCost()` on 13 September: DE €168, SE €179, FI €227, UK €330. Re-run the data the day you post; if the cheapest source has changed, the numbers change and so does the caption.

**Tools.** Stills: any image model you already pay for. Motion: Gemini Omni or Kling from each still, 4-second clips, "locked camera, one motion". Edit: CapCut or DaVinci Resolve (free); the grade is one LUT applied to every clip. Total cost: six to eight generations.
