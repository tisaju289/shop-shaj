import { Link } from "@tanstack/react-router";

import { fallbackImage } from "@/lib/media";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryCard({ category, className }: { category: Category; className?: string }) {
  return (
    <Link
      to="/category/$slug"
      params={{ slug: category.slug }}
      className={cn(
        "group relative block overflow-hidden rounded-lg bg-surface",
        className,
      )}
    >
      <img
        src={category.image_url || fallbackImage(category.name)}
        alt={category.name}
        loading="lazy"
        className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-sm font-semibold text-background md:text-base">{category.name}</h3>
        {category.description && (
          <p className="mt-1 line-clamp-1 text-xs text-background/80">{category.description}</p>
        )}
      </div>
    </Link>
  );
}

export function CategoryScroller({ categories }: { categories: Category[] }) {
  const visible = categories.slice(0, 8);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {visible.map((c, i) => (
        <CategoryCard key={c.id} category={c} className={i >= 4 ? "hidden md:block" : undefined} />
      ))}
    </div>
  );
}
