import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminHeading } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/store-context";
import { statusLabel } from "@/lib/types";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsPage,
});

const RANGES = [
  { days: 7, label: "৭ দিন" },
  { days: 30, label: "৩০ দিন" },
  { days: 90, label: "৯০ দিন" },
  { days: 365, label: "১ বছর" },
];

function ReportsPage() {
  const settings = useSettings();
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reports", days],
    queryFn: async () => {
      const since = new Date(Date.now() - days * 86_400_000).toISOString();
      const [orders, items, products] = await Promise.all([
        supabase.from("orders").select("id,total,status,created_at").gte("created_at", since),
        supabase.from("order_items").select("product_name,quantity,total,created_at").gte("created_at", since),
        supabase
          .from("products")
          .select("name,sales_count,stock")
          .order("sales_count", { ascending: false })
          .limit(10),
      ]);
      if (orders.error) throw orders.error;
      if (items.error) throw items.error;
      return {
        orders: orders.data ?? [],
        items: items.data ?? [],
        topProducts: products.data ?? [],
      };
    },
  });

  if (isLoading || !data) return <Skeleton className="h-96 w-full rounded-lg" />;

  const valid = data.orders.filter((o) => !["cancelled", "returned"].includes(o.status));
  const revenue = valid.reduce((s, o) => s + Number(o.total), 0);
  const avg = valid.length ? revenue / valid.length : 0;

  const byStatus = data.orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const soldByProduct = data.items.reduce<Record<string, { qty: number; total: number }>>(
    (acc, item) => {
      const key = item.product_name;
      const current = acc[key] ?? { qty: 0, total: 0 };
      acc[key] = {
        qty: current.qty + Number(item.quantity),
        total: current.total + Number(item.total),
      };
      return acc;
    },
    {},
  );
  const bestSellers = Object.entries(soldByProduct)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  return (
    <div>
      <AdminHeading title="বিক্রয় রিপোর্ট" description="নির্দিষ্ট সময়ের বিক্রয় বিশ্লেষণ" />

      <div className="mb-5 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Button
            key={r.days}
            size="sm"
            variant={days === r.days ? "default" : "outline"}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">মোট বিক্রয়</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatMoney(revenue, settings.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">অর্ডার সংখ্যা</p>
            <p className="mt-1 text-2xl font-semibold">{data.orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">গড় অর্ডার মূল্য</p>
            <p className="mt-1 text-2xl font-semibold">{formatMoney(avg, settings.currency)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">স্ট্যাটাস অনুযায়ী অর্ডার</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{statusLabel(status)}</span>
                <span className="font-medium">{count} টি</span>
              </div>
            ))}
            {!Object.keys(byStatus).length && (
              <p className="text-sm text-muted-foreground">এই সময়ে কোনো অর্ডার নেই।</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">সর্বাধিক বিক্রীত পণ্য</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>পণ্য</TableHead>
                  <TableHead>পরিমাণ</TableHead>
                  <TableHead>বিক্রয়</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestSellers.map(([name, stat]) => (
                  <TableRow key={name}>
                    <TableCell className="max-w-48 truncate">{name}</TableCell>
                    <TableCell>{stat.qty}</TableCell>
                    <TableCell>{formatMoney(stat.total, settings.currency)}</TableCell>
                  </TableRow>
                ))}
                {!bestSellers.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      এই সময়ে কোনো বিক্রয় হয়নি।
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">সর্বকালের জনপ্রিয় পণ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.topProducts.map((p) => (
            <div key={p.name} className="flex justify-between text-sm">
              <span className="truncate text-muted-foreground">{p.name}</span>
              <span className="font-medium">{p.sales_count} টি বিক্রি</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
