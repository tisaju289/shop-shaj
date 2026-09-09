import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "store-media";

/** Ten years — media URLs are stored in the database as ready-to-render links. */
const URL_TTL = 60 * 60 * 24 * 365 * 10;

export type MediaFolder = "products" | "categories" | "hero" | "banners" | "store";

export async function uploadMedia(file: File, folder: MediaFolder): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const publicUrl = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  const head = await fetch(publicUrl, { method: "HEAD" });
  if (head.ok) return publicUrl;

  const signed = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, URL_TTL);
  if (signed.error) throw signed.error;
  return signed.data.signedUrl;
}

export function fallbackImage(seed: string) {
  return `https://placehold.co/800x1000/f3ece7/7a2b3f?text=${encodeURIComponent(seed.slice(0, 18))}`;
}
