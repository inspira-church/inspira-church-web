import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE_CONFIG } from "@/lib/constants";
import { dayName, formatTime } from "@/lib/format";
import { googleMapsLink, wazeLink } from "@/lib/maps";
import { getActiveSchedules } from "@/lib/queries/schedules";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Primera vez | Inspira Church",
  description:
    "¿Nos visitas por primera vez? Aquí encuentras todo lo que necesitas saber: horarios, dirección y qué esperar.",
};

const WHAT_TO_EXPECT = [
  {
    title: "Ven como estás",
    description:
      "No hay un código de vestimenta — ven cómodo, tal como eres.",
  },
  {
    title: "Un tiempo de adoración",
    description:
      "Cantamos, oramos y escuchamos una enseñanza basada en la Biblia, práctica para la vida diaria.",
  },
  {
    title: "Un ambiente familiar",
    description:
      "Alguien del equipo te recibirá en la entrada — no estarás solo.",
  },
];

export default async function FirstTimePage() {
  const [schedules, settings] = await Promise.all([
    getActiveSchedules(),
    getSiteSettings(),
  ]);
  const hasLocation = settings.churchLat !== null && settings.churchLng !== null;

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Primera vez
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            ¡Te estábamos esperando!
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            Sin compromiso, solo para conocernos. Aquí tienes todo lo que
            necesitas para tu primera visita a Inspira Church.
          </p>
        </div>
      </Section>

      <Section tone="raised">
        <SectionHeading eyebrow="Qué esperar" title="Así es una visita a Inspira" />
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {WHAT_TO_EXPECT.map((item) => (
            <div key={item.title}>
              <h3 className="font-display text-lg font-semibold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Horarios" title="¿Cuándo te esperamos?" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {schedules.map((s) => (
            <div key={s.id} className="rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {s.name}
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-ink">
                {formatTime(s.time_of_day)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {dayName(s.day_of_week)}
                {s.location ? ` · ${s.location}` : ""}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {hasLocation && (
        <Section tone="raised">
          <SectionHeading eyebrow="Dirección" title="Cómo llegar" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="h-80 overflow-hidden rounded-lg border border-border lg:h-96">
              <SinglePointMap
                lat={settings.churchLat!}
                lng={settings.churchLng!}
                label={SITE_CONFIG.name}
                sublabel={settings.churchAddress || undefined}
              />
            </div>
            <div>
              {settings.churchAddress && (
                <p className="text-ink-soft">{settings.churchAddress}</p>
              )}
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href={googleMapsLink(settings.churchLat!, settings.churchLng!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Cómo llegar en Google Maps →
                </a>
                <a
                  href={wazeLink(settings.churchLat!, settings.churchLng!)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Cómo llegar en Waze →
                </a>
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section>
        <div className="max-w-xl">
          <SectionHeading
            eyebrow="¿Tienes preguntas?"
            title="Escríbenos antes de venir"
            description="Con gusto resolvemos cualquier duda antes de tu visita."
          />
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button as={Link} href="/contacto">
              Ir a Contacto
            </Button>
            <div className="flex items-center gap-3 text-sm text-ink-soft">
              <span>o escríbenos directo</span>
              <WhatsAppButton
                variant="inline"
                message={settings.whatsappMessage}
                number={settings.whatsappNumber}
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
