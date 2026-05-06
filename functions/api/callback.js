/**
 * Cloudflare Pages Function — GitHub OAuth callback for Decap CMS.
 *
 * GitHub redirects here after the user approves the OAuth app:
 *   /api/callback?code=<auth_code>&state=<state>
 *
 * We exchange the code for an access token, then post a message back
 * to the Decap CMS window (which is the opener of this popup).
 */

const renderResponseScript = (status, content) => `
<!doctype html>
<html><body>
<script>
(function() {
  var data = ${JSON.stringify({ status, content })};
  var origin = window.location.origin;
  function send() {
    if (!window.opener) {
      document.body.innerText = 'Login complete — but the editor window is gone. Close this tab and try again.';
      return;
    }
    window.opener.postMessage('authorization:github:' + data.status + ':' + JSON.stringify(data.content), origin);
  }
  window.addEventListener('message', function(e) {
    if (e.data === 'authorizing:github') send();
  }, false);
  send();
})();
</script>
<p>Authentication ${status}. You can close this window.</p>
</body></html>`;

export const onRequestGet = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // Verify state matches the cookie we set in /api/auth
  const cookieHeader = request.headers.get("Cookie") || "";
  const stateCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("oauth_state="))
    ?.split("=")[1];

  if (!stateCookie || stateCookie !== state) {
    return new Response(
      renderResponseScript("error", { error: "state_mismatch" }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response(
      renderResponseScript("error", { error: "missing_env_vars" }),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Exchange the code for an access token
  let tokenResponse;
  try {
    tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
  } catch (err) {
    return new Response(
      renderResponseScript("error", { error: "token_request_failed" }),
      { status: 502, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const tokenData = await tokenResponse.json();
  if (tokenData.error || !tokenData.access_token) {
    return new Response(
      renderResponseScript("error", { error: tokenData.error || "no_access_token" }),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new Response(
    renderResponseScript("success", {
      token: tokenData.access_token,
      provider: "github",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Clear the state cookie now that auth is complete
        "Set-Cookie": "oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      },
    }
  );
};
