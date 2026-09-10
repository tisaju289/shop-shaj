import { useQueries, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Mail, ShieldCheck, Truck, Undo2 } from "lucide-react";

import { CategoryScroller } from "@/components/storefront/CategoryCard";
import { HeroFallback, HeroSlider } from "@/components/storefront/HeroSlider";
import { EmptyState, ProductGridSkeleton } from "@/components/storefront/LoadingSkeleton";
import { ProductCarousel, ProductMarquee } from "@/components/storefront/ProductCarousel";
import { PromoBannerCarousel } from "@/components/storefront/PromoBanner";
import { SectionHeading, StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import {
  categoriesQuery,
  flaggedProductsQuery,
  heroSlidesQuery,
  homepageSectionsQuery,
  promoBannersQuery,
  type ProductFlag,
} from "@/lib/queries";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "প্রিমিয়াম বাংলাদেশি ফ্যাশন — অনলাইন কালেকশন" },
      {
        name: "description",
        content:
          "শাড়ি, থ্রি-পিস, কুর্তি ও কামিজের অভিজাত কালেকশন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা।",
      },
      { property: "og:title", content: "প্রিমিয়াম বাংলাদেশি ফ্যাশন — অনলাইন কালেকশন" },
      {
        property: "og:description",
        content: "শাড়ি, থ্রি-পিস, কুর্তি ও কামিজের অভিজাত কালেকশন। ক্যাশ অন ডেলিভারি।",
      },
    ],
  }),
  component: HomePage,
});

const VALID_FLAGS: ProductFlag[] = ["best_selling", "trending", "hot", "featured", "new"];

function sectionFlag(section: { section_key: string; config?: Record<string, unknown> | null }) {
  const fromConfig = section.config?.["flag"];
  if (typeof fromConfig === "string" && VALID_FLAGS.includes(fromConfig as ProductFlag))
    return fromConfig as ProductFlag;
  return VALID_FLAGS.find((f) => section.section_key === f || section.section_key.startsWith(`${f}_`));
}

function HomePage() {
  const settings = useSettings();
  const { data: sections = [] } = useQuery(homepageSectionsQuery);
  const { data: slides = [], isLoading: slidesLoading } = useQuery(heroSlidesQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: banners = [] } = useQuery(promoBannersQuery);

  const productSections = sections.filter((s) => s.is_visible && sectionFlag(s));

  const productResults = useQueries({
    queries: productSections.map((s) =>
      flaggedProductsQuery(sectionFlag(s)!, s.product_limit || 8),
    ),
  });

  const visible = sections.filter((s) => s.is_visible).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <StoreLayout>
      {visible.map((section) => {
        switch (section.section_key) {
          case "hero":
            return slidesLoading ? (
              <section key={section.id} className="container-x section-py">
                <div className="aspect-[16/9] w-full animate-pulse rounded-2xl border border-border bg-accent md:aspect-[16/5]" />
              </section>
            ) : slides.length ? (
              <HeroSlider key={section.id} slides={slides} />
            ) : (
              <HeroFallback key={section.id} />
            );

          case "categories":
            return (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
                  <SectionHeading
                    title={section.title || "ক্যাটাগরি"}
                    subtitle={section.subtitle}
                  />
                  {categories.length ? (
                    <>
                      <CategoryScroller categories={categories} />
                      <div className="mt-3 flex justify-center">
                        <Button asChild variant="outline">
                          <Link to="/categories">সব ক্যাটাগরি দেখুন</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <EmptyState title="এখনও কোনো ক্যাটাগরি নেই" />
                  )}
                </div>
              </section>
            );

          case "promo_banners":
            return banners.length ? (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
                  <PromoBannerCarousel banners={banners} />
                </div>
              </section>
            ) : null;

          case "newsletter":
            return (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
                  <div className="max-w-2xl text-center mx-auto">
                    <Mail className="mx-auto size-8 text-primary" />
                    <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                      {section.title || "আমাদের সাথে থাকুন"}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground md:text-base">
                      {section.subtitle || "নতুন কালেকশন ও অফারের খবর সবার আগে পান।"}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      {settings.facebook_url && (
                        <Button asChild>
                          <a href={settings.facebook_url} target="_blank" rel="noreferrer">
                            ফেসবুকে ফলো করুন
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline">
                        <Link to="/contact">যোগাযোগ করুন</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            );

          default: {
            const idx = productSections.findIndex((s) => s.id === section.id);
            if (idx === -1) return null;
            const result = productResults[idx];
            const products = result?.data ?? [];
            const flag = sectionFlag(section);
            const isHot = flag === "hot";
            return (
              <section key={section.id} className="container-x section-py">
                <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
                  <SectionHeading
                    title={section.title || ""}
                    subtitle={section.subtitle}
                  />
                  {result?.isLoading ? (
                    <ProductGridSkeleton count={4} />
                  ) : products.length ? (
                    isHot ? (
                      <>
                        <ProductMarquee products={products} />
                        <div className="mt-3 flex justify-center">
                          <Button asChild variant="outline">
                            <Link to="/shop">সব দেখুন</Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <ProductCarousel products={products} />
                        <div className="mt-3 flex justify-center">
                          <Button asChild variant="outline">
                            <Link to="/shop">সব দেখুন</Link>
                          </Button>
                        </div>
                      </>
                    )
                  ) : (
                    <EmptyState
                      title="এই সেকশনে কোনো পণ্য নেই"
                      description="অ্যাডমিন প্যানেল থেকে পণ্য যোগ করুন বা ট্যাগ নির্ধারণ করুন।"
                    />
                  )}
                </div>
              </section>
            );
          }
        }
      })}

      <section className="container-x section-py">
        <div className="rounded-2xl border border-border bg-surface p-4 md:p-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Feature icon={<Truck className="size-5" />} title="দ্রুত ডেলিভারি">
              ঢাকার ভিতরে ২৪-৪৮ ঘণ্টা, বাইরে ৩-৫ দিন
            </Feature>
            <Feature icon={<ShieldCheck className="size-5" />} title="নিশ্চিত মান">
              প্রতিটি পণ্য যাচাই করে প্যাকেজিং করা হয়
            </Feature>
            <Feature icon={<Undo2 className="size-5" />} title="সহজ রিটার্ন">
              ডেলিভারির ৩ দিনের মধ্যে রিটার্ন সুবিধা
            </Feature>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-primary">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
