import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart, Minus, Package, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/storefront/LoadingSkeleton";
import { PriceDisplay } from "@/components/storefront/PriceDisplay";
import { ProductCarousel } from "@/components/storefront/ProductCarousel";
import { QuantitySelector } from "@/components/storefront/QuantitySelector";
import { RatingStars } from "@/components/storefront/RatingStars";
import { SectionHeading, StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/lib/cart";
import { effectivePrice, formatDate } from "@/lib/format";
import { fallbackImage } from "@/lib/media";
import {
  productQuery,
  productReviewsQuery,
  productsByIdsQuery,
  relatedProductsQuery,
} from "@/lib/queries";
import { pushRecentlyViewed, readRecentlyViewed } from "@/lib/recently-viewed";
import { useSettings } from "@/lib/store-context";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — পণ্যের বিবরণ` },
      {
        name: "description",
        content: "দাম, সাইজ, রঙ, ডেলিভারি তথ্য ও রিভিউ সহ পণ্যের সম্পূর্ণ বিবরণ দেখুন।",
      },
      { property: "og:title", content: `${params.slug} — পণ্যের বিবরণ` },
      { property: "og:description", content: "পণ্যের সম্পূর্ণ বিবরণ ও দাম দেখুন।" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const settings = useSettings();
  const cart = useCart();
  const wishlist = useWishlist();

  const { data: product, isLoading } = useQuery(productQuery(slug));
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes?.[0] ?? null);
    setColor(product.colors?.[0] ?? null);
    setQuantity(1);
    setActiveImage(0);
    setRecentIds(readRecentlyViewed().filter((id) => id !== product.id));
    pushRecentlyViewed(product.id);
  }, [product]);

  const { data: related = [] } = useQuery({
    ...relatedProductsQuery(product?.category_id ?? null, product?.id ?? ""),
    enabled: !!product,
  });
  const { data: reviews = [] } = useQuery({
    ...productReviewsQuery(product?.id ?? ""),
    enabled: !!product,
  });
  const { data: recentProducts = [] } = useQuery({
    ...productsByIdsQuery(recentIds),
    enabled: recentIds.length > 0,
  });

  const variant = useMemo(() => {
    if (!product?.product_variants?.length) return null;
    return (
      product.product_variants.find(
        (v) => (!v.size || v.size === size) && (!v.color || v.color === color),
      ) ?? null
    );
  }, [product, size, color]);

  const images = useMemo(() => {
    if (!product) return [] as string[];
    const list = [
      ...(variant?.image_url ? [variant.image_url] : []),
      ...(product.thumbnail_url ? [product.thumbnail_url] : []),
      ...(product.product_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => i.image_url),
    ];
    return list.length ? Array.from(new Set(list)) : [fallbackImage(product.name)];
  }, [product, variant]);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container-x grid gap-10 py-10 md:grid-cols-2">
          <Skeleton className="aspect-[3/4] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="container-x py-20">
          <EmptyState
            title="পণ্যটি পাওয়া যায়নি"
            description="পণ্যটি সরিয়ে ফেলা হয়েছে অথবা ঠিকানা ভুল।"
            action={
              <Button asChild>
                <Link to="/shop">শপে ফিরে যান</Link>
              </Button>
            }
          />
        </div>
      </StoreLayout>
    );
  }

  const stock = variant ? variant.stock : product.stock;
  const price = variant?.price ?? product.price;
  const unitPrice = effectivePrice(price, variant?.price ? null : product.sale_price);
  const outOfStock = stock <= 0;

  function addToCart() {
    if (outOfStock) {
      toast.error("এই পণ্যটি বর্তমানে স্টকে নেই");
      return;
    }
    cart.add({
      productId: product!.id,
      variantId: variant?.id ?? null,
      slug: product!.slug,
      name: product!.name,
      image: images[0] ?? null,
      size,
      color,
      unitPrice,
      quantity,
      maxStock: stock,
    });
    toast.success("কার্টে যোগ করা হয়েছে");
  }

  return (
    <StoreLayout>
      <div className="container-x content-start py-6 md:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            হোম
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">
            শপ
          </Link>
          {product.categories && (
            <>
              <span>/</span>
              <Link
                to="/category/$slug"
                params={{ slug: product.categories.slug }}
                className="hover:text-primary"
              >
                {product.categories.name}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <div className="overflow-hidden rounded-lg bg-surface">
              <img
                src={images[activeImage] ?? images[0]}
                alt={product.name}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={img}
                    onClick={() => setActiveImage(i)}
                    className={cn(
                      "size-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                      i === activeImage ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img src={img} alt="" className="size-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold leading-snug md:text-3xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <RatingStars rating={product.rating} reviewCount={product.review_count} />
              {product.sku && (
                <span className="text-xs text-muted-foreground">কোড: {product.sku}</span>
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  outOfStock ? "text-destructive" : "text-success",
                )}
              >
                {outOfStock ? "স্টক শেষ" : `স্টকে আছে (${stock} টি)`}
              </span>
            </div>

            <PriceDisplay
              price={price}
              salePrice={variant?.price ? null : product.sale_price}
              size="lg"
              className="mt-5"
            />

            {product.short_description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {product.short_description}
              </p>
            )}

            {product.sizes?.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2 text-sm font-medium">সাইজ নির্বাচন করুন</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(
                        "min-w-12 rounded-md border px-3 py-2 text-sm transition-colors",
                        size === s
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-medium">রঙ নির্বাচন করুন</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-sm transition-colors",
                        color === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <QuantitySelector value={quantity} max={stock} onChange={setQuantity} />
              <Button onClick={addToCart} disabled={outOfStock} size="lg" className="min-w-0 px-3 sm:flex-1 md:flex-none md:px-6">
                কার্টে যোগ করুন
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                disabled={outOfStock}
                className="col-span-3 w-full sm:col-span-1 sm:flex-1 md:w-auto md:flex-none"
              >
                <Link to="/checkout" onClick={addToCart}>
                  এখনই কিনুন
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="উইশলিস্ট"
                onClick={() => wishlist.toggle(product.id)}
              >
                <Heart
                  className={cn("size-4", wishlist.has(product.id) && "fill-primary text-primary")}
                />
              </Button>
            </div>

            <div className="mt-7 grid gap-3 rounded-lg border border-border bg-surface p-4 text-sm">
              <InfoRow icon={<Truck className="size-4" />}>
                ঢাকার ভিতরে ডেলিভারি চার্জ {settings.currency}
                {settings.delivery_charge_inside} · ঢাকার বাইরে {settings.currency}
                {settings.delivery_charge_outside}
              </InfoRow>
              <InfoRow icon={<RefreshCcw className="size-4" />}>
                {settings.return_policy || "ডেলিভারির ৩ দিনের মধ্যে রিটার্ন সুবিধা।"}
              </InfoRow>
              <InfoRow icon={<ShieldCheck className="size-4" />}>
                ক্যাশ অন ডেলিভারিতে পণ্য হাতে পেয়ে টাকা পরিশোধ করুন
              </InfoRow>
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-12">
          <TabsList>
            <TabsTrigger value="description">বিবরণ</TabsTrigger>
            <TabsTrigger value="specs">স্পেসিফিকেশন</TabsTrigger>
            <TabsTrigger value="reviews">রিভিউ ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-5">
            <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description || "এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যোগ করা হবে।"}
            </p>
          </TabsContent>
          <TabsContent value="specs" className="pt-5">
            {product.specifications?.length ? (
              <dl className="max-w-xl divide-y divide-border text-sm">
                {product.specifications.map((spec) => (
                  <div key={spec.label} className="flex justify-between py-2.5">
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">কোনো স্পেসিফিকেশন যোগ করা হয়নি।</p>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="pt-5">
            {reviews.length ? (
              <ul className="max-w-2xl space-y-5">
                {reviews.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.reviewer_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span>
                    </div>
                    <RatingStars rating={r.rating} className="mt-1.5" />
                    {r.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">এখনও কোনো রিভিউ নেই।</p>
            )}
          </TabsContent>
        </Tabs>

        {related.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="সম্পর্কিত পণ্য" />
            <ProductCarousel products={related} />
          </section>
        )}

        {recentProducts.length > 0 && (
          <section className="mt-16">
            <SectionHeading title="সম্প্রতি দেখা পণ্য" />
            <ProductCarousel products={recentProducts} />
          </section>
        )}
      </div>
    </StoreLayout>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-muted-foreground">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
