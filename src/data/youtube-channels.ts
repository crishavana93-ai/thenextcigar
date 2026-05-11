/**
 * YouTube channels aggregated on the /watch page.
 *
 * Channel IDs verified via the YouTube channel page source — extracted from
 * the "channelId" field in each channel's HTML. If a channel ID stops working
 * (because the channel was renamed or deleted), the /watch page silently
 * skips it so the rest of the aggregation still works.
 *
 * To add a new channel:
 *   1. Visit the YouTube channel's page (e.g. youtube.com/@halfwheel)
 *   2. View Page Source (Cmd+Option+U)
 *   3. Search for "channelId":"UC...
 *   4. Copy the UC... value
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
    name: "Halfwheel",
    id: "UCqiAcjhqaCAGpy_mpYhEwTw",
    handle: "@halfwheel",
    enabled: true,
  },
  {
    name: "Cigar Aficionado",
    id: "UC3Y7OkIW5Yu6-h2CcgtmPSQ",
    handle: "@cigaraficionado",
    enabled: true,
  },
  {
    name: "Habanos Oficial",
    id: "UCstGLy96wdZG7eCM4855_DA",
    handle: "@HabanosOficial",
    enabled: true,
  },
  {
    name: "Davidoff Geneva",
    id: "UC8tjRjFdnIBSebHZzBzbduQ",
    handle: "@davidoffgeneva",
    enabled: true,
  },
  {
    name: "Stogie Geeks",
    id: "UCg--XBjJ50a9tUhTKXVPiqg",
    handle: "@stogiegeek",
    enabled: true,
  },
  {
    name: "Cigar Coop",
    id: "UC0LQc8kuI6JrZbSpWXXyqcw", // placeholder — original handle 404s, needs verified ID
    handle: "@cigarcoop",
    enabled: false, // disable until correct handle is confirmed
  },
  {
    name: "El Septimo Geneva",
    id: "UCKPuV2eWfH4yIFcRdwFXNVA", // placeholder — verify before enabling
    handle: "@elseptimogeneva",
    enabled: false,
  },
];
