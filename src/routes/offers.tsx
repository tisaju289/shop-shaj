import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { EmptyState, ErrorState, ProductGridSkeleton } from "@/components/storefront/LoadingSkeleton";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { saleProductsQuery } from "@/lib/queries";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "অফার ও ডিসকাউন্ট — সীমিত সময়ের ছাড়" },
      {
        name: "description",
        content: "চলমান অফারে ছাড়ে পোশাক কিনুন। সীমিত সময়ের ডিসকাউন্ট দেখে নিন।",
      },
      { property: "og:title", content: "অফার ও ডিসকাউন্ট" },
      { property: "og:description", content: "সীমিত সময়ের ছাড়ে জনপ্রিয় পোশাক।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { data, isLoading, isError, refetch } = useQuery(saleProductsQuery);

  return (
    <StoreLayout>
      <PageHeader eyebrow="ডিসকাউন্ট" title="অফার" description="সীমিত সময়ের বিশেষ ছাড়।" />
      <div className="container-x py-10">
        {isLoading ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <ErrorState onRetry={() => void refetch()} />
        ) : data?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="এখন কোনো অফার চলছে না" description="নতুন অফারের জন্য শীঘ্রই আবার দেখুন।" />
        )}
      </div>
    </StoreLayout>
  );
}
