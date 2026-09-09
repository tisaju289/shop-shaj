import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "প্রাইভেসি পলিসি — তথ্য সুরক্ষা নীতি" },
      { name: "description", content: "আপনার ব্যক্তিগত তথ্য আমরা কীভাবে সংগ্রহ ও সুরক্ষিত রাখি তা জানুন।" },
      { property: "og:title", content: "প্রাইভেসি পলিসি" },
      { property: "og:description", content: "গ্রাহকের তথ্য সংগ্রহ ও সুরক্ষা সংক্রান্ত নীতিমালা।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const settings = useSettings();
  return (
    <StoreLayout>
      <PageHeader eyebrow="নীতিমালা" title="প্রাইভেসি পলিসি" />
      <div className="container-x py-10 md:py-14">
        <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
          {settings.privacy_policy ||
            "আমরা শুধুমাত্র অর্ডার প্রক্রিয়াকরণ ও ডেলিভারির প্রয়োজনে আপনার নাম, ফোন নম্বর ও ঠিকানা সংগ্রহ করি। আপনার তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।"}
        </div>
      </div>
    </StoreLayout>
  );
}
