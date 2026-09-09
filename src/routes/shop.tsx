import { createFileRoute } from "@tanstack/react-router";

import { ShopBrowser } from "@/components/storefront/ShopBrowser";
import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "শপ — সম্পূর্ণ কালেকশন" },
      {
        name: "description",
        content: "শাড়ি, থ্রি-পিস, কুর্তি, কামিজ ও আরও অনেক কিছু — দাম, সাইজ ও রঙ অনুযায়ী ফিল্টার করুন।",
      },
      { property: "og:title", content: "শপ — সম্পূর্ণ কালেকশন" },
      { property: "og:description", content: "সব পোশাকের কালেকশন এক জায়গায়।" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <StoreLayout>
      <PageHeader
        eyebrow="কালেকশন"
        title="শপ"
        description="আপনার পছন্দ অনুযায়ী ফিল্টার করে সহজেই কাঙ্ক্ষিত পোশাক খুঁজে নিন।"
      />
      <div className="container-x py-10">
        <ShopBrowser />
      </div>
    </StoreLayout>
  );
}
