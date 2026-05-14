// The Lounge — service worker
// Minimum-viable SW required by Chrome / Samsung Internet to treat the site as
// an installable PWA (instead of a browser bookmark). Implements a simple
// network-first strategy with cache fallback for navigation requests, so the
// app keeps loading even on flaky mobile networks.
//
// Scope is limited to /lounge/app/ (set via manifest scope + registration).

// Bump this version any time the deployed app changes meaningfully (new
// migrations, layout changes, big UI updates). Old caches are deleted on
// activate, forcing a fresh fetch on next visit.
const CACHE_NAME = "lounge-app-v5";
const PRECACHE_URLS = [
  "/lounge/app/",
  "/lounge-app-icon-192.png",
  "/lounge-app-icon-512.png",
  "/manifest-lounge.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore individual precache failures — service worker should still
        // install even if one asset is temporarily unreachable.
      }),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests; let everything else pass straight through.
  if (request.method !== "GET") return;

  // Skip Supabase API + Realtime connections — must always go to network.
  const url = new URL(request.url);
  if (url.hostname.includes("supabase.co")) return;

  // Network-first for HTML navigations (so members always see latest UI).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Stash a copy in the cache for offline fallback
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/lounge/app/"))),
    );
    return;
  }

  // Cache-first for static assets (icons, fonts, images)
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type !== "opaque") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    }),
  );
});
