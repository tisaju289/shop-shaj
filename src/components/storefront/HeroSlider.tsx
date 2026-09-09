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
    <section className="relative h-[68vh] min-h-[420px] w-full overflow-hidden bg-surface md:h-[78vh]">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
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
            <div className="size-full bg-gradient-to-br from-surface via-accent to-surface" />
          )}
          <div
            className="absolute inset-0 bg-foreground"
            style={{ opacity: slide.image_url ? slide.overlay_opacity : 0.04 }}
          />

          <div className="absolute inset-0">
            <div className="container-x flex h-full max-w-3xl flex-col justify-center">
              {i === index && (
                <div className="animate-fade-up">
                  {slide.subtitle && (
                    <p
                      className={cn(
                        "eyebrow",
                        slide.image_url && "text-background/80",
                      )}
                    >
                      {slide.subtitle}
                    </p>
                  )}
                  <h1
                    className={cn(
                      "mt-3 text-3xl font-semibold leading-tight md:text-6xl",
                      slide.image_url ? "text-background" : "text-foreground",
                    )}
                  >
                    {slide.heading}
                  </h1>
                  {slide.description && (
                    <p
                      className={cn(
                        "mt-4 max-w-xl text-sm leading-relaxed md:text-lg",
                        slide.image_url ? "text-background/85" : "text-muted-foreground",
                      )}
                    >
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
                      <Button
                        asChild
                        size="lg"
                        variant={slide.image_url ? "secondary" : "outline"}
                      >
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
        </div>
      ))}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
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
    <section className="border-b border-border bg-surface">
      <div className="container-x flex min-h-[420px] flex-col justify-center py-20">
        <p className="eyebrow">নতুন কালেকশন</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
          অ্যাডমিন প্যানেল থেকে হিরো স্লাইড যোগ করুন
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          ছবি, হেডিং ও বাটন সবকিছু অ্যাডমিন থেকে নিয়ন্ত্রণ করা যায়।
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/shop">এখনই শপ করুন</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
