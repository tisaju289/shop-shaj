import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/storefront/LoadingSkeleton";
import { QuantitySelector } from "@/components/storefront/QuantitySelector";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { fallbackImage } from "@/lib/media";
import { useSettings } from "@/lib/store-context";
import { reportFacebookPurchase } from "@/lib/tracking.functions";
import { canTrackVisitor, trackPurchase } from "@/lib/tracking";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "চেকআউট — অর্ডার সম্পন্ন করুন" },
      { name: "description", content: "নাম, মোবাইল ও ঠিকানা দিয়ে ক্যাশ অন ডেলিভারিতে অর্ডার করুন।" },
      { property: "og:title", content: "চেকআউট" },
      { property: "og:description", content: "ক্যাশ অন ডেলিভারিতে সহজে অর্ডার করুন।" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const settings = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [zone, setZone] = useState("inside_dhaka");
  const [submitting, setSubmitting] = useState(false);

  const deliveryCharge = useMemo(() => {
    if (
      settings.free_delivery_threshold > 0 &&
      cart.subtotal >= settings.free_delivery_threshold
    )
      return 0;
    return zone === "inside_dhaka"
      ? settings.delivery_charge_inside
      : settings.delivery_charge_outside;
  }, [zone, cart.subtotal, settings]);

  const total = cart.subtotal + deliveryCharge;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.items.length) return;
    if (!/^01\d{9}$/.test(form.phone.replace(/\s|-/g, ""))) {
      toast.error("সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন");
      return;
    }
    if (settings.min_order_amount > 0 && cart.subtotal < settings.min_order_amount) {
      toast.error(`সর্বনিম্ন অর্ডার মূল্য ${settings.min_order_amount} টাকা`);
      return;
    }

    setSubmitting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: session.session?.user.id ?? null,
          customer_name: form.name,
          customer_phone: form.phone,
          address: form.address,
          delivery_zone: zone,
          subtotal: cart.subtotal,
          delivery_charge: deliveryCharge,
          discount: 0,
          total,
          payment_method: "cod",
        })
        .select("id,order_number")
        .single();
      if (error) throw error;

      const { error: itemsError } = await supabase.from("order_items").insert(
        cart.items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          variant_id: item.variantId,
          product_name: item.name,
          product_image: item.image,
          size: item.size,
          color: item.color,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          total: item.unitPrice * item.quantity,
        })),
      );
      if (itemsError) throw itemsError;

      const eventId = `purchase_${order.id}`;
      if (await canTrackVisitor()) {
        await Promise.allSettled([
          trackPurchase({ eventId, value: total, orderNumber: order.order_number }),
          reportFacebookPurchase({ data: { orderId: order.id, eventId, sourceUrl: window.location.href } }),
        ]);
      }
      cart.clear();
      navigate({ to: "/order-success", search: { order: order.order_number } });
    } catch {
      toast.error("অর্ডার জমা দেওয়া যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cart.items.length) {
    return (
      <StoreLayout>
        <div className="container-x py-20">
          <EmptyState
            title="কার্ট খালি"
            description="অর্ডার করার আগে পণ্য যোগ করুন।"
            action={
              <Button asChild>
                <Link to="/shop">শপে যান</Link>
              </Button>
            }
          />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader eyebrow="অর্ডার" title="চেকআউট" />
      <form onSubmit={placeOrder} className="container-x py-8 md:py-10">
        <div className="mx-auto max-w-2xl space-y-6 rounded-lg border border-border bg-card p-4 md:p-6">
          <section>
            <h2 className="text-base font-semibold">আপনার পণ্য</h2>
            <ul className="mt-3 divide-y divide-border">
              {cart.items.map((item) => (
                <li key={item.key} className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 py-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto]">
                  <img
                    src={item.image || fallbackImage(item.name)}
                    alt={item.name}
                    className="size-16 shrink-0 rounded-md object-cover sm:size-20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <QuantitySelector
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) => cart.setQuantity(item.key, q)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="সরান"
                        onClick={() => cart.remove(item.key)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="col-start-2 text-sm font-semibold sm:col-start-auto sm:text-right">
                    {formatMoney(item.unitPrice * item.quantity, settings.currency)}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4 border-t border-border pt-5">
            <h2 className="text-base font-semibold">আপনার তথ্য</h2>
            <Field label="নাম" required>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="আপনার পূর্ণ নাম"
              />
            </Field>
            <Field label="মোবাইল নম্বর" required>
              <Input
                required
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="বিস্তারিত ঠিকানা" required>
              <Textarea
                required
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="বাসা/রোড/এলাকা, থানা, জেলা"
              />
            </Field>
          </section>

          <section className="space-y-3 border-t border-border pt-5">
            <h2 className="text-base font-semibold">ডেলিভারি এলাকা</h2>
            <RadioGroup value={zone} onValueChange={setZone} className="gap-3">
              <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
                <RadioGroupItem value="inside_dhaka" />
                ঢাকার ভিতরে — {formatMoney(settings.delivery_charge_inside, settings.currency)}
              </label>
              <label className="flex items-center gap-3 rounded-md border border-border p-3 text-sm">
                <RadioGroupItem value="outside_dhaka" />
                ঢাকার বাইরে — {formatMoney(settings.delivery_charge_outside, settings.currency)}
              </label>
            </RadioGroup>
          </section>

          <dl className="space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">পণ্যের মূল্য</dt>
              <dd>{formatMoney(cart.subtotal, settings.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
              <dd>
                {deliveryCharge === 0 ? "ফ্রি" : formatMoney(deliveryCharge, settings.currency)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>সর্বমোট</dt>
              <dd>{formatMoney(total, settings.currency)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "অর্ডার জমা হচ্ছে..." : "অর্ডার করুন"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">ক্যাশ অন ডেলিভারি</p>
        </div>
      </form>
    </StoreLayout>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
