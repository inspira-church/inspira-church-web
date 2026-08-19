import type { Metadata } from "next";
import { AboutCTA } from "@/components/public/AboutCTA";
import { AboutHero } from "@/components/public/AboutHero";
import { BeliefsAccordion } from "@/components/public/BeliefsAccordion";
import { ChurchValues } from "@/components/public/ChurchValues";
import { EssenceStatement } from "@/components/public/EssenceStatement";
import { LeadershipMosaic } from "@/components/public/LeadershipMosaic";
import { MissionVision } from "@/components/public/MissionVision";
import { PastoralTeam } from "@/components/public/PastoralTeam";
import { VisitUs } from "@/components/public/VisitUs";
import { SITE_CONFIG } from "@/lib/constants";
import { getAboutContent } from "@/lib/queries/about";
import { getAboutEssenceImage, getAboutHeroImage } from "@/lib/queries/media";
import { getSiteSettings } from "@/lib/queries/settings";
import { getActiveTeamMembers } from "@/lib/queries/team-members";

export const metadata: Metadata = {
  title: "Nosotros | Inspira Church",
  description:
    "Historia, misión, visión, valores, creencias y equipo pastoral de Inspira Church.",
};

export default async function AboutPage() {
  const [teamMembers, settings, about, heroImage, essenceImage] = await Promise.all([
    getActiveTeamMembers(),
    getSiteSettings(),
    getAboutContent(),
    getAboutHeroImage(),
    getAboutEssenceImage(),
  ]);

  const pastors = teamMembers
    .filter((t) => t.type === "pastor")
    .map((t) => ({ id: t.id, fullName: t.full_name, roleTitle: t.role_title, photoUrl: t.photo_url, bio: t.bio }));
  const leaders = teamMembers
    .filter((t) => t.type === "lider")
    .map((t) => ({ id: t.id, fullName: t.full_name, roleTitle: t.role_title, photoUrl: t.photo_url }));

  const hasLocation = settings.churchLat !== null && settings.churchLng !== null;

  return (
    <>
      <AboutHero
        eyebrow={about.historyEyebrow}
        title={about.historyTitle}
        text={about.historyText}
        photoUrl={heroImage}
        photoAlt={about.historyImageAlt || about.historyTitle}
      />

      <MissionVision
        eyebrow={about.purposeEyebrow}
        title={about.purposeTitle}
        missionLabel={about.missionTitle}
        missionHeadline={about.missionHeadline}
        missionText={about.missionText}
        visionLabel={about.visionTitle}
        visionHeadline={about.visionHeadline}
        visionText={about.visionText}
      />

      <EssenceStatement
        title={about.essenceTitle}
        text={about.essenceText}
        photoUrl={essenceImage}
        photoAlt={about.essenceImageAlt || about.essenceTitle}
      />

      <ChurchValues eyebrow={about.valuesEyebrow} title={about.valuesTitle} values={about.values} />

      <BeliefsAccordion
        eyebrow={about.beliefsEyebrow}
        title={about.beliefsTitle}
        intro={about.beliefsIntro}
        beliefs={about.beliefs}
      />

      <PastoralTeam members={pastors} />

      <LeadershipMosaic members={leaders} />

      {hasLocation && (
        <VisitUs
          eyebrow={about.visitEyebrow}
          title={about.visitTitle}
          siteName={SITE_CONFIG.name}
          address={settings.churchAddress || null}
          lat={settings.churchLat!}
          lng={settings.churchLng!}
        />
      )}

      <AboutCTA title={about.ctaTitle} text={about.ctaText} />
    </>
  );
}
