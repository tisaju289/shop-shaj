import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "রিটার্ন ও এক্সচেঞ্জ নীতি — সহজ শর্তে ফেরত" },
      { name: "description", content: "পণ্য ফেরত ও বদলের শর্ত, সময়সীমা এবং প্রক্রিয়া সম্পর্কে বিস্তারিত জানুন।" },
      { property: "og:title", content: "রিটার্ন ও এক্সচেঞ্জ নীতি" },
      { property: "og:description", content: "পণ্য ফেরত ও বদলের শর্ত ও প্রক্রিয়া।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const settings = useSettings();
  return (
    <StoreLayout>
      <PageHeader eyebrow="নীতিমালা" title="রিটার্ন ও এক্সচেঞ্জ" />
      <div className="container-x py-10 md:py-14">
        <div className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground md:text-base">
          {settings.return_policy ||
            "পণ্য হাতে পাওয়ার ৩ দিনের মধ্যে ভুল বা ক্ষতিগ্রস্ত পণ্য অপরিবর্তিত অবস্থায় ফেরত বা বদল করা যাবে। ফেরতের আগে আমাদের সাথে যোগাযোগ করুন।"}
        </div>
      </div>
    </StoreLayout>
  );
}
