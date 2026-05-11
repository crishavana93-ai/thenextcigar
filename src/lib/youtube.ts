/**
 * YouTube channel RSS aggregator — shared between /watch/ and HomeVideos.
 *
 * Fetches a channel's RSS feed at build time, parses the recent entries, and
 * returns a typed array of videos. One bad channel doesn't break aggregation:
 * fetch failures return an empty array silently so the build still succeeds.
 */
import { channels } from "../data/youtube-channels";

export interface Video {
  videoId: string;
  title: string;
  channelName: string;
  channelHandle?: string;
  publishedAt: string;
  thumbnail: string;
}

async function fetchChannelVideos(
  channelId: string,
  channelName: string,
  channelHandle?: string,
  max = 5
): Promise<Video[]> {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "thenextcigar.com/1.0 (+https://thenextcigar.com)" },
    });
    if (!res.ok) {
      console.warn(`[youtube] ${channelName} returned ${res.status}`);
      return [];
    }
    const xml = await res.text();
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, max);
    return entries
      .map((m) => {
        const e = m[1];
        const videoId = (e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1] || "";
        const title = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || "";
        const published = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || "";
        const thumbnail = videoId
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : "";
        return {
          videoId,
          title: title
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'"),
          channelName,
          channelHandle,
          publishedAt: published,
          thumbnail,
        };
      })
      .filter((v) => v.videoId);
  } catch (err) {
    console.warn(`[youtube] ${channelName} fetch error`, err);
    return [];
  }
}

/**
 * Fetch the latest N videos across all enabled channels, sorted newest first.
 * Call with `limit: 6` from the home page, `limit: undefined` from /watch.
 */
export async function fetchLatestVideos(limit?: number): Promise<Video[]> {
  const enabled = channels.filter((c) => c.enabled);
  const all = (
    await Promise.all(enabled.map((c) => fetchChannelVideos(c.id, c.name, c.handle)))
  ).flat();
  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return typeof limit === "number" ? all.slice(0, limit) : all;
}
