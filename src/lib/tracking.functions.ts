import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const tokenSchema = z.object({ token: z.string().trim().min(20).max(1000) });
const purchaseSchema = z.object({
  orderId: z.string().uuid(),
  eventId: z.string().min(8).max(150),
  sourceUrl: z.string().url().max(2000),
});

async function ensureAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden");
}

export const getCapiTokenStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { data, error } = await context.supabase
      .from("tracking_secrets")
      .select("fb_access_token")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw error;
    return { configured: Boolean(data?.fb_access_token) };
  });

export const saveCapiToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => tokenSchema.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("tracking_secrets")
      .upsert({ id: "default", fb_access_token: data.token });
    if (error) throw error;
    return { configured: true };
  });

export const removeCapiToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase
      .from("tracking_secrets")
      .upsert({ id: "default", fb_access_token: null });
    if (error) throw error;
    return { configured: false };
  });

export const reportFacebookPurchase = createServerFn({ method: "POST" })
  .inputValidator((input) => purchaseSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: settingsRow }, { data: secretRow }, { data: order }] = await Promise.all([
      supabaseAdmin.from("store_settings").select("data").eq("id", "default").maybeSingle(),
      supabaseAdmin.from("tracking_secrets").select("fb_access_token").eq("id", "default").maybeSingle(),
      supabaseAdmin.from("orders").select("id,total,order_number,created_at").eq("id", data.orderId).maybeSingle(),
    ]);
    const settings = (settingsRow?.data ?? {}) as Record<string, unknown>;
    const pixelId = typeof settings["facebook_pixel_id"] === "string" ? settings["facebook_pixel_id"] : "";
    if (!settings["facebook_capi_enabled"] || !pixelId || !secretRow?.fb_access_token || !order) {
      return { sent: false };
    }

    const { data: existing } = await supabaseAdmin
      .from("tracking_events")
      .select("status")
      .eq("provider", "facebook")
      .eq("event_id", data.eventId)
      .maybeSingle();
    if (existing?.status === "sent") return { sent: true };

    await supabaseAdmin.from("tracking_events").upsert({
      order_id: order.id,
      provider: "facebook",
      event_name: "Purchase",
      event_id: data.eventId,
      status: "pending",
    }, { onConflict: "provider,event_id" });

    const payload: Record<string, unknown> = {
      data: [{
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: data.eventId,
        action_source: "website",
        event_source_url: data.sourceUrl,
        custom_data: { currency: "BDT", value: Number(order.total), order_id: order.order_number },
      }],
    };
    const testCode = settings["facebook_test_event_code"];
    if (typeof testCode === "string" && testCode.trim()) payload["test_event_code"] = testCode.trim();

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(secretRow.fb_access_token)}`,
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) },
    );
    const responseText = await response.text();
    await supabaseAdmin.from("tracking_events").update({
      status: response.ok ? "sent" : "failed",
      provider_response: responseText.slice(0, 4000),
    }).eq("provider", "facebook").eq("event_id", data.eventId);
    if (!response.ok) {
      console.error(`Facebook CAPI failed [${response.status}]: ${responseText}`);
      return { sent: false };
    }
    return { sent: true };
  });