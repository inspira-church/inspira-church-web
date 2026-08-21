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

export const metadata: Metadata = {
  title: "Generaciones | Inspira Church",
  description:
    "Un espacio donde niños y jóvenes descubren sus dones, sirven, crecen y encuentran su lugar en la familia de Inspira Church.",
};

export default function GenerationsPage() {
  return (
    <>
      <GenerationsHero />
      <GenerationsVision />
      <GenerationsLegacy />
      <GenerationsAreas />
      <GenerationsJourney />
      <GenerationsRatio />
      <GenerationsAltar />
      <GenerationsFamilies />
      <GenerationsNextDate />
      <GenerationsRhythm />
      <GenerationsSafety />
      <GenerationsFAQ />
      <GenerationsCTA />
    </>
  );
}
