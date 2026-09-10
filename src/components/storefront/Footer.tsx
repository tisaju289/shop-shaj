import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { SmartLink } from "@/components/storefront/SmartLink";
import { categoriesQuery } from "@/lib/queries";
import { useSettings } from "@/lib/store-context";
import { defaultSettings } from "@/lib/types";

export function Footer() {
  const settings = useSettings();
  const { data: categories = [] } = useQuery(categoriesQuery);
  const quickLinks = settings.footer_quick_links?.length
    ? settings.footer_quick_links
    : defaultSettings.footer_quick_links;
  const serviceLinks = settings.footer_service_links?.length
    ? settings.footer_service_links
    : defaultSettings.footer_service_links;

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-primary">{settings.store_name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {settings.footer_text || settings.tagline}
          </p>
          <div className="mt-5 flex gap-2">
            {settings.facebook_url && (
              <SocialLink href={settings.facebook_url} label="Facebook">
                <Facebook className="size-4" />
              </SocialLink>
            )}
            {settings.instagram_url && (
              <SocialLink href={settings.instagram_url} label="Instagram">
                <Instagram className="size-4" />
              </SocialLink>
            )}
            {settings.youtube_url && (
              <SocialLink href={settings.youtube_url} label="YouTube">
                <Youtube className="size-4" />
              </SocialLink>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">দ্রুত লিংক</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider">কাস্টমার সার্ভিস</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {SERVICE_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">ক্যাটাগরি</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {categories.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="transition-colors hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider">যোগাযোগ</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings.phone && (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-primary">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">পেমেন্ট: ক্যাশ অন ডেলিভারি</p>
        </div>
      </div>

      <div className="border-t border-border py-5">
        <p className="container-x text-center text-xs text-muted-foreground">
          {settings.copyright_text || `© ${new Date().getFullYear()} ${settings.store_name}`}
        </p>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
    >
      {children}
    </a>
  );
}
