import type { Metadata } from "next";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { TeamMemberCard } from "@/components/public/TeamMemberCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SITE_CONFIG } from "@/lib/constants";
import { googleMapsLink, wazeLink } from "@/lib/maps";
import { getSiteSettings } from "@/lib/queries/settings";
import { getActiveTeamMembers } from "@/lib/queries/team-members";

export const metadata: Metadata = {
  title: "Nosotros | Inspira Church",
  description:
    "Historia, misión, visión, valores y equipo pastoral de Inspira Church.",
};

const VALUES = [
  {
    title: "Cercanía",
    description: "Creemos en relaciones reales, no en multitudes anónimas.",
  },
  {
    title: "Excelencia",
    description: "Hacemos las cosas con calidad, como ofrenda y no como obligación.",
  },
  {
    title: "Generosidad",
    description: "Damos con libertad — el tiempo, los recursos y la casa.",
  },
  {
    title: "Crecimiento",
    description: "Nadie se queda igual: siempre hay un siguiente paso.",
  },
];

const BELIEFS = [
  "Creemos en un solo Dios, revelado en tres personas: Padre, Hijo y Espíritu Santo.",
  "Creemos que la Biblia es la Palabra inspirada de Dios y nuestra guía para la fe y la vida.",
  "Creemos que la salvación es por gracia, mediante la fe en Jesucristo.",
  "Creemos en la iglesia local como una familia llamada a amar, servir y hacer discípulos.",
];

export default async function AboutPage() {
  const [teamMembers, settings] = await Promise.all([
    getActiveTeamMembers(),
    getSiteSettings(),
  ]);
  const pastors = teamMembers.filter((t) => t.type === "pastor");
  const leaders = teamMembers.filter((t) => t.type === "lider");
  const hasLocation = settings.churchLat !== null && settings.churchLng !== null;

  return (
    <>
      <Section className="pt-16 sm:pt-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">
            Nuestra historia
          </p>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            Una familia antes que una institución
          </h1>
          <p className="mt-5 text-lg text-ink-soft">
            Inspira Church comenzó como una reunión de pocas familias en una
            sala, con el deseo simple de acompañarse en la fe. Con los años
            crecimos, pero no cambiamos lo esencial: seguimos siendo un lugar
            donde te conocen por tu nombre, no por tu asistencia.
          </p>
        </div>
      </Section>

      <Section tone="raised">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Misión
            </h2>
            <p className="mt-3 text-ink-soft">
              Ayudar a las personas a conocer a Jesús, crecer en comunidad y
              servir con su vida.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">
              Visión
            </h2>
            <p className="mt-3 text-ink-soft">
              Ser una iglesia que inspira a cada generación a vivir su fe de
              forma real, cercana y transformadora.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Lo que nos mueve" title="Nuestros valores" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title}>
              <h3 className="font-display text-lg font-semibold text-ink">
                {value.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="raised">
        <SectionHeading eyebrow="Lo que creemos" title="Nuestras creencias" />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {BELIEFS.map((belief) => (
            <li key={belief} className="flex gap-3 text-ink-soft">
              <span aria-hidden="true" className="mt-1 text-accent">
                —
              </span>
              {belief}
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading eyebrow="Liderazgo" title="Equipo pastoral" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {pastors.map((pastor) => (
            <TeamMemberCard
              key={pastor.id}
              fullName={pastor.full_name}
              roleTitle={pastor.role_title}
              photoUrl={pastor.photo_url}
              bio={pastor.bio}
            />
          ))}
        </div>
      </Section>

      <Section tone="raised">
        <SectionHeading eyebrow="Liderazgo" title="Líderes principales" />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((leader) => (
            <TeamMemberCard
              key={leader.id}
              fullName={leader.full_name}
              roleTitle={leader.role_title}
              photoUrl={leader.photo_url}
              bio={leader.bio}
            />
          ))}
        </div>
      </Section>

      {hasLocation && (
        <Section>
          <SectionHeading eyebrow="Visítanos" title="Cómo llegar" />
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
    </>
  );
}
