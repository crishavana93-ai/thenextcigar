// POST /api/out  { host, page }
//
// Outbound-click counter. The page fires this with navigator.sendBeacon when
// a reader clicks a link to a retailer, and this bumps one integer in
// retailer_clicks for (today, that host, that page). Nothing about the reader
// is recorded: no IP, no cookie, no user agent, no id.
//
// Why a counter at all: to be able to tell Noblego "we sent you 214 readers
// in August" before asking them to pay for a featured slot. Traffic you
// cannot count is traffic you cannot sell.
//
// Abuse posture: the host must be one we actually list, page must be one of
// our own paths, and the body is tiny. Anyone can still curl it in a loop; on
// a site this size the worst outcome is a wrong number we would notice.

interface Env {
  PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Kept in sync by hand with RETAILERS in src/data/finder-data.ts. A retailer
// not in this list is silently not counted — better to undercount than to
// accept arbitrary strings into the table.
const ALLOWED_APEX = [
  "cigarmust.com", "noblego.de", "cigarworld.de", "sigarietabacchi.it",
  "lacasadelhabano.brussels", "cigarsmokerclub.com", "cgarsltd.co.uk",
  "cigarrspecialisten.se", "cigarrummet.com", "hajenius.com", "jamesfox.ie",
  "siglomundo.ch", "jjfox.co.uk", "sauttercigars.com", "havanahouse.co.uk",
  "egmcigars.com", "cigarrhyllan.se", "lcdhantwerp.com", "cigarsmoke.gr",
  "cigarmaxx.de",
  // On the retailer map but not yet priced by the Finder. Still retailers we
  // send readers to, so still worth counting.
  "cigarone.com", "puros.se", "houseofcigars.it", "bottegadelfumatore.com",
  "cigarsgalaxy.gr", "danishpipeshop.com", "turmeaus.co.uk",
];
function allowed(host: string): boolean {
  return ALLOWED_APEX.some((apex) => host === apex || host.endsWith("." + apex));
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { host?: unknown; page?: unknown } = {};
  try { body = await request.json(); } catch { return new Response(null, { status: 204 }); }

  const host = typeof body.host === "string" ? body.host.toLowerCase().slice(0, 100) : "";
  const page = typeof body.page === "string" ? body.page.slice(0, 200) : "";
  if (!allowed(host) || !page.startsWith("/")) {
    return new Response(null, { status: 204 }); // not ours to count; say nothing
  }

  try {
    await fetch(`${env.PUBLIC_SUPABASE_URL}/rest/v1/rpc/bump_retailer_click`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ p_host: host, p_page: page }),
    });
  } catch (e) {
    console.error("[out] bump failed", e);
  }
  return new Response(null, { status: 204 });
};
