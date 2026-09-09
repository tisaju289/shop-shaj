import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CategoryCard } from "@/components/storefront/CategoryCard";
import { EmptyState } from "@/components/storefront/LoadingSkeleton";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesQuery } from "@/lib/queries";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "সব ক্যাটাগরি — পোশাকের সংগ্রহ" },
      { name: "description", content: "শাড়ি, থ্রি-পিস, কুর্তি, কামিজ ও হিজাবসহ সব ক্যাটাগরি দেখুন।" },
      { property: "og:title", content: "সব ক্যাটাগরি — পোশাকের সংগ্রহ" },
      { property: "og:description", content: "আপনার পছন্দের ক্যাটাগরি বেছে নিন।" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories, isLoading } = useQuery(categoriesQuery);

  return (
    <StoreLayout>
      <PageHeader eyebrow="ব্রাউজ" title="ক্যাটাগরি" description="আপনার পছন্দের কালেকশন বেছে নিন।" />
      <div className="container-x py-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
            ))}
          </div>
        ) : categories?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        ) : (
          <EmptyState title="এখনও কোনো ক্যাটাগরি নেই" />
        )}
      </div>
    </StoreLayout>
  );
}
