import { MessageCircle } from "lucide-react";

import { useSettings } from "@/lib/store-context";

export function WhatsAppFloat() {
  const settings = useSettings();

  if (!settings.whatsapp_float_enabled) return null;

  const number = settings.whatsapp?.trim();
  if (!number) return null;

  const phone = number.replace(/[^\d]/g, "");
  if (!phone) return null;

  const message = settings.whatsapp_float_message?.trim() ?? "";
  const href = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  const position = settings.whatsapp_float_position ?? "right";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp এ মেসেজ করুন"
      className="group fixed z-50 flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      style={{
        bottom: "calc(5rem + env(safe-area-inset-bottom))",
        [position === "left" ? "left" : "right"]: "1rem",
      }}
    >
      <MessageCircle className="h-6 w-6 shrink-0" strokeWidth={2.2} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 group-hover:max-w-[140px] group-hover:opacity-100">
        চ্যাট করুন
      </span>
    </a>
  );
}
