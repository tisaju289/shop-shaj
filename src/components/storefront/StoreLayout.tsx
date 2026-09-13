import type { ReactNode } from "react";

import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";
import { WhatsAppFloat } from "@/components/storefront/WhatsAppFloat";
import { useSettings } from "@/lib/store-context";
import { typographyStyle } from "@/lib/typography";

export function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <Header />
      <main className="mobile-centered-content flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppFloat />
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
  const settings = useSettings();

  return (
    <div className="border-b border-border bg-surface">
      <div className="container-x py-10 text-center md:py-14">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-2xl font-semibold md:text-4xl" style={typographyStyle(settings, "heading")}>
          {title}
        </h1>
        {description && (
          <p
            className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base"
            style={typographyStyle(settings, "subheading")}
          >
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
  titleStyle,
  subtitleStyle,
}: {
  title: string;
  subtitle?: string | null;
  titleStyle?: Record<string, string>;
  subtitleStyle?: Record<string, string>;
  action?: ReactNode;
}) {
  const settings = useSettings();

  return (
    <div className="mx-auto mb-3 max-w-2xl text-center md:mb-4">
      <h2 className="text-xl font-semibold md:text-3xl" style={typographyStyle(settings, "heading", titleStyle)}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm text-muted-foreground" style={typographyStyle(settings, "subheading", subtitleStyle)}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
