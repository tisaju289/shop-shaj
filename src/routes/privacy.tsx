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
        {(settings.facebook_pixel_enabled || settings.facebook_capi_enabled || settings.ga4_enabled) && (
          <div className="mt-8 max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <h2 className="text-lg font-semibold text-foreground">বিজ্ঞাপন ও পরিমাপ</h2>
            <p>
              আমরা ওয়েবসাইটের ব্যবহার এবং অর্ডার সম্পন্ন হওয়ার তথ্য পরিমাপ করতে
              {settings.facebook_pixel_enabled || settings.facebook_capi_enabled ? " Meta" : ""}
              {(settings.facebook_pixel_enabled || settings.facebook_capi_enabled) && settings.ga4_enabled ? " ও" : ""}
              {settings.ga4_enabled ? " Google Analytics" : ""} ব্যবহার করি। প্রয়োজনীয় অঞ্চলে এই ট্র্যাকিং বন্ধ থাকে।
              আমরা বিজ্ঞাপন মিলানোর জন্য গ্রাহকের নাম, ফোন বা ইমেইল পাঠাই না।
            </p>
            <p>ব্রাউজারের প্রযোজ্য গোপনীয়তা বা বিজ্ঞাপন অপ্ট-আউট নিয়ন্ত্রণ ব্যবহার করে এই পরিমাপ সীমিত করা যায়।</p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
