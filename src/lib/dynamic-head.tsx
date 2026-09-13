import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSettings } from "@/lib/store-context";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertIcon(rel: string, href: string) {
  const existing = document.head.querySelectorAll<HTMLLinkElement>(`link[rel="${rel}"]`);
  existing.forEach((el, i) => {
    if (i > 0) el.remove();
  });
  let el = existing[0];
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  el.removeAttribute("type");
}

function upsertManifest(version: string) {
  const manifest = document.head.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!manifest) return;
  manifest.href = `/manifest.webmanifest?v=${encodeURIComponent(version || "default")}`;
}

/**
 * Applies admin-managed branding (favicon, title suffix, tagline, SEO meta)
 * on top of each route's own head metadata.
 */
export function DynamicHead() {
  const settings = useSettings();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const {
    store_name,
    tagline,
    favicon_url,
    logo_url,
    meta_title,
    meta_description,
    og_image,
    google_verification,
  } = settings;

  useEffect(() => {
    const icon = favicon_url || logo_url;
    upsertMeta("name", "application-name", store_name?.trim() || "আমার স্টোর");
    upsertMeta("name", "apple-mobile-web-app-title", store_name?.trim() || "আমার স্টোর");
    if (icon) {
      upsertIcon("icon", icon);
      upsertIcon("apple-touch-icon", icon);
    }
    upsertManifest([store_name, favicon_url, logo_url].filter(Boolean).join("-"));
  }, [favicon_url, logo_url, store_name]);

  useEffect(() => {
    const brand = store_name?.trim();
    const isHome = pathname === "/";
    const base = isHome
      ? meta_title?.trim() || [brand, tagline?.trim()].filter(Boolean).join(" — ")
      : document.title;

    let title = base || document.title;
    if (brand && !title.includes(brand)) title = `${title} — ${brand}`;
    if (title) document.title = title;

    const description = (isHome ? meta_description?.trim() : "") || meta_description?.trim() || "";
    const existingDesc = document.head
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.getAttribute("content");

    if (isHome && description) {
      upsertMeta("name", "description", description);
      upsertMeta("property", "og:description", description);
    } else if (!existingDesc && description) {
      upsertMeta("name", "description", description);
    }

    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:site_name", brand || "");
    if (og_image) {
      upsertMeta("property", "og:image", og_image);
      upsertMeta("name", "twitter:image", og_image);
    }
    if (google_verification) {
      upsertMeta("name", "google-site-verification", google_verification);
    }
  }, [
    pathname,
    store_name,
    tagline,
    meta_title,
    meta_description,
    og_image,
    google_verification,
  ]);

  return null;
}
