import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AdminHeading } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime, formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/store-context";
import { ORDER_STATUSES, PAYMENT_STATUSES, type Order } from "@/lib/types";

export const Route = createFileRoute("/admin/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const settings = useSettings();
  const qc = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: async (): Promise<Order | null> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Order) ?? null;
    },
  });

  const [status, setStatus] = useState("new");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (!order) return;
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setAdminNote(order.admin_note ?? "");
  }, [order]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("orders")
        .update({ status, payment_status: paymentStatus, admin_note: adminNote || null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("অর্ডার আপডেট হয়েছে");
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: () => toast.error("আপডেট করা যায়নি"),
  });

  if (isLoading) return <Skeleton className="h-96 w-full rounded-lg" />;
  if (!order)
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">অর্ডারটি পাওয়া যায়নি।</p>
        <Button asChild variant="outline">
          <Link to="/admin/orders">অর্ডার তালিকায় ফিরুন</Link>
        </Button>
      </div>
    );

  return (
    <div>
      <AdminHeading
        title={`অর্ডার ${order.order_number}`}
        description={formatDateTime(order.created_at)}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/orders">
                <ArrowLeft className="size-4" /> ফিরে যান
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> ইনভয়েস প্রিন্ট
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">পণ্যের তালিকা</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(order.order_items ?? []).map((item) => (
              <div key={item.id} className="flex items-center gap-3 border-b border-border pb-3">
                {item.product_image && (
                  <img
                    src={item.product_image}
                    alt=""
                    className="size-14 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[item.size, item.color].filter(Boolean).join(" · ")}
                    {item.size || item.color ? " · " : ""}
                    {item.quantity} × {formatMoney(Number(item.unit_price), settings.currency)}
                  </p>
                </div>
                <span className="text-sm font-medium">
                  {formatMoney(Number(item.total), settings.currency)}
                </span>
              </div>
            ))}

            <dl className="space-y-1.5 pt-2 text-sm">
              <Row label="সাবটোটাল" value={formatMoney(Number(order.subtotal), settings.currency)} />
              <Row
                label="ডেলিভারি চার্জ"
                value={formatMoney(Number(order.delivery_charge), settings.currency)}
              />
              {Number(order.discount) > 0 && (
                <Row
                  label={`ডিসকাউন্ট ${order.coupon_code ? `(${order.coupon_code})` : ""}`}
                  value={`- ${formatMoney(Number(order.discount), settings.currency)}`}
                />
              )}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>সর্বমোট</span>
                <span>{formatMoney(Number(order.total), settings.currency)}</span>
              </div>
            </dl>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">ক্রেতার তথ্য</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_phone}</p>
              {order.customer_phone_alt && (
                <p className="text-muted-foreground">{order.customer_phone_alt}</p>
              )}
              {order.customer_email && (
                <p className="text-muted-foreground">{order.customer_email}</p>
              )}
              <p className="text-muted-foreground">{order.address}</p>
              <p className="text-muted-foreground">
                {[order.thana, order.district, order.division].filter(Boolean).join(", ")}
              </p>
              {order.note && (
                <p className="rounded-md bg-surface p-2 text-xs">ক্রেতার নোট: {order.note}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">অর্ডার আপডেট</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>অর্ডার স্ট্যাটাস</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>পেমেন্ট স্ট্যাটাস</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>অ্যাডমিন নোট</Label>
                <Textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  placeholder="অভ্যন্তরীণ নোট"
                />
              </div>
              <Button
                className="w-full"
                disabled={save.isPending}
                onClick={() => save.mutate()}
              >
                সংরক্ষণ করুন
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
