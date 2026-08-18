import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { TeamMemberCard } from "@/components/public/TeamMemberCard";
import { Container } from "@/components/ui/Container";
import { anton, hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { SITE_CONFIG } from "@/lib/constants";
import { googleMapsLink, wazeLink } from "@/lib/maps";
import { getAboutContent } from "@/lib/queries/about";
import { getSiteSettings } from "@/lib/queries/settings";
import { getActiveTeamMembers } from "@/lib/queries/team-members";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nosotros | Inspira Church",
  description:
    "Historia, misión, visión, valores y equipo pastoral de Inspira Church.",
};

/** Nosotros hereda el color que Inicio ya le asocia en "Tres pasos" (paso 1 → /nosotros). */
const PAGE_COLOR = CAMPAIGN_COLORS[2];

export default async function AboutPage() {
  const [teamMembers, settings, about] = await Promise.all([
    getActiveTeamMembers(),
    getSiteSettings(),
    getAboutContent(),
  ]);
  const pastors = teamMembers.filter((t) => t.type === "pastor");
  const leaders = teamMembers.filter((t) => t.type === "lider");
  const hasLocation = settings.churchLat !== null && settings.churchLng !== null;

  return (
    <>
      {/* Historia */}
      <section className="border-b border-white/10 bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow color={PAGE_COLOR}>{about.historyEyebrow}</Eyebrow>
            <PosterHeading>{about.historyTitle}</PosterHeading>
            <p className={cn(hind.className, "mt-5 max-w-xl text-lg text-white/70")}>
              {about.historyText}
            </p>
          </div>
        </Container>
      </section>

      {/* Misión / Visión */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className={cn(anton.className, "text-2xl uppercase leading-tight text-white")}>
                {about.missionTitle}
              </h2>
              <p className={cn(hind.className, "mt-3 text-white/70")}>{about.missionText}</p>
            </div>
            <div>
              <h2 className={cn(anton.className, "text-2xl uppercase leading-tight text-white")}>
                {about.visionTitle}
              </h2>
              <p className={cn(hind.className, "mt-3 text-white/70")}>{about.visionText}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Valores */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[1]}>{about.valuesEyebrow}</Eyebrow>
          <PosterHeading>{about.valuesTitle}</PosterHeading>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.map((value, i) => (
              <div key={value.title}>
                <h3
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: CAMPAIGN_COLORS[(i + 1) % CAMPAIGN_COLORS.length] }}
                >
                  {value.title}
                </h3>
                <p className={cn(hind.className, "mt-2 text-sm text-white/60")}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Creencias */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[3]}>{about.beliefsEyebrow}</Eyebrow>
          <PosterHeading>{about.beliefsTitle}</PosterHeading>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {about.beliefs.map((belief) => (
              <li key={belief} className={cn(hind.className, "flex gap-3 text-white/70")}>
                <span aria-hidden="true" style={{ color: PAGE_COLOR }} className="mt-1">
                  —
                </span>
                {belief}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Equipo pastoral */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <Eyebrow color={PAGE_COLOR}>Liderazgo</Eyebrow>
          <PosterHeading>Equipo pastoral</PosterHeading>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pastors.map((pastor, i) => (
              <TeamMemberCard
                key={pastor.id}
                fullName={pastor.full_name}
                roleTitle={pastor.role_title}
                photoUrl={pastor.photo_url}
                bio={pastor.bio}
                accentColor={CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length]}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Líderes principales */}
      <section className={cn("border-white/10 bg-[#0d0d0d] py-16 sm:py-24", hasLocation && "border-b")}>
        <Container>
          <Eyebrow color={PAGE_COLOR}>Liderazgo</Eyebrow>
          <PosterHeading>Líderes principales</PosterHeading>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((leader, i) => (
              <TeamMemberCard
                key={leader.id}
                fullName={leader.full_name}
                roleTitle={leader.role_title}
                photoUrl={leader.photo_url}
                bio={leader.bio}
                accentColor={CAMPAIGN_COLORS[(i + 2) % CAMPAIGN_COLORS.length]}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Cómo llegar */}
      {hasLocation && (
        <section className="bg-black py-16 sm:py-24">
          <Container>
            <Eyebrow color={PAGE_COLOR}>Visítanos</Eyebrow>
            <PosterHeading>Cómo llegar</PosterHeading>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="h-80 overflow-hidden border border-white/10 lg:h-96">
                <SinglePointMap
                  lat={settings.churchLat!}
                  lng={settings.churchLng!}
                  label={SITE_CONFIG.name}
                  sublabel={settings.churchAddress || undefined}
                />
              </div>
              <div>
                {settings.churchAddress && (
                  <p className={cn(hind.className, "text-white/70")}>{settings.churchAddress}</p>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={googleMapsLink(settings.churchLat!, settings.churchLng!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                    style={{ color: PAGE_COLOR }}
                  >
                    Cómo llegar en Google Maps →
                  </a>
                  <a
                    href={wazeLink(settings.churchLat!, settings.churchLng!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
                    style={{ color: PAGE_COLOR }}
                  >
                    Cómo llegar en Waze →
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
