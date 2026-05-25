/**
 * editorial-reveal.ts — Direction A's scroll-into-view reveal helper.
 *
 * Vanilla JS, runs without React. Mounts a single IntersectionObserver on
 * every element with `data-reveal`, adds `.is-visible` when the element
 * crosses 15% into the viewport, and unobserves it (one-shot).
 *
 * The actual animation is CSS — defined in global.css and in each component
 * style block. This script just adds the trigger class.
 *
 * Loaded once at the bottom of BaseLayout (or any page that opts in via
 * <script>) and idempotent — safe to import multiple times.
 */

let registered = false;

export function initEditorialReveal() {
  if (typeof window === "undefined") return;
  if (registered) return;
  registered = true;

  const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (els.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    // Browsers without IntersectionObserver: just reveal everything.
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -80px 0px",
    },
  );

  els.forEach((el) => io.observe(el));
}

// Auto-init on page load AND on Astro view-transition navigation.
if (typeof window !== "undefined") {
  document.addEventListener("astro:page-load", () => {
    // Reset registration flag — each navigation is a fresh DOM
    registered = false;
    initEditorialReveal();
  });
  // Fallback for initial load before astro:page-load fires
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEditorialReveal);
  } else {
    initEditorialReveal();
  }
}
