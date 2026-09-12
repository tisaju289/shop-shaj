import { Play } from "lucide-react";
import { useState } from "react";

import type { ShowcaseVideo } from "@/lib/types";

export type VideoEmbed = {
  src: string;
  provider: string;
  /** Direct playable stream URL for a native <video> element, when available. */
  streamUrl?: string;
} | null;

function withParams(base: string, params: Record<string, string | undefined>) {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  return url.toString();
}

const VIDEO_FILE_RE = /\.(mp4|webm|mov|m4v|ogv|ogg)(\?.*)?$/i;

export function buildVideoEmbed(rawUrl: string): VideoEmbed {
  const url = rawUrl.trim();
  if (!url) return null;

  // Direct video files (including the store's own hosted assets) play in a
  // native <video> element: autoplay works and there is no provider download
  // / pop-out button to hide.
  if (VIDEO_FILE_RE.test(url)) {
    return { src: url, streamUrl: url, provider: "file" };
  }

  let parsed: URL;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  const path = parsed.pathname;

  // YouTube (shorts, watch, youtu.be, embed)
  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0];
    if (!id) return null;
    return {
      src: withParams(`https://www.youtube.com/embed/${id}`, { rel: "0" }),
      provider: "youtube",
    };
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const id =
      parsed.searchParams.get("v") ??
      path.match(/\/(?:shorts|embed|live|v)\/([\w-]+)/)?.[1] ??
      null;
    if (!id) return null;
    return {
      src: withParams(`https://www.youtube.com/embed/${id}`, { rel: "0" }),
      provider: "youtube",
    };
  }

  // TikTok
  if (host.endsWith("tiktok.com")) {
    const id = path.match(/\/video\/(\d+)/)?.[1] ?? path.match(/^\/embed\/v2\/(\d+)/)?.[1] ?? null;
    if (id) return { src: `https://www.tiktok.com/embed/v2/${id}`, provider: "tiktok" };
    return null;
  }

  // Instagram reels / posts
  if (host.endsWith("instagram.com")) {
    const code = path.match(/\/(?:reels?|p|tv)\/([\w-]+)/)?.[1];
    return code
      ? { src: `https://www.instagram.com/reel/${code}/embed`, provider: "instagram" }
      : null;
  }

  // Google Drive files need the supported preview player. The download
  // endpoint can return a confirmation page instead of video bytes.
  if (host.endsWith("drive.google.com") || host.endsWith("docs.google.com")) {
    const id =
      path.match(/\/file\/d\/([\w-]+)/)?.[1] ??
      parsed.searchParams.get("id") ??
      path.match(/\/d\/([\w-]+)/)?.[1] ??
      null;
    if (!id) return null;
    return { src: `https://drive.google.com/file/d/${id}/preview`, provider: "drive" };
  }

  // Facebook (reels, videos, watch)
  if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) {
    return {
      src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(parsed.toString())}&show_text=false&width=320`,
      provider: "facebook",
    };
  }

  return { src: parsed.toString(), provider: "other" };
}

function VideoCard({ video }: { video: ShowcaseVideo }) {
  const [playing, setPlaying] = useState(false);
  const embed = buildVideoEmbed(video.video_url);
  if (!embed) return null;

  // Native <video> for direct/streamable files — autoplays muted and has no
  // download / pop-out link icon to worry about.
  if (embed.streamUrl) {
    return (
      <figure className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start md:w-[calc((100%-3rem)/4)]">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border bg-black">
          <video
            src={embed.streamUrl}
            poster={video.thumbnail_url || undefined}
            title={video.title || "ভিডিও"}
            className="absolute inset-0 size-full object-cover"
            muted
            loop
            playsInline
            controls
            preload="auto"
          />
        </div>
        {video.title && (
          <figcaption className="mt-2 line-clamp-2 text-center text-sm font-medium text-foreground">
            {video.title}
          </figcaption>
        )}
      </figure>
    );
  }

  const isYoutube = embed.provider === "youtube";
  const isDrive = embed.provider === "drive";
  const autoplay = isYoutube;
  const iframeSrc =
    playing || autoplay
      ? withParams(
          embed.src,
          isYoutube ? { autoplay: "1", mute: "1", rel: "0" } : { autoplay: "1" },
        )
      : embed.src;

  return (
    <figure className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start md:w-[calc((100%-3rem)/4)]">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border bg-black">
        {playing || autoplay || !video.thumbnail_url ? (
          <div className="absolute inset-0">
            <iframe
              src={iframeSrc}
              title={video.title || "ভিডিও"}
              loading="lazy"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              className="absolute inset-0 size-full border-0"
              style={{ objectFit: "cover" }}
            />
            {isDrive && (
              <span aria-hidden="true" className="absolute right-2 top-2 z-10 h-16 w-20 bg-black" />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 size-full"
            aria-label={`${video.title || "ভিডিও"} চালু করুন`}
          >
            <img
              src={video.thumbnail_url}
              alt={video.title || "ভিডিও থাম্বনেইল"}
              loading="lazy"
              className="size-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="flex size-14 items-center justify-center rounded-full bg-background/90 text-foreground">
                <Play className="size-6" />
              </span>
            </span>
          </button>
        )}
      </div>
      {video.title && (
        <figcaption className="mt-2 line-clamp-2 text-center text-sm font-medium text-foreground">
          {video.title}
        </figcaption>
      )}
    </figure>
  );
}

export function VideoShowcase({ videos }: { videos: ShowcaseVideo[] }) {
  if (!videos.length) return null;
  return (
    <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:gap-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
