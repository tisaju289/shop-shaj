import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { useSettings } from "@/lib/store-context";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[]; loaded?: boolean; version?: string };
  }
}

type FacebookQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
};

const RESTRICTED_REGIONS = new Set(["AT", "BE", "BG", "HR", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HU", "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL", "PT", "RO", "SE", "SI", "SK", "GB"]);
let permissionPromise: Promise<boolean> | null = null;

export function canTrackVisitor() {
  if (permissionPromise) return permissionPromise;
  permissionPromise = Promise.race([
    fetch("/cdn-cgi/trace").then(async (response) => {
      if (!response.ok) return false;
      const match = (await response.text()).match(/^loc=(.+)$/m);
      const country = match?.[1]?.trim().toUpperCase();
      return Boolean(country && country !== "XX" && country !== "T1" && !RESTRICTED_REGIONS.has(country));
    }).catch(() => false),
    new Promise<boolean>((resolve) => window.setTimeout(() => resolve(false), 2000)),
  ]);
  return permissionPromise;
}

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

export async function trackPurchase(input: { eventId: string; value: number; orderNumber: string }) {
  if (!(await canTrackVisitor())) return;
  window.fbq?.("track", "Purchase", { value: input.value, currency: "BDT" }, { eventID: input.eventId });
  gtag("event", "purchase", {
    transaction_id: input.orderNumber,
    value: input.value,
    currency: "BDT",
  });
}

export function TrackingManager() {
  const settings = useSettings();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    void canTrackVisitor().then((allowed) => {
      if (!allowed) return;
      if (settings.facebook_pixel_enabled && /^\d{5,25}$/.test(settings.facebook_pixel_id)) {
        if (!window.fbq) {
          const fbq: FacebookQueue = function (...args: unknown[]) {
            if (fbq.callMethod) fbq.callMethod(...args);
            else (fbq.queue ??= []).push(args);
          };
          fbq.loaded = true;
          fbq.version = "2.0";
          window.fbq = fbq;
          const script = document.createElement("script");
          script.async = true;
          script.src = "https://connect.facebook.net/en_US/fbevents.js";
          document.head.appendChild(script);
          fbq("init", settings.facebook_pixel_id);
        }
      }
      if (settings.ga4_enabled && /^G-[A-Z0-9]+$/i.test(settings.ga4_measurement_id)) {
        if (!document.querySelector(`script[data-ga4-id="${settings.ga4_measurement_id}"]`)) {
          const script = document.createElement("script");
          script.async = true;
          script.dataset["ga4Id"] = settings.ga4_measurement_id;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4_measurement_id)}`;
          document.head.appendChild(script);
          gtag("js", new Date());
          gtag("config", settings.ga4_measurement_id, { send_page_view: false });
        }
      }
    });
  }, [settings.facebook_pixel_enabled, settings.facebook_pixel_id, settings.ga4_enabled, settings.ga4_measurement_id]);

  useEffect(() => {
    void canTrackVisitor().then((allowed) => {
      if (!allowed) return;
      if (settings.facebook_pixel_enabled) window.fbq?.("track", "PageView");
      if (settings.ga4_enabled) gtag("event", "page_view", { page_path: pathname });
    });
  }, [pathname, settings.facebook_pixel_enabled, settings.ga4_enabled]);

  return null;
}