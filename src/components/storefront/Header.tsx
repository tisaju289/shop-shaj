import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { CartDrawer } from "@/components/storefront/CartDrawer";
import { SmartLink } from "@/components/storefront/SmartLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pushRecentSearch, readRecentSearches } from "@/lib/recently-viewed";
import { useSettings } from "@/lib/store-context";
import { defaultSettings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";

export function Header() {
  const settings = useSettings();
  const nav = settings.header_nav?.length ? settings.header_nav : defaultSettings.header_nav;

  
  const wishlist = useWishlist();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (searchOpen) setRecent(readRecentSearches());
  }, [searchOpen]);

  function submitSearch(value: string) {
    const q = value.trim();
    if (!q) return;
    pushRecentSearch(q);
    setSearchOpen(false);
    setTerm("");
    navigate({ to: "/search", search: { q } });
  }

  return (
    <header
      className={cn(
        "z-50 border-b border-border/70 backdrop-blur",
        !settings.header_bg_color &&
          "bg-background/95 supports-[backdrop-filter]:bg-background/80",
        settings.header_sticky !== false && "sticky top-0",
      )}
      style={{
        ...(settings.header_bg_color ? { backgroundColor: settings.header_bg_color } : {}),
        ...(settings.header_text_color ? { color: settings.header_text_color } : {}),
      }}
    >
      {settings.header_announcement_enabled !== false && (
        <div
          className={cn(
            "hidden py-2 text-center text-xs md:block",
            !settings.header_announcement_bg_color && "bg-primary text-primary-foreground",
          )}
          style={{
            ...(settings.header_announcement_bg_color
              ? { backgroundColor: settings.header_announcement_bg_color }
              : {}),
            ...(settings.header_announcement_text_color
              ? { color: settings.header_announcement_text_color }
              : {}),
          }}
        >
          <div className="container-x">
            {settings.header_announcement_text || defaultSettings.header_announcement_text}
            {settings.free_delivery_threshold > 0 && (
              <> · {settings.free_delivery_threshold} টাকার উপরে ফ্রি ডেলিভারি</>
            )}
            {settings.phone && <> · হটলাইন: {settings.phone}</>}
          </div>
        </div>
      )}


      <div className="container-x grid h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 md:h-20 md:gap-3 lg:flex">
        <Link to="/" className="flex min-w-0 items-center gap-2 lg:shrink-0">
          {settings.logo_url && (
            <img src={settings.logo_url} alt={settings.store_name} className="h-9 w-auto md:h-11" />
          )}
          <span
            className={cn(
              "truncate text-lg font-semibold md:text-xl",
              !settings.header_text_color && "text-primary",
            )}
            style={settings.header_text_color ? { color: settings.header_text_color } : undefined}
          >
            {settings.store_name}
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <SmartLink
              key={item.url + item.label}
              to={item.url}
              className="rounded-md px-3 py-2 text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary"
              activeClassName="text-primary"
            >
              {item.label}
            </SmartLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          {settings.header_show_search !== false && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="খুঁজুন"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
            </Button>
          )}
          {settings.header_show_wishlist !== false && (
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex" aria-label="উইশলিস্ট" asChild>
              <Link to="/wishlist" className="relative">
                <Heart className="size-5" />
                {wishlist.count > 0 && <Badge>{wishlist.count}</Badge>}
              </Link>
            </Button>
          )}
          <CartDrawer />
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 transition-all duration-300",
          searchOpen ? "max-h-56" : "max-h-0",
        )}
      >
        <div className="container-x py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch(term);
            }}
            className="flex gap-2"
          >
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="পণ্যের নাম বা কোড লিখুন..."
              className="h-11"
              autoFocus={searchOpen}
            />
            <Button type="submit" className="h-11 px-6">
              খুঁজুন
            </Button>
          </form>
          {recent.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">সাম্প্রতিক:</span>
              {recent.map((r) => (
                <button
                  key={r}
                  onClick={() => submitSearch(r)}
                  className="rounded-full border border-border px-3 py-1 text-xs transition-colors hover:border-primary hover:text-primary"
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid size-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
      {children}
    </span>
  );
}
