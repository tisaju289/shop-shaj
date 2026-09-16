import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import type { ShowcaseVideo } from "@/lib/types";
import { resolveVideoStream } from "@/lib/video-resolve.functions";

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

/**
 * Lovable CDN assets are stored as site-relative `/__l5e/...` paths. On
 * Lovable hosting those resolve on the same origin, but on a self-hosted
 * (e.g. Cloudflare) deployment they must point at the stable project CDN
 * host so videos keep working in production.
 */
const CDN_HOST = "https://4e17ed21-fa8e-4673-93ce-01ad4c130e96.lovableproject.com";

export function resolveVideoUrl(rawUrl: string): string {
  const url = rawUrl.trim();
  if (url.startsWith("/__l5e/")) return `${CDN_HOST}${url}`;
  return url;
}

export function buildVideoEmbed(rawUrl: string): VideoEmbed {
  const url = resolveVideoUrl(rawUrl);
  if (!url) return null;

  // Direct video files (including the store's own hosted assets) play in a
  // native <video> element, so no provider UI can appear.
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

function Frame({ video, children }: { video: ShowcaseVideo; children: React.ReactNode }) {
  return (
    <figure className="w-[calc((100%-0.75rem)/2)] shrink-0 snap-start md:w-[calc((100%-3rem)/4)]">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border bg-black">
        {children}
      </div>
      {video.title && (
        <figcaption className="mt-2 line-clamp-2 text-center text-sm font-medium text-foreground">
          {video.title}
        </figcaption>
      )}
    </figure>
  );
}

function NativeVideo({ src, video }: { src: string; video: ShowcaseVideo }) {
  return (
    <video
      src={src}
      poster={video.thumbnail_url || undefined}
      title={video.title || "ভিডিও"}
      className="absolute inset-0 size-full object-contain"
      playsInline
      controls
      controlsList="nodownload noremoteplayback noplaybackrate"
      disablePictureInPicture
      preload="metadata"
    />
  );
}

function VideoUnavailable({ video }: { video: ShowcaseVideo }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted p-4 text-center">
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt=""
          className="absolute inset-0 size-full object-contain"
          loading="lazy"
        />
      ) : null}
      <p className="relative z-10 rounded bg-background/90 px-3 py-2 text-sm text-foreground shadow-sm">
        সরাসরি ভিডিও ফাইল আপলোড করুন
      </p>
    </div>
  );
}

function VideoCard({ video }: { video: ShowcaseVideo }) {
  const embed = buildVideoEmbed(video.video_url);
  const resolve = useServerFn(resolveVideoStream);
  const needsResolve = !!embed && !embed.streamUrl;

  const { data } = useQuery({
    queryKey: ["video-stream", video.video_url],
    queryFn: () => resolve({ data: { url: resolveVideoUrl(video.video_url) } }),
    enabled: needsResolve,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  if (!embed) return null;

  // Direct file — plays natively, no provider UI at all.
  if (embed.streamUrl) {
    return (
      <Frame video={video}>
        <NativeVideo src={embed.streamUrl} video={video} />
      </Frame>
    );
  }

  // Social link resolved to a direct stream: no profile header, no related videos.
  if (data?.streamUrl) {
    return (
      <Frame video={video}>
        <NativeVideo src={data.streamUrl} video={video} />
      </Frame>
    );
  }

  // Never fall back to a provider iframe. Provider frames add profile chrome,
  // scrolling, pop-out controls, and related videos that the storefront
  // cannot reliably hide. A native stream is the only permanent clean mode.
  return (
    <Frame video={video}>
      <VideoUnavailable video={video} />
    </Frame>
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
