import { Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";

import { QuantitySelector } from "@/components/storefront/QuantitySelector";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { fallbackImage } from "@/lib/media";
import { useSettings } from "@/lib/store-context";

export function CartDrawer({ trigger }: { trigger?: ReactNode }) {
  const cart = useCart();
  const settings = useSettings();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label="কার্ট" className="relative">
            <ShoppingBag className="size-5" />
            {cart.count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4.5 min-w-4.5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {cart.count}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[92vw] max-w-md flex-col pb-[env(safe-area-inset-bottom)] p-0">
        <SheetTitle className="border-b border-border px-5 py-4 text-left text-base">
          আপনার কার্ট {cart.count > 0 && <>({cart.count})</>}
        </SheetTitle>

        {!cart.items.length ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">আপনার কার্ট এখনো খালি।</p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link to="/shop">শপিং শুরু করুন</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto">
              {cart.items.map((item) => (
                <li key={item.key} className="flex gap-3 p-4">
                  <img
                    src={item.image || fallbackImage(item.name)}
                    alt={item.name}
                    className="size-20 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 text-sm font-medium hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    {(item.size || item.color) && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm font-semibold">
                      {formatMoney(item.unitPrice * item.quantity, settings.currency)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
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
                </li>
              ))}
            </ul>

            <div className="space-y-3 border-t border-border p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">সাবটোটাল</span>
                <span className="font-semibold">
                  {formatMoney(cart.subtotal, settings.currency)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                ডেলিভারি চার্জ চেকআউটে যোগ হবে।
              </p>
              <Button asChild size="lg" className="w-full" onClick={() => setOpen(false)}>
                <Link to="/checkout">চেকআউট করুন</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
