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
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
