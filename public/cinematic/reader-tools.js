/**
 * TNC Reader Tools — client-side manager for four differentiator features:
 *   1. Shelf   · save articles to a personal collection, share as URL
 *   2. Print   · trigger print-magazine mode on any article
 *   3. Ambient · cigar-lounge audio toggle, persisted
 *   4. Bands   · collect a cigar-band sticker each time you read a new article
 *
 * All state lives in localStorage. Exposes window.tnc for other scripts.
 * Runs on every page (small footprint), only wires UI when the elements exist.
 */

(() => {
  const KEY_SHELF     = "tnc_shelf";      // Array<{slug, title, savedAt}>
  const KEY_AMBIENT   = "tnc_ambient";    // "on" | "off"
  const KEY_BANDS     = "tnc_bands";      // Array<{slug, band, brand, collectedAt}>

  // ── Storage helpers (safe against private mode) ──
  const get = (k, fallback) => {
    try { return JSON.parse(localStorage.getItem(k) || "null") ?? fallback; }
    catch { return fallback; }
  };
  const set = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
  };

  // ── SHELF ──────────────────────────────────────────────────
  const shelf = {
    all: () => get(KEY_SHELF, []),
    has: (slug) => shelf.all().some((s) => s.slug === slug),
    add: (item) => {
      const list = shelf.all();
      if (list.find((s) => s.slug === item.slug)) return list;
      const next = [{ ...item, savedAt: Date.now() }, ...list].slice(0, 200);
      set(KEY_SHELF, next);
      return next;
    },
    remove: (slug) => {
      const next = shelf.all().filter((s) => s.slug !== slug);
      set(KEY_SHELF, next);
      return next;
    },
    shareUrl: () => {
      const ids = shelf.all().map((s) => s.slug).join(",");
      return `${window.location.origin}/shelves/?ids=${encodeURIComponent(ids)}`;
    },
  };

  // Wire save button on article page
  document.querySelectorAll("[data-shelf-save]").forEach((btn) => {
    const slug = btn.getAttribute("data-slug") || "";
    const title = btn.getAttribute("data-title") || "";
    const render = () => {
      const saved = shelf.has(slug);
      btn.classList.toggle("is-saved", saved);
      btn.querySelector("[data-label]").textContent = saved ? "Saved to shelf ✓" : "Save to shelf";
    };
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (shelf.has(slug)) shelf.remove(slug);
      else shelf.add({ slug, title });
      render();
    });
    render();
  });

  // Update shelf count in any [data-shelf-count] element (nav + footer + etc.)
  const updateShelfCount = () => {
    const n = shelf.all().length;
    document.querySelectorAll("[data-shelf-count]").forEach((el) => {
      el.textContent = String(n);
      el.setAttribute("data-count", String(n));
      if (n === 0) el.classList.add("is-empty");
      else el.classList.remove("is-empty");
    });
  };
  updateShelfCount();
  window.addEventListener("storage", updateShelfCount);

  // ── PRINT ──────────────────────────────────────────────────
  document.querySelectorAll("[data-print-trigger]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      document.body.classList.add("printing-magazine");
      // Give the browser one paint to apply print class, then trigger dialog
      setTimeout(() => {
        window.print();
        // Clean up class after dialog closes
        setTimeout(() => document.body.classList.remove("printing-magazine"), 600);
      }, 60);
    });
  });

  // ── AMBIENT ────────────────────────────────────────────────
  // Floating toggle in bottom-right. Persists on/off across pages.
  // Audio file at /cinematic/ambience.mp3 (add whenever ready — falls back to silence).
  const ambient = {
    state: () => get(KEY_AMBIENT, "off"),
    audio: null,
    ensure() {
      if (this.audio) return this.audio;
      const a = document.createElement("audio");
      a.src = "/cinematic/ambience.mp3";
      a.loop = true;
      a.volume = 0.28;
      a.preload = "none";
      document.body.appendChild(a);
      this.audio = a;
      return a;
    },
    play() {
      const a = this.ensure();
      a.play().catch(() => {}); // Autoplay policy — ignore silently
      set(KEY_AMBIENT, "on");
    },
    stop() {
      if (this.audio) this.audio.pause();
      set(KEY_AMBIENT, "off");
    },
  };

  document.querySelectorAll("[data-ambient-toggle]").forEach((btn) => {
    const render = () => {
      const on = ambient.state() === "on";
      btn.classList.toggle("is-on", on);
      const label = btn.querySelector("[data-ambient-label]");
      if (label) label.textContent = on ? "Ambient · on" : "Ambient · off";
    };
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (ambient.state() === "on") ambient.stop();
      else ambient.play();
      render();
    });
    render();
    // Auto-resume if user had it on from a previous page (needs a gesture, next click)
    if (ambient.state() === "on") {
      const kick = () => {
        ambient.play();
        document.removeEventListener("pointerdown", kick);
      };
      document.addEventListener("pointerdown", kick, { once: true });
    }
  });

  // ── BANDS ──────────────────────────────────────────────────
  const bands = {
    all: () => get(KEY_BANDS, []),
    has: (slug) => bands.all().some((b) => b.slug === slug),
    collect: (item) => {
      if (bands.has(item.slug)) return bands.all();
      const next = [{ ...item, collectedAt: Date.now() }, ...bands.all()];
      set(KEY_BANDS, next);
      return next;
    },
  };

  // Auto-collect band on articles that declare one (data-band on <article> or body)
  const bandNode = document.querySelector("[data-collect-band]");
  if (bandNode) {
    const slug = bandNode.getAttribute("data-band-slug") || location.pathname;
    const brand = bandNode.getAttribute("data-band-brand") || "Editorial";
    const band = bandNode.getAttribute("data-band-name") || "Reader";
    // Delay 6s so user actually reads the article before earning the sticker
    setTimeout(() => bands.collect({ slug, brand, band }), 6000);
  }

  const updateBandCount = () => {
    const n = bands.all().length;
    document.querySelectorAll("[data-band-count]").forEach((el) => {
      el.textContent = String(n);
    });
  };
  updateBandCount();

  // ── Expose for other scripts (SPA future, etc.) ──
  window.tnc = { shelf, ambient, bands };
})();
