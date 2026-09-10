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

/**
 * Single-row auto-scrolling marquee. Products are duplicated to form a
 * seamless infinite loop; animation pauses on hover.
 */
export function ProductMarquee({ products }: { products: Product[] }) {
  if (!products.length) return null;
  const loop = [...products, ...products];
  const duration = Math.max(20, products.length * 5);
  return (
    <div
      className="hide-scrollbar relative overflow-hidden"
      role="marquee"
      aria-label="অটো স্ক্রলিং পণ্য"
    >
      <div
        className="marquee-track flex w-max gap-3 md:gap-6"
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {loop.map((p, i) => (
          <ProductCard
            key={`${p.id}-${i}`}
            product={p}
            className="w-40 shrink-0 md:w-64"
          />
        ))}
      </div>
    </div>
  );
}
