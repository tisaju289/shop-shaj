import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  TicketPercent,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/store-context";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "অর্ডার", icon: ShoppingCart },
  { to: "/admin/products", label: "পণ্য", icon: Package },
  { to: "/admin/categories", label: "ক্যাটাগরি", icon: Tags },
  { to: "/admin/appearance", label: "হোমপেজ ও ব্যানার", icon: ImageIcon },
  { to: "/admin/coupons", label: "কুপন", icon: TicketPercent },
  { to: "/admin/reviews", label: "রিভিউ", icon: MessageSquare },
  { to: "/admin/reports", label: "রিপোর্ট", icon: BarChart3 },
  { to: "/admin/settings", label: "সেটিংস", icon: Settings },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? path === item.to : path.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-4 lg:flex lg:flex-col">
        <Link to="/admin" className="mb-6 flex items-center gap-2 px-2">
          <Store className="size-5 text-primary" />
          <span className="truncate text-base font-semibold">{settings.store_name}</span>
        </Link>
        <NavLinks />
        <div className="mt-auto space-y-2 border-t border-border pt-4">
          <p className="truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/">ওয়েবসাইট দেখুন</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full" onClick={() => void signOut()}>
            <LogOut className="size-4" /> সাইন আউট
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="মেনু">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4">
              <div className="mb-6 mt-2 flex items-center gap-2">
                <Store className="size-5 text-primary" />
                <span className="font-semibold">{settings.store_name}</span>
              </div>
              <NavLinks onNavigate={() => setOpen(false)} />
              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/">ওয়েবসাইট দেখুন</Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full" onClick={() => void signOut()}>
                  <LogOut className="size-4" /> সাইন আউট
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold">অ্যাডমিন প্যানেল</span>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
