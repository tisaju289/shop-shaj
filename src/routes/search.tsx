import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/storefront/ShopBrowser";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search["q"] === "string" ? (search["q"] as string) : "",
  }),

  head: () => ({
    meta: [
      { title: "সার্চ ফলাফল — পণ্য খুঁজুন" },
      { name: "description", content: "নাম বা কোড দিয়ে পণ্য খুঁজে নিন।" },
      { property: "og:title", content: "সার্চ ফলাফল" },
      { property: "og:description", content: "নাম বা কোড দিয়ে পণ্য খুঁজে নিন।" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();

  return (
    <StoreLayout>
      <PageHeader
        eyebrow="সার্চ"
        title={q ? `"${q}" এর ফলাফল` : "পণ্য খুঁজুন"}
        description="ফিল্টার ব্যবহার করে ফলাফল আরও নির্দিষ্ট করুন।"
      />
      <div className="container-x py-10">
        <ShopBrowser initialSearch={q} />
      </div>
    </StoreLayout>
  );
}
