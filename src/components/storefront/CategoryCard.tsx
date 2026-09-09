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
  return (
    <div className="hide-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:px-0 lg:grid-cols-4">
      {categories.map((c) => (
        <CategoryCard key={c.id} category={c} className="w-[42vw] shrink-0 sm:w-[30vw] md:w-auto" />
      ))}
    </div>
  );
}
