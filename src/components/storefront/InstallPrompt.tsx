import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useSettings } from "@/lib/store-context";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa-install-dismissed";

/**
 * Shows an "install app" banner when the browser offers the PWA install
 * prompt (Android/Chrome/Edge). Hidden when already installed or dismissed.
 */
export function InstallPrompt() {
  const { store_name, logo_url } = useSettings();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 md:inset-x-auto md:right-4 md:w-96">
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 shadow-lg">
        {logo_url ? (
          <img src={logo_url} alt="" className="size-11 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Download className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {store_name || "আমাদের"} অ্যাপ ইনস্টল করুন
          </p>
          <p className="text-xs text-muted-foreground">হোম স্ক্রিন থেকে এক ট্যাপে শপিং করুন</p>
        </div>
        <button
          type="button"
          onClick={() => void install()}
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          ইনস্টল
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="বন্ধ করুন"
          className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
