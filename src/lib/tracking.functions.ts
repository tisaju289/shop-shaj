import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Facebook Conversions API relay.
 *
 * Consent route: no cookie banner. Requests coming from regions where consent is
 * legally required (EEA / UK / CH) or whose region cannot be resolved are dropped
 * server-side as well, so a spoofed client cannot bypass the block.
 */
const CONSENT_REQUIRED_REGIONS = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE", "GB", "NO", "IS", "LI", "CH",
]);

const contentSchema = z.object({
  id: z.string(),
  quantity: z.number().int().positive(),
  item_price: z.number().nonnegative(),
});

const inputSchema = z.object({
  eventName: z.enum(["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "Purchase"]),
  eventId: z.string().min(4).max(120),
  eventSourceUrl: z.string().max(2000).optional(),
  value: z.number().nonnegative().optional(),
  currency: z.string().max(8).optional(),
  contents: z.array(contentSchema).max(50).optional(),
  contentIds: z.array(z.string()).max(50).optional(),
  contentName: z.string().max(200).optional(),
  orderId: z.string().max(120).optional(),
  fbp: z.string().max(200).optional(),
  fbc: z.string().max(400).optional(),
});

type CapiResult = { sent: boolean; reason?: string };

export const sendConversionEvent = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<CapiResult> => {
    const request = getRequest();
    const country = (request?.headers.get("cf-ipcountry") ?? "").toUpperCase();
    if (!country || country === "XX" || country === "T1" || CONSENT_REQUIRED_REGIONS.has(country)) {
      return { sent: false, reason: "consent_region_blocked" };
    }

    const SUPABASE_URL = process.env["SUPABASE_URL"];
    const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return { sent: false, reason: "no_backend" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: settingsRow }, { data: secretRow }] = await Promise.all([
      supabaseAdmin.from("store_settings").select("data").eq("id", "default").maybeSingle(),
      supabaseAdmin.from("tracking_secrets").select("fb_access_token").eq("id", "default").maybeSingle(),
    ]);

    const settings = (settingsRow?.data ?? {}) as Record<string, unknown>;
    if (settings["tracking_enabled"] !== true) return { sent: false, reason: "tracking_disabled" };
    if (settings["fb_capi_enabled"] !== true) return { sent: false, reason: "capi_disabled" };

    const pixelId = String(settings["fb_pixel_id"] ?? "").trim();
    const testEventCode = String(settings["fb_test_event_code"] ?? "").trim();
    const accessToken =
      (secretRow?.fb_access_token ?? "").trim() || (process.env["FB_CAPI_ACCESS_TOKEN"] ?? "").trim();

    if (!pixelId || !accessToken) return { sent: false, reason: "capi_not_configured" };

    const clientIp =
      request?.headers.get("cf-connecting-ip") ??
      request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      undefined;

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: data.eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: data.eventId,
          event_source_url: data.eventSourceUrl,
          action_source: "website",
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: request?.headers.get("user-agent") ?? undefined,
            fbp: data.fbp,
            fbc: data.fbc,
          },
          custom_data: {
            currency: data.currency,
            value: data.value,
            contents: data.contents,
            content_ids: data.contentIds,
            content_name: data.contentName,
            content_type: data.contents?.length || data.contentIds?.length ? "product" : undefined,
            order_id: data.orderId,
            num_items: data.contents?.reduce((sum, c) => sum + c.quantity, 0),
          },
        },
      ],
    };
    if (testEventCode) body["test_event_code"] = testEventCode;

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[CAPI] Facebook request failed [${response.status}]: ${errorBody}`);
      return { sent: false, reason: `facebook_error_${response.status}` };
    }

    return { sent: true };
  });
