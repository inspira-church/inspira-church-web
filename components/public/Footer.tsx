import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "@/components/public/SocialLinks";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS, SITE_CONFIG, whatsappLink } from "@/lib/constants";

interface FooterProps {
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
}

export function Footer({
  whatsappNumber,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  xUrl,
  youtubeUrl,
}: FooterProps) {
  return (
    <footer className="border-t border-border bg-paper-raised">
      <Container className="grid gap-10 py-16 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-9" />
            <p className="font-display text-xl font-semibold text-ink">
              {SITE_CONFIG.name}
            </p>
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">
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
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-soft hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-faint">
            Contacto
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>{SITE_CONFIG.city}</li>
            <li>
              <a href={whatsappLink(undefined, whatsappNumber)} className="hover:text-accent">
                Escríbenos por WhatsApp
              </a>
            </li>
            <li>
              <Link href="/oracion" className="hover:text-accent">
                Enviar una petición de oración
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-6">
        <Container>
          <p className="text-xs text-ink-faint">
            © {new Date().getFullYear()} {SITE_CONFIG.name}. Todos los derechos
            reservados.
          </p>
        </Container>
      </div>
    </footer>
  );
}
