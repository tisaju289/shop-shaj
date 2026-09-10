import type { ReactNode } from "react";

import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
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
      <div className="container-x py-10 md:py-14">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-semibold md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
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
  action,
}: {
  title: string;
  subtitle?: string | null;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 md:mb-7">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
