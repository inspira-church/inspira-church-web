import {
  CalendarDays,
  HandCoins,
  Heart,
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
  "/oraciones": Heart,
  "/grupos": Users,
  "/eventos": CalendarDays,
  "/contacto": Mail,
  "/donaciones": HandCoins,
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
  const addressDisplay = (churchAddress || SITE_CONFIG.city).replace(/,\s*/, " · ");

  return (
    <footer className="border-t border-white/10 bg-[#0d0d0d]">
      <Container className="grid gap-12 py-16 sm:grid-cols-3 sm:py-20">
        <div>
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt=""
              width={76}
              height={76}
              className="h-[4.5rem] w-[4.5rem] object-contain"
            />
            <p className={cn(anton.className, "text-xl text-white")}>
              {SITE_CONFIG.name}
            </p>
          </div>
          <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-white/60">
            Una iglesia cercana y familiar, donde puedes conectar, crecer y
            caminar con Dios en comunidad.
          </p>
          <SocialLinks
            className="mt-6"
            linkClassName="text-white/50 hover:text-[#FF7F50]"
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
            tiktokUrl={tiktokUrl}
            xUrl={xUrl}
            youtubeUrl={youtubeUrl}
          />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF7F50]/80">
            Explora
          </p>
          <ul className="mt-4 space-y-3">
            {NAV_LINKS.map((link) => {
              const Icon = NAV_ICONS[link.href];
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2.5 text-sm font-medium text-white/70 transition-colors hover:text-[#FF7F50]"
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF7F50]/80">
            Contacto
          </p>
          <ul className="mt-4 space-y-3 text-sm font-medium text-white/70">
            <li className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {hasLocation ? (
                <a
                  href={googleMapsLink(churchLat!, churchLng!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#FF7F50]"
                >
                  {addressDisplay}
                </a>
              ) : (
                addressDisplay
              )}
            </li>
            <li>
              <a
                href={whatsappLink(undefined, whatsappNumber)}
                className="flex items-center gap-2.5 transition-colors hover:text-[#FF7F50]"
              >
                <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                Escríbenos por WhatsApp
              </a>
            </li>
            <li>
              <Link
                href="/oracion"
                className="flex items-center gap-2.5 transition-colors hover:text-[#FF7F50]"
              >
                <HeartHandshake className="h-4 w-4 shrink-0" aria-hidden="true" />
                Enviar una petición de oración
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Todos los derechos
            reservados.
          </p>
          {privacyPolicyUrl && (
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-white/40">
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#FF7F50] hover:underline"
              >
                Política de privacidad
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/politica-de-privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-[#FF7F50] hover:underline"
              >
                Tratamiento de datos
              </Link>
            </p>
          )}
        </Container>
      </div>
    </footer>
  );
}
