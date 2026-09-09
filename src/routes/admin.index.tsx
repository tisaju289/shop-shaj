import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

import { AdminHeading } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/store-context";
import { statusLabel } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};

const dashboardQuery = {
  queryKey: ["admin", "dashboard"],
  queryFn: async () => {
    const [orders, products, reviews] = await Promise.all([
      supabase
        .from("orders")
        .select("id,order_number,customer_name,total,status,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id,name,stock,low_stock_threshold,is_published"),
      supabase.from("reviews").select("id").eq("is_approved", false),
    ]);
    if (orders.error) throw orders.error;
    if (products.error) throw products.error;
    return {
      orders: (orders.data ?? []) as OrderRow[],
      products: products.data ?? [],
      pendingReviews: reviews.data?.length ?? 0,
    };
  },
  staleTime: 30_000,
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function DashboardPage() {
  const settings = useSettings();
  const { data, isLoading } = useQuery(dashboardQuery);

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  const orders = data.orders;
  const cancelled = ["cancelled", "returned"];
  const revenue = orders
    .filter((o) => !cancelled.includes(o.status))
    .reduce((sum, o) => sum + Number(o.total), 0);
  const todayOrders = orders.filter((o) => new Date(o.created_at).getTime() >= startOfToday());
  const pendingOrders = orders.filter((o) => ["new", "confirmed", "processing"].includes(o.status));
  const lowStock = data.products.filter(
    (p) => Number(p.stock) <= Number(p.low_stock_threshold ?? 5),
  );

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    const next = d.getTime() + 86_400_000;
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.created_at).getTime();
      return t >= d.getTime() && t < next;
    });
    return {
      label: d.toLocaleDateString("bn-BD", { day: "numeric", month: "short" }),
      count: dayOrders.length,
      total: dayOrders.reduce((s, o) => s + Number(o.total), 0),
    };
  });
  const maxTotal = Math.max(...days.map((d) => d.total), 1);

  return (
    <div>
      <AdminHeading
        title="ড্যাশবোর্ড"
        description="আপনার স্টোরের সর্বশেষ অবস্থা এক নজরে"
        action={
          <Button asChild>
            <Link to="/admin/products/$id" params={{ id: "new" }}>
              নতুন পণ্য যোগ করুন
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<ShoppingCart className="size-5" />}
          label="মোট অর্ডার"
          value={String(orders.length)}
          hint={`আজ ${todayOrders.length} টি`}
        />
        <StatCard
          icon={<TrendingUp className="size-5" />}
          label="মোট বিক্রয়"
          value={formatMoney(revenue, settings.currency)}
          hint={`অপেক্ষমাণ ${pendingOrders.length} অর্ডার`}
        />
        <StatCard
          icon={<Package className="size-5" />}
          label="মোট পণ্য"
          value={String(data.products.length)}
          hint={`স্টক কম ${lowStock.length} টিতে`}
        />
        <StatCard
          icon={<Users className="size-5" />}
          label="অপেক্ষমাণ রিভিউ"
          value={String(data.pendingReviews)}
          hint="অনুমোদনের অপেক্ষায়"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">গত ১৪ দিনের বিক্রয়</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1.5">
              {days.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    title={`${d.label}: ${formatMoney(d.total, settings.currency)}`}
                    className="w-full rounded-t bg-primary/80 transition-all"
                    style={{ height: `${Math.max((d.total / maxTotal) * 100, 3)}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-warning" /> স্টক কমে আসা পণ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length ? (
              lowStock.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="line-clamp-1">{p.name}</span>
                  <Badge variant={Number(p.stock) <= 0 ? "destructive" : "secondary"}>
                    {p.stock} টি
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">সব পণ্যের স্টক পর্যাপ্ত আছে।</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">সর্বশেষ অর্ডার</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/orders">সব দেখুন</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {orders.slice(0, 8).map((o) => (
            <Link
              key={o.id}
              to="/admin/orders/$id"
              params={{ id: o.id }}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 text-sm transition-colors hover:border-primary"
            >
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">
                  {o.customer_name} · {formatDateTime(o.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{statusLabel(o.status)}</Badge>
                <span className="font-medium">{formatMoney(Number(o.total), settings.currency)}</span>
              </div>
            </Link>
          ))}
          {!orders.length && <p className="text-sm text-muted-foreground">এখনও কোনো অর্ডার নেই।</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          {icon}
        </span>
      </CardContent>
    </Card>
  );
}
