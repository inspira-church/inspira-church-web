import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { ContactForm } from "@/components/public/ContactForm";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import { hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { getSiteSettings } from "@/lib/queries/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contacto | Inspira Church",
  description: "Escríbenos — queremos saber de ti.",
};

/** Contacto hereda el color que Primera-vez ya le asocia en su CTA final "¿Tienes preguntas?". */
const PAGE_COLOR = CAMPAIGN_COLORS[4];

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
      <Container>
        <div className="mx-auto max-w-xl">
          <Eyebrow color={PAGE_COLOR}>Hablemos</Eyebrow>
          <PosterHeading>Contáctanos</PosterHeading>
          <p className={cn(hind.className, "mt-4 text-white/70")}>
            Cuéntanos qué necesitas — visitarnos, unirte a un grupo, pedir oración o simplemente
            saludar.
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
            <span>¿Prefieres algo más directo?</span>
            <WhatsAppButton
              variant="inline"
              message={settings.whatsappMessage}
              number={settings.whatsappNumber}
            />
          </div>
          <div className="mt-10">
            <ContactForm privacyPolicyUrl={settings.privacyPolicyUrl} />
          </div>
        </div>
      </Container>
    </section>
  );
}
