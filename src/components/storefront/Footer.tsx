import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { SmartLink } from "@/components/storefront/SmartLink";
import { categoriesQuery } from "@/lib/queries";
import { useSettings } from "@/lib/store-context";
import { defaultSettings } from "@/lib/types";
import { cn } from "@/lib/utils";

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
    <footer
      className={cn(
        "mt-12 border-t border-border md:mt-16",
        !settings.footer_bg_color && "bg-surface",
      )}
      style={{
        ...(settings.footer_bg_color ? { backgroundColor: settings.footer_bg_color } : {}),
        ...(settings.footer_text_color ? { color: settings.footer_text_color } : {}),
      }}
    >
      <div className="container-x grid gap-x-5 gap-y-9 py-10 text-center md:grid-cols-2 md:gap-10 md:py-14 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-1">
          <h3
            className={cn(
              "text-lg font-semibold",
              !settings.footer_text_color && "text-primary",
            )}
            style={settings.footer_text_color ? { color: settings.footer_text_color } : undefined}
          >
            {settings.store_name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {settings.footer_text || settings.tagline}
          </p>
          <div
            className="mt-5 flex justify-center gap-2"
            hidden={settings.footer_show_social === false}
          >
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

        <div className="hidden min-w-0 md:block">
          <h4 className="text-sm font-semibold uppercase tracking-wider">
            {settings.footer_quick_links_title || defaultSettings.footer_quick_links_title}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {quickLinks.map((l) => (
              <li key={l.url + l.label}>
                <SmartLink to={l.url} className="transition-colors hover:text-primary">
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
          <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider">
            {settings.footer_service_links_title || defaultSettings.footer_service_links_title}
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {serviceLinks.map((l) => (
              <li key={l.url + l.label}>
                <SmartLink to={l.url} className="transition-colors hover:text-primary">
                  {l.label}
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>

        {settings.footer_show_categories !== false && (
          <div className="hidden min-w-0 md:block">
            <h4 className="text-sm font-semibold uppercase tracking-wider">
              {settings.footer_categories_title || defaultSettings.footer_categories_title}
            </h4>
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
        )}

        <div className="hidden min-w-0 md:block">
          <h4 className="text-sm font-semibold uppercase tracking-wider">
            {settings.footer_contact_title || defaultSettings.footer_contact_title}
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings.phone && (
              <li className="flex items-start justify-center gap-2">
                <Phone className="mt-0.5 size-4 shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-primary">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.email && (
              <li className="flex items-start justify-center gap-2">
                <Mail className="mt-0.5 size-4 shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-primary">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.address && (
              <li className="flex items-start justify-center gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{settings.address}</span>
              </li>
            )}
          </ul>
          {settings.footer_payment_text !== "" && (
            <p className="mt-5 text-xs text-muted-foreground">
              {settings.footer_payment_text || defaultSettings.footer_payment_text}
            </p>
          )}
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
