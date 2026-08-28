import type { Metadata } from "next";
import { PrayerRequestForm } from "@/components/public/PrayerRequestForm";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteSettings } from "@/lib/queries/settings";

const TITLE = "Petición de oración | Inspira Church";
const DESCRIPTION = "Cuéntanos por qué quieres que oremos contigo.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/oracion" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/oracion", type: "website" },
};

export default async function PrayerPage() {
  const settings = await getSiteSettings();

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          as="h1"
          eyebrow="Oración"
          title="Oramos contigo"
          description="No estás solo en esto. Cuéntanos tu petición y nuestro equipo de oración la acompañará."
        />
        <div className="mt-10">
          <PrayerRequestForm privacyPolicyUrl={settings.privacyPolicyUrl} />
        </div>
      </div>
    </Section>
  );
}
