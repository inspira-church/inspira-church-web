import type { Metadata } from "next";
import { Eyebrow } from "@/components/public/cartel";
import { GenerationsRegistrationForm } from "@/components/public/GenerationsRegistrationForm";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { getGenerationsContent } from "@/lib/queries/generations";
import { cn } from "@/lib/utils";

const TITLE = "Inscríbete en Generaciones | Inspira Church";
const DESCRIPTION =
  "Inscribe a tu hijo o hija en Generaciones — el espacio de niños y jóvenes de Inspira Church.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/generaciones/inscripcion" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/generaciones/inscripcion", type: "website" },
};

export default async function GenerationsRegistrationPage() {
  const content = await getGenerationsContent();
  const areaOptions = content.areas.map((area) => ({ value: area.name, label: area.name }));

  return (
    <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
      <Container>
        <div className="mx-auto max-w-xl">
          <Eyebrow color={ABOUT_COLORS.coral}>Generaciones</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
            )}
          >
            Inscríbete en Generaciones
          </h1>
          <p className={cn(hind.className, "mt-4 text-white/70")}>
            Completa los datos de tu hijo o hija y un líder del equipo se pondrá en contacto contigo.
          </p>
          <div className="mt-10">
            <GenerationsRegistrationForm areaOptions={areaOptions} />
          </div>
        </div>
      </Container>
    </section>
  );
}
