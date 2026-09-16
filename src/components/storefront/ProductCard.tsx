import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { PriceDisplay } from "@/components/storefront/PriceDisplay";
import { RatingStars } from "@/components/storefront/RatingStars";
import { Button } from "@/components/ui/button";
import { discountPercent } from "@/lib/format";
import { fallbackImage } from "@/lib/media";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/lib/wishlist";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const wishlist = useWishlist();
  const image = product.thumbnail_url || fallbackImage(product.name);
  const outOfStock = product.stock <= 0;
  const discount = discountPercent(product.price, product.sale_price);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card transition-shadow duration-300 hover:shadow-elegant",
        className,
      )}
    >
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="relative block overflow-hidden bg-surface"
      >
        <img
          src={image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground shadow-md md:left-3 md:top-3">
            {discount}% ছাড়
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-foreground/80 py-1.5 text-center text-xs font-medium text-background">
            স্টক শেষ
          </span>
        )}
      </Link>

      <button
        type="button"
        aria-label="উইশলিস্টে যোগ করুন"
        onClick={() => {
          wishlist.toggle(product.id);
          toast.success(
            wishlist.has(product.id) ? "উইশলিস্ট থেকে সরানো হয়েছে" : "উইশলিস্টে যোগ হয়েছে",
          );
        }}
        className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-card/90 text-foreground shadow-card backdrop-blur transition-colors hover:text-primary md:right-2.5 md:top-2.5 md:size-9"
      >
        <Heart className={cn("size-4", wishlist.has(product.id) && "fill-primary text-primary")} />
      </button>

      <div className="flex flex-1 flex-col items-center gap-1.5 p-2.5 text-center md:items-start md:gap-2 md:p-4 md:text-left">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="min-h-10">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug transition-colors group-hover:text-primary md:text-[15px]">
            {product.name}
          </h3>
        </Link>
        <div className="hidden sm:block">
          <RatingStars rating={product.rating} reviewCount={product.review_count} />
        </div>
        <PriceDisplay
          price={product.price}
          salePrice={product.sale_price}
          showDiscount={false}
        />
        <div className="mt-auto pt-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/product/$slug" params={{ slug: product.slug }}>
              বিস্তারিত দেখুন
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
