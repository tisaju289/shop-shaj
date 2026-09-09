import { ProductCard } from "@/components/storefront/ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

/** Horizontal scroll carousel — mobile-first, becomes a grid on large screens. */
export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          className="w-[62vw] shrink-0 snap-start sm:w-[42vw] md:w-auto"
        />
      ))}
    </div>
  );
}
