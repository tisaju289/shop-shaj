import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { PageHeader, StoreLayout } from "@/components/storefront/StoreLayout";
import { useSettings } from "@/lib/store-context";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "যোগাযোগ করুন — অর্ডার ও সহায়তা" },
      {
        name: "description",
        content: "ফোন, হোয়াটসঅ্যাপ বা ইমেইলে আমাদের সাথে যোগাযোগ করুন। অর্ডার ও ডেলিভারি সংক্রান্ত সহায়তা।",
      },
      { property: "og:title", content: "যোগাযোগ করুন" },
      { property: "og:description", content: "অর্ডার, ডেলিভারি ও পণ্য সংক্রান্ত যেকোনো প্রশ্নে আমাদের জানান।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const s = useSettings();

  const items = [
    s.phone && { icon: Phone, label: "ফোন", value: s.phone, href: `tel:${s.phone}` },
    s.whatsapp && {
      icon: MessageCircle,
      label: "হোয়াটসঅ্যাপ",
      value: s.whatsapp,
      href: `https://wa.me/${s.whatsapp.replace(/[^\d]/g, "")}`,
    },
    s.email && { icon: Mail, label: "ইমেইল", value: s.email, href: `mailto:${s.email}` },
    s.address && { icon: MapPin, label: "ঠিকানা", value: s.address, href: undefined },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <StoreLayout>
      <PageHeader
        eyebrow="সহায়তা"
        title="যোগাযোগ করুন"
        description="অর্ডার, ডেলিভারি বা পণ্য সংক্রান্ত যেকোনো প্রশ্নে আমাদের জানান।"
      />
      <div className="container-x py-10 md:py-14">
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((i) => (
              <div key={i.label} className="flex gap-4 rounded-lg border border-border bg-surface p-5">
                <i.icon className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm text-muted-foreground">{i.label}</p>
                  {i.href ? (
                    <a href={i.href} className="font-semibold hover:text-primary">
                      {i.value}
                    </a>
                  ) : (
                    <p className="font-semibold">{i.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            যোগাযোগের তথ্য এখনও যুক্ত করা হয়নি।
          </p>
        )}
      </div>
    </StoreLayout>
  );
}
