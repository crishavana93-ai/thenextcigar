/* The Next Cigar shop cart. One key in localStorage: [{slug, qty}]. Prices,
   names and photos come from window.TNC_CATALOGUE (inlined by CartBar.astro),
   never from storage, and the server re-prices everything at checkout. */
(function () {
  var KEY = "tnc-cart", MAX = 6;
  function read() { try { var c = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(c) ? c.filter(function (x) { return x && x.slug && x.qty > 0; }) : []; } catch (e) { return []; } }
  function write(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} render(); }
  function cat() { return window.TNC_CATALOGUE || {}; }
  function tiers() { return window.TNC_TIERS || []; }
  function pct(n) { var t = tiers(); for (var i = 0; i < t.length; i++) if (n >= t[i].min) return t[i].pct; return 0; }
  function items() { var c = cat(); return read().filter(function (x) { return c[x.slug]; }).map(function (x) { var p = c[x.slug]; return { slug: x.slug, qty: x.qty, name: p.name, price: p.price, cover: p.cover }; }); }
  function totals() { var it = items(), pieces = 0, sub = 0; it.forEach(function (x) { pieces += x.qty; sub += x.qty * x.price; }); var p = pct(pieces), off = Math.round(sub * p) / 100; return { pieces: pieces, subtotal: sub, pct: p, discount: off, total: Math.round((sub - off) * 100) / 100 }; }
  function add(slug, qty) { var c = read(), i = c.filter(function (x) { return x.slug === slug; })[0]; qty = Math.max(1, Math.min(MAX, Number(qty) || 1)); if (i) i.qty = Math.min(MAX, i.qty + qty); else c.push({ slug: slug, qty: qty }); write(c); }
  function set(slug, qty) { var c = read().map(function (x) { return x.slug === slug ? { slug: slug, qty: Math.max(0, Math.min(MAX, Number(qty) || 0)) } : x; }).filter(function (x) { return x.qty > 0; }); write(c); }
  function remove(slug) { write(read().filter(function (x) { return x.slug !== slug; })); }
  function clear() { write([]); }
  function money(n) { return "$" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); }
  function render() {
    var t = totals(), bar = document.getElementById("cart-bar");
    if (!window.TNC_CATALOGUE) { t.pieces = read().reduce(function (n, x) { return n + x.qty; }, 0); }
    document.querySelectorAll("[data-cart-link]").forEach(function (el) { el.hidden = !t.pieces; });
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = t.pieces ? String(t.pieces) : ""; el.hidden = !t.pieces; });
    if (bar) {
      bar.hidden = !t.pieces || document.body.dataset.page === "cart";
      var s = bar.querySelector("[data-cart-summary]");
      if (s) s.textContent = t.pieces + (t.pieces === 1 ? " piece" : " pieces") + " · " + money(t.total) + (t.pct ? " (" + t.pct + "% off)" : "");
    }
    document.dispatchEvent(new CustomEvent("cart:change", { detail: t }));
  }
  window.TNCCart = { read: read, items: items, totals: totals, add: add, set: set, remove: remove, clear: clear, money: money, pct: pct, render: render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render); else render();
  window.addEventListener("storage", function (e) { if (e.key === KEY) render(); });
})();
