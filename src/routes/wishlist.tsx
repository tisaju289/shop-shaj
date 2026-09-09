import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { EmptyState, ProductGridSkeleton } from "@/components/storefront/LoadingSkeleton";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { productsByIdsQuery } from "@/lib/queries";
import { useWishlist } from "@/lib/wishlist";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "পছন্দের তালিকা — সংরক্ষিত পোশাক" },
      { name: "description", content: "আপনার পছন্দের পোশাকগুলো এক জায়গায় সংরক্ষিত রাখুন।" },
      { property: "og:title", content: "পছন্দের তালিকা" },
      { property: "og:description", content: "সংরক্ষিত পণ্যগুলো দেখুন ও অর্ডার করুন।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { ids } = useWishlist();
  const { data, isLoading } = useQuery({ ...productsByIdsQuery(ids), enabled: ids.length > 0 });

  return (
    <StoreLayout>
      <PageHeader eyebrow="আপনার" title="পছন্দের তালিকা" />
      <div className="container-x py-10">
        {ids.length === 0 ? (
          <EmptyState
            title="তালিকা এখনও খালি"
            description="পছন্দের পণ্যে হার্ট আইকনে ক্লিক করে এখানে যোগ করুন।"
            action={
              <Button asChild>
                <Link to="/shop">শপিং শুরু করুন</Link>
              </Button>
            }
          />
        ) : isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : data?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <EmptyState title="পণ্যগুলো আর নেই" description="সংরক্ষিত পণ্যগুলো বর্তমানে পাওয়া যাচ্ছে না।" />
        )}
      </div>
    </StoreLayout>
  );
}
