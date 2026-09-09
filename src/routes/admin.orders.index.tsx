import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AdminHeading } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { formatDateTime, formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/store-context";
import { ORDER_STATUSES, statusLabel, type Order } from "@/lib/types";

export const Route = createFileRoute("/admin/orders/")({
  component: OrdersPage,
});

function ordersQuery(status: string, search: string) {
  return {
    queryKey: ["admin", "orders", status, search],
    queryFn: async (): Promise<Order[]> => {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (status !== "all") query = query.eq("status", status);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        query = query.or(
          `order_number.ilike.${term},customer_name.ilike.${term},customer_phone.ilike.${term}`,
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  };
}

function OrdersPage() {
  const settings = useSettings();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const { data: orders = [], isLoading } = useQuery(ordersQuery(status, search));

  return (
    <div>
      <AdminHeading title="অর্ডার ব্যবস্থাপনা" description="সব অর্ডার দেখুন ও স্ট্যাটাস আপডেট করুন" />

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="অর্ডার নম্বর, নাম বা ফোন দিয়ে খুঁজুন"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>অর্ডার</TableHead>
                <TableHead>ক্রেতা</TableHead>
                <TableHead>মোট</TableHead>
                <TableHead>স্ট্যাটাস</TableHead>
                <TableHead>সময়</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.order_number}</TableCell>
                  <TableCell>
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                  </TableCell>
                  <TableCell>{formatMoney(Number(o.total), settings.currency)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{statusLabel(o.status)}</Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDateTime(o.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/orders/$id" params={{ id: o.id }}>
                        বিস্তারিত
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!orders.length && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
