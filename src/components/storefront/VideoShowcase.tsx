import { Play } from "lucide-react";
import { useState } from "react";

import type { ShowcaseVideo } from "@/lib/types";

export type VideoEmbed = { src: string; provider: string } | null;

export function buildVideoEmbed(rawUrl: string): VideoEmbed {
  const url = rawUrl.trim();
  if (!url) return null;

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
    return id ? { src: `https://www.youtube.com/embed/${id}?rel=0`, provider: "youtube" } : null;
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const id =
      parsed.searchParams.get("v") ??
      path.match(/\/(?:shorts|embed|live|v)\/([\w-]+)/)?.[1] ??
      null;
    return id ? { src: `https://www.youtube.com/embed/${id}?rel=0`, provider: "youtube" } : null;
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

  // Google Drive (file links, open?id=, uc?id=)
  if (host.endsWith("drive.google.com") || host.endsWith("docs.google.com")) {
    const id =
      path.match(/\/file\/d\/([\w-]+)/)?.[1] ??
      parsed.searchParams.get("id") ??
      path.match(/\/d\/([\w-]+)/)?.[1] ??
      null;
    return id
      ? { src: `https://drive.google.com/file/d/${id}/preview`, provider: "drive" }
      : null;
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

  return (
    <figure className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start md:w-[calc((100%-3rem)/4)]">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border bg-black">
        {playing || !video.thumbnail_url ? (
          <iframe
            src={playing ? `${embed.src}${embed.src.includes("?") ? "&" : "?"}autoplay=1` : embed.src}
            title={video.title || "ভিডিও"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
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
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
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
