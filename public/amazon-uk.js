/*
 * amazon-uk.js — send UK and Irish readers to Amazon.co.uk.
 *
 * Amazon retired OneLink, so a reader in the UK who clicks an amazon.com
 * link lands on the US store and the click earns nothing. For readers whose
 * browser time zone is in the UK or Ireland, this rewrites every amazon.com
 * product link to an Amazon.co.uk search for the product's name, tagged with
 * the UK Associates store ID. A search is used instead of /dp/ASIN because
 * many ASINs differ between stores and a wrong one ends on "page not found".
 *
 * Everyone else keeps the original amazon.com link. No cookies, no storage,
 * no network calls. ?amazon=uk / ?amazon=us in the page URL forces either
 * version for testing.
 */
(function () {
  var UK_TAG = "thenextciga09-21";
  var UK_ZONES = ["Europe/London", "Europe/Dublin", "Europe/Belfast", "Europe/Guernsey", "Europe/Jersey", "Europe/Isle_of_Man"];

  function wantsUK() {
    try {
      var force = new URLSearchParams(location.search).get("amazon");
      if (force === "uk") return true;
      if (force === "us") return false;
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      return UK_ZONES.indexOf(tz) !== -1;
    } catch (e) { return false; }
  }

  var ASIN_RE = /amazon\.com\/(?:[^/?#]+\/)?(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
  var GENERIC = /^(it|this|that|here|link|amazon|price|the price|today'?s price)$/i;

  function clean(text) {
    var t = (text || "").replace(/[→›»↗]/g, " ").replace(/\s+/g, " ").trim();
    t = t.replace(/^(buy|see|check|shop|view|get)\s+(it|the|this|a|an)?\s*/i, "");
    t = t.replace(/(^|\s+)(on|at|from)\s+amazon(\.com)?\s*$/i, "");
    t = t.split(/\s+[—–-]\s+/)[0];
    t = t.replace(/\s*\(.*?\)\s*$/, "").trim();
    if (t.length < 3 || GENERIC.test(t)) return "";
    return t.slice(0, 80);
  }

  function nameFromLink(a) {
    var n = clean(a.textContent);
    if (!n) n = clean(a.getAttribute("aria-label"));
    if (!n) { var img = a.querySelector("img[alt]"); if (img) n = clean(img.getAttribute("alt")); }
    return n;
  }

  function nearestHeading(a) {
    var el = a;
    for (var i = 0; i < 40 && el; i++) {
      var prev = el.previousElementSibling;
      while (prev) {
        if (/^H[2-4]$/.test(prev.tagName)) {
          var h = prev.textContent.replace(/^\s*\d+\.\s*/, "");
          if (h.indexOf(":") !== -1) h = h.split(":").slice(1).join(":");
          return clean(h);
        }
        var inner = prev.querySelector && prev.querySelector("h2,h3,h4");
        if (inner) return clean(inner.textContent.replace(/^\s*\d+\.\s*/, "").split(":").pop());
        prev = prev.previousElementSibling;
      }
      el = el.parentElement;
    }
    return "";
  }

  function run() {
    if (!wantsUK()) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href*="amazon.com/"]'));
    var names = {};
    links.forEach(function (a) {
      var m = a.href.match(ASIN_RE); if (!m) return;
      var n = nameFromLink(a); if (n && !names[m[1]]) names[m[1]] = n;
    });
    links.forEach(function (a) {
      var m = a.href.match(ASIN_RE); if (!m) return;
      var asin = m[1];
      var q = nameFromLink(a) || names[asin] || nearestHeading(a) || asin;
      a.href = "https://www.amazon.co.uk/s?k=" + encodeURIComponent(q) + "&tag=" + UK_TAG;
      a.setAttribute("data-amazon-store", "uk");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
