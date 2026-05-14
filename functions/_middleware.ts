// Cloudflare Pages Functions edge middleware.
//
// Purpose: short-URL rewrites for the dedicated Lounge subdomain.
// `lounge.thenextcigar.com/login` → serves `/lounge/login/` without changing the URL bar.
//
// Why a middleware and not `_redirects`?
// Cloudflare Pages does not reliably honor cross-subdomain 200 rewrites in
// `_redirects` for static projects. A Functions middleware is evaluated for
// every request on every custom domain and is the supported path for this.
//
// Anything on the apex (thenextcigar.com) passes straight through.

const SUBDOMAIN = "lounge.thenextcigar.com";

// Exact-path → canonical-path mapping for the subdomain.
// Both with-trailing-slash and without-trailing-slash variants are listed so
// either form works for a member who types the URL manually.
const ROUTES: Record<string, string> = {
  "/": "/lounge/app/",
  "/login": "/lounge/login/",
  "/login/": "/lounge/login/",
  "/signup": "/lounge/signup/",
  "/signup/": "/lounge/signup/",
  "/map": "/lounge/app/map/",
  "/map/": "/lounge/app/map/",
  "/members": "/lounge/app/directory/",
  "/members/": "/lounge/app/directory/",
  "/directory": "/lounge/app/directory/",
  "/directory/": "/lounge/app/directory/",
  "/travel": "/lounge/app/travel/",
  "/travel/": "/lounge/app/travel/",
  "/inbox": "/lounge/app/inbox/",
  "/inbox/": "/lounge/app/inbox/",
  "/profile": "/lounge/app/profile/",
  "/profile/": "/lounge/app/profile/",
  "/messages": "/lounge/app/messages/",
  "/messages/": "/lounge/app/messages/",
  "/welcome": "/lounge/app/welcome/",
  "/welcome/": "/lounge/app/welcome/",
  "/admin": "/lounge/app/admin/",
  "/admin/": "/lounge/app/admin/",
  "/member": "/lounge/app/member/",
  "/member/": "/lounge/app/member/",
};

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // Only act on the Lounge subdomain. The apex serves the magazine and must
  // be untouched.
  if (url.hostname !== SUBDOMAIN) {
    return context.next();
  }

  const mapped = ROUTES[url.pathname];
  if (mapped) {
    // Internal rewrite. Browser URL bar continues to display the short URL;
    // we serve the long-path asset.
    const rewritten = new URL(url.toString());
    rewritten.pathname = mapped;
    return context.env.ASSETS.fetch(new Request(rewritten.toString(), context.request));
  }

  // Anything we don't have a short URL for (assets, /lounge/app/* deep links,
  // magic-link callbacks with ?code=...) falls through to static asset serving.
  return context.next();
};
