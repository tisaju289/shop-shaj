import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "শর্তাবলি — ব্যবহারের নিয়ম" },
      { name: "description", content: "ওয়েবসাইট ব্যবহার, অর্ডার ও পেমেন্ট সংক্রান্ত শর্তাবলি পড়ে নিন।" },
      { property: "og:title", content: "শর্তাবলি" },
      { property: "og:description", content: "অর্ডার, পেমেন্ট ও ডেলিভারি সংক্রান্ত শর্তাবলি।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const settings = useSettings();
  return (
    <StoreLayout>
      <PageHeader eyebrow="নীতিমালা" title="শর্তাবলি" />
      <div className="container-x py-10 md:py-14">
        <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
          {settings.terms ||
            "অর্ডার নিশ্চিত করার আগে পণ্যের বিবরণ, দাম ও ডেলিভারি চার্জ ভালোভাবে দেখে নিন। ভুল বা অসম্পূর্ণ তথ্যের কারণে অর্ডার বাতিল হতে পারে।"}
        </div>
      </div>
    </StoreLayout>
  );
}
