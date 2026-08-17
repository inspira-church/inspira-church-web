import {
  CalendarDays,
  HeartHandshake,
  Home,
  Mail,
  MapPin,
  Mic,
  MessageCircle,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "@/components/public/SocialLinks";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS, SITE_CONFIG, whatsappLink } from "@/lib/constants";
import { anton } from "@/lib/fonts";
import { googleMapsLink } from "@/lib/maps";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/nosotros": UserRound,
  "/predicas": Mic,
  "/grupos": Users,
  "/eventos": CalendarDays,
  "/contacto": Mail,
};

interface FooterProps {
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  churchAddress?: string;
  churchLat?: number | null;
  churchLng?: number | null;
  privacyPolicyUrl?: string;
}

export function Footer({
  whatsappNumber,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  xUrl,
  youtubeUrl,
  churchAddress,
  churchLat,
  churchLng,
  privacyPolicyUrl,
}: FooterProps) {
  const hasLocation = churchLat != null && churchLng != null;
  return (
    <footer className="border-t border-border bg-paper-raised">
      <Container className="grid gap-10 py-16 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={68}
              height={68}
              className="h-16 w-16 object-contain"
            />
            <p className={cn(anton.className, "text-lg text-ink")}>
              {SITE_CONFIG.name}
            </p>
          </div>
          <p className="mt-3 max-w-xs text-sm font-semibold text-ink-soft">
            {SITE_CONFIG.description}
          </p>
          <SocialLinks
            className="mt-5"
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            tiktokUrl={tiktokUrl}
            xUrl={xUrl}
            youtubeUrl={youtubeUrl}
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Explora
          </p>
          <ul className="mt-3 space-y-2">
            {NAV_LINKS.map((link) => {
              const Icon = NAV_ICONS[link.href];
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-accent"
                  >
                    {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Contacto
          </p>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-ink-soft">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {hasLocation ? (
                <a
                  href={googleMapsLink(churchLat!, churchLng!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent"
                >
                  {churchAddress || SITE_CONFIG.city}
                </a>
              ) : (
                churchAddress || SITE_CONFIG.city
              )}
            </li>
            <li>
              <a
                href={whatsappLink(undefined, whatsappNumber)}
                className="flex items-center gap-2 hover:text-accent"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Escríbenos por WhatsApp
              </a>
            </li>
            <li>
              <Link href="/oracion" className="flex items-center gap-2 hover:text-accent">
                <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                Enviar una petición de oración
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Todos los derechos
            reservados.
          </p>
          {privacyPolicyUrl && (
            <a
              href={privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-faint hover:text-accent hover:underline"
            >
              Política de privacidad
            </a>
          )}
        </Container>
      </div>
    </footer>
  );
}
