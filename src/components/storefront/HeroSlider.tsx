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
            "grid min-h-[calc(100svh-8rem)] grid-rows-[42svh_auto] transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] md:h-[calc(100vh-5rem)] md:min-h-[520px] md:grid-rows-1 md:grid-cols-2",
            i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          {/* Content side */}
          <div className="relative order-2 flex items-center bg-gradient-to-br from-surface via-surface to-accent px-4 py-7 text-center md:order-1 md:min-h-0 md:px-12 md:py-10 lg:px-16">
            <div className="mx-auto w-full max-w-xl">
              {i === index && (
                <div className="animate-fade-up">
                  {slide.subtitle && (
                    <p className="eyebrow">{slide.subtitle}</p>
                  )}
                  <h1 className="mt-2 text-2xl font-semibold leading-tight text-foreground md:mt-3 md:text-5xl lg:text-6xl">
                    {slide.heading}
                  </h1>
                  {slide.description && (
                    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-lg">
                      {slide.description}
                    </p>
                  )}
                  <div className="mt-5 flex flex-wrap justify-center gap-2 md:mt-8 md:gap-3">
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
          <div className="relative order-1 h-full overflow-hidden bg-accent md:order-2 md:min-h-0">
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
        <div className="absolute left-0 right-0 top-[calc(42svh-1.25rem)] z-10 flex justify-center gap-2 md:bottom-5 md:top-auto">
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
    <section className="grid min-h-[calc(100svh-8rem)] grid-rows-[42svh_auto] border-b border-border bg-surface md:h-[calc(100vh-5rem)] md:min-h-[520px] md:grid-rows-1 md:grid-cols-2">
      <div className="order-2 flex items-center px-4 py-7 text-center md:order-1 md:px-12 md:py-10 lg:px-16">
        <div className="mx-auto w-full max-w-xl">
          <p className="eyebrow">নতুন কালেকশন</p>
          <h1 className="mx-auto mt-2 max-w-2xl text-2xl font-semibold leading-tight text-foreground md:mt-3 md:text-5xl">
            অ্যাডমিন প্যানেল থেকে হিরো স্লাইড যোগ করুন
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            ছবি, হেডিং ও বাটন সবকিছু অ্যাডমিন থেকে নিয়ন্ত্রণ করা যায়।
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link to="/shop">এখনই শপ করুন</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="order-1 h-full bg-gradient-to-br from-accent to-surface md:order-2 md:min-h-0" />
    </section>
  );
}
