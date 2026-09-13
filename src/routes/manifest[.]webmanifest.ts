import { createFileRoute } from "@tanstack/react-router";

/**
 * Dynamic PWA manifest — name/branding come from admin store settings, so the
 * same build works for every client deployment.
 */
export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () => {
        let name = "আমার স্টোর";
        let tagline = "";
        let icon = "/icons/icon-512.png";
        try {
          const base = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"];
          const key =
            process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
          if (!base || !key) throw new Error("Supabase manifest configuration is missing");
          const res = await fetch(`${base}/rest/v1/store_settings?select=data&id=eq.default`, {
            headers: { apikey: key },
          });
          if (!res.ok) throw new Error(`Manifest settings request failed: ${res.status}`);
          const rows = (await res.json()) as Array<{ data: Record<string, unknown> }>;
          const data = rows[0]?.data ?? {};
          if (typeof data["store_name"] === "string" && data["store_name"].trim()) {
            name = data["store_name"].trim();
          }
          if (typeof data["tagline"] === "string") tagline = data["tagline"].trim();
          if (typeof data["favicon_url"] === "string" && data["favicon_url"].trim()) {
            icon = data["favicon_url"].trim();
          } else if (typeof data["logo_url"] === "string" && data["logo_url"].trim()) {
            icon = data["logo_url"].trim();
          }
        } catch {
          // fall back to defaults
        }

        const manifest = {
          name,
          short_name: name.length > 12 ? name.slice(0, 12) : name,
          description: tagline || name,
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#fdfaf7",
          theme_color: "#7a2b3f",
          lang: "bn",
          icons: [
            { src: icon, sizes: "192x192", type: "image/png" },
            { src: icon, sizes: "512x512", type: "image/png" },
            {
              src: icon,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        };

        return new Response(JSON.stringify(manifest), {
          headers: {
            "content-type": "application/manifest+json; charset=utf-8",
            "cache-control": "no-cache, must-revalidate",
          },
        });
      },
    },
  },
});
