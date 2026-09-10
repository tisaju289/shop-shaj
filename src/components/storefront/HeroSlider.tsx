import { useEffect, useState } from "react";

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
            "w-full transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
          )}
        >
          <div className="relative w-full overflow-hidden bg-accent">
            {slide.image_url ? (
              <picture>
                {slide.mobile_image_url && (
                  <source media="(max-width: 767px)" srcSet={slide.mobile_image_url} />
                )}
                <img
                  src={slide.image_url}
                  alt={slide.heading}
                  className="block h-auto w-full"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </picture>
            ) : (
              <div className="grid aspect-[4/3] w-full place-items-center bg-accent md:aspect-video">
                <span className="text-sm text-muted-foreground">ছবি যোগ করুন</span>
              </div>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2 md:bottom-5">
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
    <section className="grid aspect-[4/3] w-full place-items-center border-b border-border bg-accent md:aspect-video">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">অ্যাডমিন থেকে হিরো ছবি যোগ করুন</p>
      </div>
    </section>
  );
}
