/**
 * YouTube channels aggregated on the /watch page.
 *
 * To find a channel's ID:
 *   1. Visit the YouTube channel's page (e.g. youtube.com/@cigaraficionado)
 *   2. Right-click → View Page Source
 *   3. Search for "browseId" or "channel_id" — the value is `UC...` (24 chars)
 *  OR easier:
 *   - Use https://commentpicker.com/youtube-channel-id.php → paste URL → get ID
 *
 * If a channel's ID is wrong or missing, that channel is silently skipped at
 * build time so the page still works.
 */

export interface YouTubeChannel {
  /** Channel ID (UC... format) — required for the RSS feed */
  id: string;
  /** Friendly name shown on cards */
  name: string;
  /** Optional handle for linking back to the channel */
  handle?: string;
  /** Whether to include this channel in /watch aggregation */
  enabled: boolean;
}

export const channels: YouTubeChannel[] = [
  {
    name: "Cigar Aficionado",
    id: "UC0qx7kYS9-Yvk-_F1hPhqAA", // official channel — verify before publish
    handle: "@cigaraficionado",
    enabled: true,
  },
  {
    name: "Habanos S.A.",
    id: "UCxsxPeo86Lt5fLG7Po9NgrA", // official Habanos channel — verify
    handle: "@HabanosSA",
    enabled: true,
  },
  {
    name: "Halfwheel",
    id: "UCcz-4GZZ59twRH0Ie-l4Yhw",
    handle: "@halfwheel",
    enabled: true,
  },
  {
    name: "Davidoff of Geneva",
    id: "UCAdj0nF4Z4Zv2H2afG7dkkA", // official Davidoff channel — verify
    handle: "@DavidoffOfGeneva",
    enabled: true,
  },
  {
    name: "Stogie Geeks",
    id: "UC9wJgK8aH3nwKnP7XK3SlOw",
    handle: "@stogiegeeks",
    enabled: true,
  },
  {
    name: "Cigar Coop",
    id: "UC0LQc8kuI6JrZbSpWXXyqcw",
    handle: "@cigarcoop",
    enabled: true,
  },
  {
    name: "El Septimo Geneva",
    id: "UCKPuV2eWfH4yIFcRdwFXNVA",
    handle: "@elseptimogeneva",
    enabled: false, // enable when verified
  },
];
