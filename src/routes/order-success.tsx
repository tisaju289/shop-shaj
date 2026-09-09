import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

import { StoreLayout } from "@/components/storefront/StoreLayout";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/order-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search["order"] === "string" ? (search["order"] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "অর্ডার সফল হয়েছে — ধন্যবাদ" },
      { name: "description", content: "আপনার অর্ডার গ্রহণ করা হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।" },
      { property: "og:title", content: "অর্ডার সফল হয়েছে" },
      { property: "og:description", content: "আপনার অর্ডার গ্রহণ করা হয়েছে।" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { order } = Route.useSearch();
  const settings = useSettings();

  return (
    <StoreLayout>
      <div className="container-x flex flex-col items-center py-20 text-center">
        <CheckCircle2 className="size-14 text-success" />
        <h1 className="mt-5 text-2xl font-semibold md:text-3xl">ধন্যবাদ! অর্ডার সফল হয়েছে</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          আমরা শীঘ্রই ফোনে যোগাযোগ করে অর্ডারটি নিশ্চিত করব।
          {settings.phone && <> যেকোনো প্রশ্নে কল করুন {settings.phone}</>}
        </p>
        {order && (
          <p className="mt-5 rounded-md border border-border bg-surface px-4 py-2 text-sm">
            অর্ডার নম্বর: <span className="font-semibold">{order}</span>
          </p>
        )}
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link to="/shop">আরও শপিং করুন</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">হোমে ফিরুন</Link>
          </Button>
        </div>
      </div>
    </StoreLayout>
  );
}
