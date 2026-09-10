import type { ReactNode } from "react";

import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <main className="mobile-centered-content flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <div className="border-b border-border bg-surface">
      <div className="container-x py-10 text-center md:py-14 md:text-left">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-semibold md:text-4xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:mx-0 md:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto mb-6 max-w-2xl text-center md:mb-7">
      <h2 className="text-xl font-semibold md:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
