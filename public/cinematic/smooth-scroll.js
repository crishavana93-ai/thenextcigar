/**
 * Lenis smooth-scroll bootstrap — TNC cinematic layer.
 *
 * Loaded from public/ as a native ES module so it works in Astro without
 * touching the build config. Loaded via CDN so we don't need to add
 * anything to package.json.
 *
 * Config:
 *   lerp 0.1 — buttery but not floaty
 *   smoothWheel true — main lever, this is the "feel"
 *   touchMultiplier 2 — matches native touch feel on mobile
 *
 * Notes:
 * - We only initialize when the viewport supports hover (i.e. not a
 *   touch device where native inertial scroll is already ideal).
 * - We respect prefers-reduced-motion — smooth scroll off if requested.
 * - We expose window.lenis so any page-specific scroll-linked JS can
 *   subscribe to lenis.on('scroll', ...) for parallax/scrubbing.
 */

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(hover: none)").matches;

if (!reduced && !isTouch) {
  try {
    const { default: Lenis } = await import("https://esm.sh/lenis@1.1.20");
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      touchMultiplier: 2,
      wheelMultiplier: 1,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenis = lenis;
  } catch (err) {
    console.warn("[TNC] Lenis failed to load, falling back to native scroll", err);
  }
}
