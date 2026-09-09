import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { PromoBanner as Banner } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PromoBannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={cn(
            "transition-opacity duration-700",
            i === index ? "block opacity-100" : "hidden opacity-0",
          )}
        >
          <div className="relative min-h-44 md:min-h-60">
            {banner.image_url ? (
              <picture>
                {banner.mobile_image_url && (
                  <source media="(max-width: 767px)" srcSet={banner.mobile_image_url} />
                )}
                <img
                  src={banner.image_url}
                  alt={banner.title ?? "অফার"}
                  loading="lazy"
                  className="h-44 w-full object-cover md:h-60"
                />
              </picture>
            ) : (
              <div className="h-44 w-full bg-primary md:h-60" />
            )}
            <div
              className={cn(
                "absolute inset-0 flex flex-col justify-center gap-3 p-6 md:p-12",
                banner.image_url && "bg-foreground/35",
              )}
            >
              {banner.title && (
                <h3 className="max-w-lg text-xl font-semibold text-background md:text-3xl">
                  {banner.title}
                </h3>
              )}
              {banner.subtitle && (
                <p className="max-w-lg text-sm text-background/85 md:text-base">
                  {banner.subtitle}
                </p>
              )}
              {banner.cta_text && (
                <div>
                  <Button asChild variant="secondary" size="sm">
                    <a href={banner.cta_url || "/shop"}>{banner.cta_text}</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {banners.map((b, i) => (
            <button
              key={b.id}
              aria-label={`ব্যানার ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "size-2 rounded-full transition-colors",
                i === index ? "bg-background" : "bg-background/40",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
