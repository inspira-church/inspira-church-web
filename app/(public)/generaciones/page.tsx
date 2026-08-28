import type { Metadata } from "next";
import { GenerationsAltar } from "@/components/public/GenerationsAltar";
import { GenerationsAreas } from "@/components/public/GenerationsAreas";
import { GenerationsCTA } from "@/components/public/GenerationsCTA";
import { GenerationsFAQ } from "@/components/public/GenerationsFAQ";
import { GenerationsFamilies } from "@/components/public/GenerationsFamilies";
import { GenerationsHero } from "@/components/public/GenerationsHero";
import { GenerationsJourney } from "@/components/public/GenerationsJourney";
import { GenerationsLegacy } from "@/components/public/GenerationsLegacy";
import { GenerationsNextDate } from "@/components/public/GenerationsNextDate";
import { GenerationsRatio } from "@/components/public/GenerationsRatio";
import { GenerationsRhythm } from "@/components/public/GenerationsRhythm";
import { GenerationsSafety } from "@/components/public/GenerationsSafety";
import { GenerationsVision } from "@/components/public/GenerationsVision";
import { GENERATIONS_PHOTO_MODULES, generationsAreaPhotoModule } from "@/lib/generations-photo-modules";
import { getGenerationsContent } from "@/lib/queries/generations";
import { getGenerationsMedia } from "@/lib/queries/generations-media";

const TITLE = "Generaciones | Inspira Church";
const DESCRIPTION =
  "Un espacio donde niños y jóvenes descubren sus dones, sirven, crecen y encuentran su lugar en la familia de Inspira Church.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/generaciones" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/generaciones", type: "website" },
};

export default async function GenerationsPage() {
  const [content, media] = await Promise.all([getGenerationsContent(), getGenerationsMedia()]);

  const photoByAreaId = Object.fromEntries(
    content.areas.map((area) => [area.id, media[generationsAreaPhotoModule(area.id)]])
  );

  return (
    <>
      <GenerationsHero
        eyebrow={content.heroEyebrow}
        title={content.heroTitle}
        taglineWhite={content.heroTaglineWhite}
        taglineCoral={content.heroTaglineCoral}
        verseText={content.heroVerseText}
        verseRef={content.heroVerseRef}
        photoUrl={media[GENERATIONS_PHOTO_MODULES.hero]}
      />
      <GenerationsVision
        titleWhite1={content.visionTitleWhite1}
        titleCoral1={content.visionTitleCoral1}
        titleWhite2={content.visionTitleWhite2}
        titleCoral2={content.visionTitleCoral2}
        text={content.visionText}
        closing={content.visionClosing}
      />
      <GenerationsLegacy
        titleWhite={content.legacyTitleWhite}
        titleCoral={content.legacyTitleCoral}
        photoUrl1={media[GENERATIONS_PHOTO_MODULES.legacy1]}
        photoUrl2={media[GENERATIONS_PHOTO_MODULES.legacy2]}
      />
      <GenerationsAreas
        title={content.areasTitle}
        intro={content.areasIntro}
        areas={content.areas}
        photoByAreaId={photoByAreaId}
      />
      <GenerationsJourney title={content.journeyTitle} steps={content.journey} />
      <GenerationsRatio
        leftPercent={content.ratioLeftPercent}
        leftLabel={content.ratioLeftLabel}
        leftText={content.ratioLeftText}
        rightPercent={content.ratioRightPercent}
        rightLabel={content.ratioRightLabel}
        rightText={content.ratioRightText}
        closingFaded={content.ratioClosingFaded}
        closingWhite={content.ratioClosingWhite}
      />
      <GenerationsAltar
        title={content.altarTitle}
        text={content.altarText}
        tagline={content.altarTagline}
        photoUrl={media[GENERATIONS_PHOTO_MODULES.altar]}
      />
      <GenerationsFamilies
        title={content.familiesTitle}
        text={content.familiesText}
        parentsGuideUrl={content.parentsGuideUrl}
        photoUrl={media[GENERATIONS_PHOTO_MODULES.families]}
      />
      <GenerationsNextDate eyebrow={content.nextDateEyebrow} nextDate={content.nextDate} note={content.nextDateNote} />
      <GenerationsRhythm words={content.rhythm} />
      <GenerationsSafety
        eyebrow={content.safetyEyebrow}
        title={content.safetyTitle}
        principles={content.safetyPrinciples}
        careGuidelinesUrl={content.careGuidelinesUrl}
      />
      <GenerationsFAQ title={content.faqTitle} items={content.faq} />
      <GenerationsCTA
        title={content.ctaTitle}
        tagline={content.ctaTagline}
        closingWhite={content.ctaClosingWhite}
        closingHighlight={content.ctaClosingHighlight}
        parentsGuideUrl={content.parentsGuideUrl}
        photoUrl={media[GENERATIONS_PHOTO_MODULES.cta]}
      />
    </>
  );
}
