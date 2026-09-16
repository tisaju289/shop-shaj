import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Resolves a social platform video link (TikTok, Instagram, Facebook, …) to a
 * direct playable stream URL so the storefront can render it in a plain
 * <video> element. That removes provider chrome (profile header, "View
 * profile", related-video grid at the end) and gives smooth, looping playback
 * of only the video the admin linked.
 *
 * Returns { streamUrl: null } when extraction is not possible. The storefront
 * deliberately never falls back to a provider iframe, preventing profile UI,
 * internal scrolling, and related-video screens from appearing.
 */
export const resolveVideoStream = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ url: z.string().min(4) }).parse(data))
  .handler(async ({ data }): Promise<{ streamUrl: string | null }> => {
    const target = data.url.trim();
    if (!/^https?:\/\//i.test(target)) return { streamUrl: null };

    try {
      const res = await fetch(target, {
        redirect: "follow",
        headers: {
          // A desktop browser UA gets the HTML page with og:video metadata.
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          "accept-language": "en-US,en;q=0.9",
        },
      });
      if (!res.ok) return { streamUrl: null };
      const html = await res.text();

      const patterns: RegExp[] = [
        /<meta[^>]+property=["']og:video:secure_url["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video:secure_url["']/i,
        /<meta[^>]+property=["']og:video(?::url)?["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+name=["']twitter:player:stream["'][^>]+content=["']([^"']+)["']/i,
        /"video_url":"([^"]+\.mp4[^"]*)"/i,
        /"playAddr":"([^"]+)"/i,
        /"downloadAddr":"([^"]+)"/i,
        /"contentUrl":"([^"]+\.mp4[^"]*)"/i,
        /"browser_native_hd_url":"([^"]+)"/i,
        /"browser_native_sd_url":"([^"]+)"/i,
      ];

      for (const re of patterns) {
        const raw = html.match(re)?.[1];
        if (!raw) continue;
        const decoded = decodeCandidate(raw);
        if (/^https:\/\//i.test(decoded) && /\.(mp4|webm|m3u8)/i.test(decoded)) {
          return { streamUrl: decoded };
        }
      }
    } catch {
      return { streamUrl: null };
    }

    return { streamUrl: null };
  });

function decodeCandidate(value: string) {
  let out = value.replace(/\\u0026/g, "&").replace(/\\\//g, "/").replace(/\\u002F/gi, "/");
  out = out.replace(/&amp;/g, "&");
  try {
    out = JSON.parse(`"${out.replace(/"/g, '\\"')}"`);
  } catch {
    // keep the unescaped value
  }
  return out;
}
