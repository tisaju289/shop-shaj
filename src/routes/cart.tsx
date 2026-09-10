import { Link, createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { EmptyState } from "@/components/storefront/LoadingSkeleton";
import { QuantitySelector } from "@/components/storefront/QuantitySelector";
import { StoreLayout, PageHeader } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { fallbackImage } from "@/lib/media";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "কার্ট — আপনার নির্বাচিত পণ্য" },
      { name: "description", content: "কার্টে থাকা পণ্য দেখুন, পরিমাণ পরিবর্তন করুন ও অর্ডার সম্পন্ন করুন।" },
      { property: "og:title", content: "কার্ট" },
      { property: "og:description", content: "আপনার নির্বাচিত পণ্যগুলো দেখুন।" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const settings = useSettings();

  return (
    <StoreLayout>
      <PageHeader eyebrow="শপিং" title="আপনার কার্ট" />
      <div className="container-x py-10">
        {!cart.items.length ? (
          <EmptyState
            title="আপনার কার্ট খালি"
            description="পছন্দের পোশাক কার্টে যোগ করে অর্ডার সম্পন্ন করুন।"
            action={
              <Button asChild>
                <Link to="/shop">শপিং শুরু করুন</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {cart.items.map((item) => (
                <li key={item.key} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-4 sm:p-4">
                  <img
                    src={item.image || fallbackImage(item.name)}
                    alt={item.name}
                    className="size-18 shrink-0 rounded-md object-cover sm:size-24"
                  />
                  <div className="flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.size, item.color].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {formatMoney(item.unitPrice, settings.currency)}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <QuantitySelector
                        value={item.quantity}
                        max={item.maxStock}
                        onChange={(q) => cart.setQuantity(item.key, q)}
                      />
                      <Button
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

            <aside className="h-fit rounded-lg border border-border bg-card p-5">
              <h2 className="text-base font-semibold">অর্ডার সারসংক্ষেপ</h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">সাবটোটাল</dt>
                  <dd>{formatMoney(cart.subtotal, settings.currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ডেলিভারি চার্জ</dt>
                  <dd className="text-muted-foreground">চেকআউটে নির্ধারিত হবে</dd>
                </div>
              </dl>
              <Button asChild size="lg" className="mt-5 w-full">
                <Link to="/checkout">চেকআউট করুন</Link>
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link to="/shop">আরও শপিং করুন</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
