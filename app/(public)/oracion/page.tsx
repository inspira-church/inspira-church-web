import type { Metadata } from "next";
import { PrayerRequestForm } from "@/components/public/PrayerRequestForm";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Petición de oración | Inspira Church",
  description: "Cuéntanos por qué quieres que oremos contigo.",
};

export default function PrayerPage() {
  return (
    <Section className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          eyebrow="Oración"
          title="Oramos contigo"
          description="No estás solo en esto. Cuéntanos tu petición y nuestro equipo de oración la acompañará."
        />
        <div className="mt-10">
          <PrayerRequestForm />
        </div>
      </div>
    </Section>
  );
}
