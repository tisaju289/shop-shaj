import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { defaultSettings, type StoreSettings } from "@/lib/types";

async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("data")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw error;
  return { ...defaultSettings, ...((data?.data as Partial<StoreSettings>) ?? {}) };
}

export const settingsQuery = {
  queryKey: ["store-settings"],
  queryFn: fetchSettings,
  staleTime: 5 * 60_000,
};

const StoreContext = createContext<{ settings: StoreSettings; isLoading: boolean }>({
  settings: defaultSettings,
  isLoading: true,
});

function hexToOklchVar(hex: string): string | null {
  const clean = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return `#${clean}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery(settingsQuery);
  const settings = data ?? defaultSettings;

  useEffect(() => {
    const root = document.documentElement;
    const primary = hexToOklchVar(settings.primary_color ?? "");
    const secondary = hexToOklchVar(settings.secondary_color ?? "");
    if (primary) {
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--ring", primary);
    }
    if (secondary) root.style.setProperty("--secondary", secondary);
    if (settings.radius) root.style.setProperty("--radius", settings.radius);
  }, [settings.primary_color, settings.secondary_color, settings.radius]);

  return (
    <StoreContext.Provider value={{ settings, isLoading }}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

export function useSettings() {
  return useContext(StoreContext).settings;
}
