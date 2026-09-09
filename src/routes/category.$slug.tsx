import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "@/components/storefront/LoadingSkeleton";
import { ShopBrowser } from "@/components/storefront/ShopBrowser";
import { StoreLayout } from "@/components/storefront/StoreLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryQuery } from "@/lib/queries";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => {
    const title = `${params.slug} ক্যাটাগরির পোশাক`;
    return {
      meta: [
        { title },
        { name: "description", content: "এই ক্যাটাগরির সব পণ্য দেখুন, ফিল্টার ও সাজানোর সুবিধা সহ।" },
        { property: "og:title", content: title },
        { property: "og:description", content: "এই ক্যাটাগরির সব পণ্য দেখুন।" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: category, isLoading } = useQuery(categoryQuery(slug));

  if (isLoading) {
    return (
      <StoreLayout>
        <Skeleton className="h-56 w-full" />
        <div className="container-x py-10">
          <Skeleton className="h-96 w-full" />
        </div>
      </StoreLayout>
    );
  }

  if (!category) {
    return (
      <StoreLayout>
        <div className="container-x py-20">
          <EmptyState
            title="ক্যাটাগরিটি পাওয়া যায়নি"
            description="ঠিকানাটি পরীক্ষা করুন বা শপ পেজ থেকে ব্রাউজ করুন।"
          />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <section className="relative border-b border-border bg-surface">
        {category.banner_url && (
          <>
            <img
              src={category.banner_url}
              alt={category.name}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-foreground/45" />
          </>
        )}
        <div className="container-x relative py-12 md:py-16">
          <p className={category.banner_url ? "eyebrow text-background/80" : "eyebrow"}>ক্যাটাগরি</p>
          <h1
            className={`mt-2 text-2xl font-semibold md:text-4xl ${category.banner_url ? "text-background" : ""}`}
          >
            {category.name}
          </h1>
          {category.description && (
            <p
              className={`mt-3 max-w-2xl text-sm md:text-base ${
                category.banner_url ? "text-background/85" : "text-muted-foreground"
              }`}
            >
              {category.description}
            </p>
          )}
        </div>
      </section>

      <div className="container-x py-10">
        <ShopBrowser fixedCategory={slug} hideCategoryFilter />
      </div>
    </StoreLayout>
  );
}
