import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contacto | Inspira Church",
  description: "Escríbenos — queremos saber de ti.",
};

export default function ContactPage() {
  return (
    <Section className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          eyebrow="Hablemos"
          title="Contáctanos"
          description="Cuéntanos qué necesitas — visitarnos, unirte a un grupo, pedir oración o simplemente saludar."
        />
        <div className="mt-6 flex items-center gap-3 text-sm text-ink-soft">
          <span>¿Prefieres algo más directo?</span>
          <WhatsAppButton variant="inline" />
        </div>
        <div className="mt-10">
          <ContactForm />
        </div>
      </div>
    </Section>
  );
}
