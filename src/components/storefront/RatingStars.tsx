import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= Math.round(rating)
              ? "fill-secondary text-secondary"
              : "text-muted-foreground/40",
          )}
        />
      ))}
      {reviewCount != null && (
        <span className="ml-1 text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
