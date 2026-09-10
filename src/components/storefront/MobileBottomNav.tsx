import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Grid2X2, Home, Search, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";

import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "ক্যাটাগরি", to: "/categories", icon: Grid2X2 },
  { label: "শপ", to: "/shop", icon: Store },
  { label: "হোম", to: "/", icon: Home },
] as const;

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const cart = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setTerm("");
    navigate({ to: "/search", search: { q } });
  }

  return (
    <nav
      aria-label="মোবাইল নেভিগেশন"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_oklch(0.25_0.05_15/0.08)] backdrop-blur lg:hidden"
    >
      <div className="grid h-[4.5rem] grid-cols-5">
        {navItems.slice(0, 2).map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Button key={item.to} asChild variant="ghost" className={itemClass(active)}>
              <Link to={item.to}>
                <Icon className="size-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}

        <Button asChild variant="ghost" className={itemClass(pathname === "/")}>
          <Link to="/">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-card">
              <Home className="size-5" />
            </span>
            <span>হোম</span>
          </Link>
        </Button>

        <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className={itemClass(pathname === "/search")}>
              <Search className="size-5 shrink-0" />
              <span>সার্চ</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <SheetTitle className="text-left">পণ্য খুঁজুন</SheetTitle>
            <form onSubmit={submitSearch} className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
              <Input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="পণ্যের নাম বা কোড"
                autoFocus={searchOpen}
              />
              <Button type="submit" aria-label="খুঁজুন">
                <Search className="size-4" />
              </Button>
            </form>
          </SheetContent>
        </Sheet>

        <CartDrawer
          trigger={
            <Button variant="ghost" className={itemClass(false)}>
              <span className="relative">
                <ShoppingBag className="size-5" />
                {cart.count > 0 && (
                  <span className="absolute -right-2 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                    {cart.count}
                  </span>
                )}
              </span>
              <span>কার্ট</span>
            </Button>
          }
        />
      </div>
    </nav>
  );
}

function itemClass(active: boolean) {
  return cn(
    "h-full min-w-0 flex-col gap-1 rounded-none px-1 text-[11px] font-medium text-muted-foreground",
    active && "text-primary",
  );
}