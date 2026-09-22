import { Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";

import { RatingStars } from "@/components/storefront/RatingStars";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";

export function ReviewsShowcase({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {reviews.map((r) => (
        <article
          key={r.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
        >
          {r.image_url && (
            <div className="aspect-[4/5] w-full overflow-hidden bg-surface">
              <img
                src={r.image_url}
                alt={`${r.reviewer_name} — রিভিউয়ের ছবি`}
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2 p-4">
            <RatingStars rating={r.rating} className="justify-center" />
            {r.comment && (
              <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                <Quote className="mr-1 inline size-3.5 text-primary" />
                {r.comment}
              </p>
            )}
            <div className="mt-auto">
              <p className="text-sm font-medium">{r.reviewer_name}</p>
              {r.products?.slug ? (
                <Link
                  to="/product/$slug"
                  params={{ slug: r.products.slug }}
                  className="text-xs text-primary hover:underline"
                >
                  {r.products.name}
                </Link>
              ) : (
                r.products?.name && (
                  <p className="text-xs text-muted-foreground">{r.products.name}</p>
                )
              )}
              <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
