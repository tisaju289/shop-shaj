import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { HeroSlide } from "@/lib/types";
import { cn } from "@/lib/utils";

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative w-full overflow-hidden border-b border-border bg-surface">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "grid h-[calc(100vh-4rem)] min-h-[520px] grid-rows-[1fr] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-rows-1 md:grid-cols-2",
            i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          {/* Content side */}
          <div className="relative order-2 flex min-h-[320px] items-center bg-gradient-to-br from-surface via-surface to-accent px-6 py-10 md:order-1 md:min-h-0 md:px-12 lg:px-16">
            <div className="mx-auto w-full max-w-xl">
              {i === index && (
                <div className="animate-fade-up">
                  {slide.subtitle && (
                    <p className="eyebrow">{slide.subtitle}</p>
                  )}
                  <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground md:text-5xl lg:text-6xl">
                    {slide.heading}
                  </h1>
                  {slide.description && (
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-lg">
                      {slide.description}
                    </p>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    {slide.cta_text && (
                      <Button asChild size="lg">
                        <a href={slide.cta_url || "/shop"}>{slide.cta_text}</a>
                      </Button>
                    )}
                    {slide.secondary_cta_text && (
                      <Button asChild size="lg" variant="outline">
                        <a href={slide.secondary_cta_url || "/shop"}>
                          {slide.secondary_cta_text}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Image side */}
          <div className="relative order-1 h-full min-h-[260px] overflow-hidden bg-accent md:order-2 md:min-h-0">
            {slide.image_url ? (
              <picture>
                {slide.mobile_image_url && (
                  <source media="(max-width: 767px)" srcSet={slide.mobile_image_url} />
                )}
                <img
                  src={slide.image_url}
                  alt={slide.heading}
                  className="size-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </picture>
            ) : (
              <div className="grid size-full place-items-center bg-gradient-to-br from-surface via-accent to-surface">
                <span className="text-sm text-muted-foreground">ছবি যোগ করুন</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`স্লাইড ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                i === index ? "w-8 bg-primary" : "w-3 bg-foreground/25",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function HeroFallback() {
  return (
    <section className="grid border-b border-border bg-surface md:grid-cols-2">
      <div className="aspect-[4/5] bg-gradient-to-br from-accent to-surface md:aspect-auto md:min-h-[480px]" />
      <div className="flex min-h-[320px] items-center px-6 py-12 md:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <p className="eyebrow">নতুন কালেকশন</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-foreground md:text-5xl">
            অ্যাডমিন প্যানেল থেকে হিরো স্লাইড যোগ করুন
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            ছবি, হেডিং ও বাটন সবকিছু অ্যাডমিন থেকে নিয়ন্ত্রণ করা যায়।
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link to="/shop">এখনই শপ করুন</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
