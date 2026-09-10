import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { CartDrawer } from "@/components/storefront/CartDrawer";
import { SmartLink } from "@/components/storefront/SmartLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [menuOpen, setMenuOpen] = useState(false);
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
        "z-50 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        settings.header_sticky !== false && "sticky top-0",
      )}
    >
      {settings.header_announcement_enabled !== false && (
        <div className="hidden bg-primary py-2 text-center text-xs text-primary-foreground md:block">
          {settings.header_announcement_text || defaultSettings.header_announcement_text}
          {settings.free_delivery_threshold > 0 && (
            <> · {settings.free_delivery_threshold} টাকার উপরে ফ্রি ডেলিভারি</>
          )}
          {settings.phone && <> · হটলাইন: {settings.phone}</>}
        </div>
      )}


      <div className="container-x flex h-16 items-center gap-3 md:h-20">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="মেনু">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
            <SheetTitle className="border-b border-border px-5 py-4 text-left text-base">
              {settings.store_name}
            </SheetTitle>
            <nav className="flex flex-col p-2">
              {nav.map((item) => (
                <SmartLink
                  key={item.url + item.label}
                  to={item.url}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-3 text-[15px] font-medium transition-colors hover:bg-accent"
                  activeClassName="text-primary"
                >
                  {item.label}
                </SmartLink>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-center gap-2">
          {settings.logo_url && (
            <img src={settings.logo_url} alt={settings.store_name} className="h-9 w-auto md:h-11" />
          )}
          <span className="text-lg font-semibold tracking-tight text-primary md:text-xl">
            {settings.store_name}
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <Button
            variant="ghost"
            size="icon"
            aria-label="খুঁজুন"
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="উইশলিস্ট" asChild>
            <Link to="/wishlist" className="relative">
              <Heart className="size-5" />
              {wishlist.count > 0 && <Badge>{wishlist.count}</Badge>}
            </Link>
          </Button>
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
