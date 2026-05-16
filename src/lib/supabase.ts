/**
 * Supabase client — singleton, browser-side.
 *
 * The Next Cigar shop + Lounge use the *anon* (public) Supabase key, which is
 * safe to expose because:
 *   1. Row Level Security (RLS) policies enforce what each authenticated user
 *      can read/write.
 *   2. The anon key cannot bypass RLS.
 *   3. Auth-protected pages re-verify the user's session client-side before
 *      rendering private data.
 *
 * Pages that need Supabase should import `getSupabase()` and use it inside
 * client-side <script type="module"> blocks (Astro static pages) OR in
 * client-side hydrated components.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env vars. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in .env (and Cloudflare Pages env)."
    );
  }
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // detectSessionInUrl picks up tokens from the URL hash on the landing
        // page after a magic-link click — required for the implicit flow below.
        detectSessionInUrl: true,
        // IMPORTANT: implicit flow, NOT pkce.
        //
        // PKCE binds the magic-link click to the originating device's
        // localStorage (the code_verifier). In the real world, ~80% of magic
        // link clicks happen on a DIFFERENT device than the one that started
        // sign-in (laptop -> phone gmail, in-app webview, "open in browser",
        // etc.). PKCE silently fails in every one of those cases — the user
        // gets the email, clicks the link, lands on the app and is still
        // logged out, with no error to explain why.
        //
        // Implicit flow puts the access_token directly in the URL hash. The
        // landing-page SDK picks it up regardless of which device opened the
        // link. This is what Slack, Notion, Substack, and most magic-link
        // products use. Same security model.
        flowType: "implicit",
      },
    });
  }
  return _client;
}

// ─── Convenience helpers used across the Lounge app ──────────────────────

/** Return the current signed-in user, or null. */
export async function getCurrentUser() {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

/** Return the current user's profile row from `profiles`, or null. */
export async function getCurrentProfile() {
  const supabase = getSupabase();
  const user = await getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("[Lounge] failed to load profile:", error);
    return null;
  }
  return data;
}

/** Touch profiles.last_active_at — call on dashboard load. Cheap. */
export async function touchActive() {
  const supabase = getSupabase();
  const user = await getCurrentUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", user.id);
}

/** Sign out and redirect to /lounge/login/. */
export async function signOutAndRedirect() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  window.location.href = "/lounge/login/";
}
