/**
 * Cloudflare Pages Function — GitHub OAuth initiation for Decap CMS.
 *
 * Decap CMS calls /api/auth?provider=github&site_id=<host>&scope=repo
 * We redirect the user to GitHub's authorize endpoint.
 *
 * Required environment variables (set in Cloudflare Pages → Settings → Environment variables):
 *   GITHUB_CLIENT_ID       — public, from your GitHub OAuth App
 *   GITHUB_CLIENT_SECRET   — secret, from your GitHub OAuth App
 *   OAUTH_SCOPE            — optional, defaults to "repo,user"
 */

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider") || "github";
  if (provider !== "github") {
    return new Response("Unsupported provider", { status: 400 });
  }

  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response(
      "Missing GITHUB_CLIENT_ID env var. Add it in Cloudflare Pages → Settings → Environment variables.",
      { status: 500 }
    );
  }

  const scope = env.OAUTH_SCOPE || "repo,user";
  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/api/callback`;

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", scope);
  githubAuthUrl.searchParams.set("state", state);

  // Stash state in a short-lived cookie so /api/callback can verify it
  return new Response(null, {
    status: 302,
    headers: {
      Location: githubAuthUrl.toString(),
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
};
