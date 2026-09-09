import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/storefront/LoadingSkeleton";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { useSettings } from "@/lib/store-context";
import { DIVISIONS, PAYMENT_METHODS } from "@/lib/types";

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

  const [form, setForm] = useState({
    name: "",
    phone: "",
    phoneAlt: "",
    address: "",
    division: "ঢাকা",
    district: "",
    thana: "",
    note: "",
  });
  const [zone, setZone] = useState("inside_dhaka");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
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

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, cart.subtotal - discount) + deliveryCharge;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    const { data, error } = await supabase.rpc("validate_coupon", {
      _code: couponCode.trim(),
      _subtotal: cart.subtotal,
    });
    if (error) {
      toast.error("কুপন যাচাই করা যায়নি");
      return;
    }
    const result = data as { valid: boolean; message: string; code?: string; discount?: number };
    if (!result.valid) {
      setCoupon(null);
      toast.error(result.message);
      return;
    }
    setCoupon({ code: result.code ?? couponCode, discount: Number(result.discount ?? 0) });
    toast.success(result.message);
  }

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
          customer_phone_alt: form.phoneAlt || null,
          address: form.address,
          division: form.division,
          district: form.district,
          thana: form.thana,
          note: form.note || null,
          delivery_zone: zone,
          subtotal: cart.subtotal,
          delivery_charge: deliveryCharge,
          discount,
          coupon_code: coupon?.code ?? null,
          total,
          payment_method: paymentMethod,
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
      <form onSubmit={placeOrder} className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5 rounded-lg border border-border bg-card p-5 md:p-6">
          <h2 className="text-base font-semibold">ডেলিভারি তথ্য</h2>
          <Field label="নাম" required>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="আপনার পূর্ণ নাম"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="মোবাইল নম্বর" required>
              <Input
                required
                inputMode="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
              />
            </Field>
            <Field label="বিকল্প মোবাইল নম্বর">
              <Input
                inputMode="tel"
                value={form.phoneAlt}
                onChange={(e) => setForm({ ...form, phoneAlt: e.target.value })}
                placeholder="ঐচ্ছিক"
              />
            </Field>
          </div>
          <Field label="সম্পূর্ণ ঠিকানা" required>
            <Textarea
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="বাসা/রোড/এলাকা"
              rows={3}
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="বিভাগ">
              <Select
                value={form.division}
                onValueChange={(v) => setForm({ ...form, division: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="জেলা">
              <Input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              />
            </Field>
            <Field label="থানা/উপজেলা">
              <Input
                value={form.thana}
                onChange={(e) => setForm({ ...form, thana: e.target.value })}
              />
            </Field>
          </div>
          <Field label="নোট">
            <Textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন"
              rows={2}
            />
          </Field>

          <div>
            <h3 className="mb-3 text-sm font-semibold">ডেলিভারি এলাকা</h3>
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
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">পেমেন্ট পদ্ধতি</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="gap-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex items-center gap-3 rounded-md border border-border p-3 text-sm ${
                    m.enabled ? "" : "opacity-50"
                  }`}
                >
                  <RadioGroupItem value={m.value} disabled={!m.enabled} />
                  {m.label}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-semibold">আপনার অর্ডার</h2>
          <ul className="space-y-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.key} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span>{formatMoney(item.unitPrice * item.quantity, settings.currency)}</span>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="কুপন কোড"
            />
            <Button type="button" variant="outline" onClick={applyCoupon}>
              প্রয়োগ
            </Button>
          </div>

          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <Row label="সাবটোটাল" value={formatMoney(cart.subtotal, settings.currency)} />
            {discount > 0 && (
              <Row label="ডিসকাউন্ট" value={`- ${formatMoney(discount, settings.currency)}`} />
            )}
            <Row
              label="ডেলিভারি চার্জ"
              value={deliveryCharge === 0 ? "ফ্রি" : formatMoney(deliveryCharge, settings.currency)}
            />
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
              <dt>সর্বমোট</dt>
              <dd>{formatMoney(total, settings.currency)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "অর্ডার জমা হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
          </Button>
        </aside>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
