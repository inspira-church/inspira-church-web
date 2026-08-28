import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import { whatsappLink } from "@/lib/constants";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { googleMapsLink } from "@/lib/maps";
import { getPublishedEventBySlug } from "@/lib/queries/events";
import { getSiteSettings } from "@/lib/queries/settings";
import { cn } from "@/lib/utils";

const TITLE = "Contacto | Inspira Church";
const DESCRIPTION =
  "Queremos escucharte. Si deseas visitarnos, unirte a un grupo, pedir oración o simplemente saludarnos, estamos aquí para ti.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contacto" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/contacto", type: "website" },
};

interface PageProps {
  searchParams: Promise<{ evento?: string }>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { evento } = await searchParams;
  const [settings, event] = await Promise.all([
    getSiteSettings(),
    evento ? getPublishedEventBySlug(evento) : Promise.resolve(null),
  ]);

  const hasLocation = settings.churchLat != null && settings.churchLng != null;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <div className="mx-auto max-w-2xl">
            <p
              className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ borderColor: ABOUT_COLORS.coral, color: ABOUT_COLORS.coral }}
            >
              Hablemos
            </p>
            <h1
              className={cn(
                anton.className,
                "mt-5 text-balance text-4xl uppercase leading-[0.92] text-white sm:text-6xl"
              )}
            >
              Contáctanos
            </h1>
            <p className={cn(hind.className, "mt-5 text-lg text-white/70")}>
              {settings.contactHeroText}
            </p>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">
                ¿Prefieres hablar directamente?
              </p>
              <div className="mt-3">
                <WhatsAppButton
                  variant="text"
                  message={settings.whatsappMessage}
                  number={settings.whatsappNumber}
                >
                  Escríbenos por WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Dos caminos */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-20">
        <Container>
          <div className="mx-auto grid max-w-2xl gap-10 sm:grid-cols-2">
            <div className="border-t-2 pt-5" style={{ borderColor: ABOUT_COLORS.coral }}>
              <p
                className={cn(anton.className, "text-xl uppercase tracking-wide text-white")}
              >
                Quiero escribirles
              </p>
              <p className={cn(hind.className, "mt-2 text-white/60")}>
                Completa el formulario y nuestro equipo se pondrá en contacto contigo.
              </p>
            </div>
            <div className="border-t-2 pt-5" style={{ borderColor: ABOUT_COLORS.teal }}>
              <p className={cn(anton.className, "text-xl uppercase tracking-wide text-white")}>
                Quiero hablar ahora
              </p>
              <p className={cn(hind.className, "mt-2 text-white/60")}>
                Escríbenos directamente por WhatsApp.
              </p>
              <a
                href={whatsappLink(settings.whatsappMessage, settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                style={{ color: ABOUT_COLORS.teal }}
              >
                Abrir WhatsApp
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Container>
      </section>

      {/* Formulario */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <div className="mx-auto max-w-xl">
            <ContactForm
              privacyPolicyUrl={settings.privacyPolicyUrl}
              eventContext={event ? { slug: event.slug, name: event.name } : undefined}
            />
          </div>
        </Container>
      </section>

      {/* Información de la iglesia */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-xl">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: ABOUT_COLORS.teal }}
            >
              También puedes encontrarnos aquí
            </p>
            <p className={cn(anton.className, "mt-2 text-2xl uppercase text-white")}>
              Inspira Church
            </p>
            <p className={cn(hind.className, "mt-1 text-white/60")}>
              {settings.churchAddress || "Bogotá, Colombia"}
            </p>
            {hasLocation && (
              <a
                href={googleMapsLink(settings.churchLat as number, settings.churchLng as number)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                style={{ color: ABOUT_COLORS.coral }}
              >
                Cómo llegar
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </Container>
      </section>

      {/* Cierre */}
      <section className="py-16 text-center sm:py-24" style={{ backgroundColor: ABOUT_COLORS.cream }}>
        <Container>
          <p
            className={cn(
              anton.className,
              "mx-auto max-w-xl text-balance text-3xl uppercase leading-[1.05] text-black sm:text-5xl"
            )}
          >
            Queremos conocerte.
          </p>
          <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-base text-black/70")}>
            Detrás de cada mensaje hay una historia, y para nosotros cada persona importa.
          </p>
        </Container>
      </section>
    </>
  );
}
