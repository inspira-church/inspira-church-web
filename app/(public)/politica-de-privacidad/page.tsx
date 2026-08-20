import type { Metadata } from "next";
import { Eyebrow } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { getSiteSettings } from "@/lib/queries/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Política de privacidad | Inspira Church",
  description: "Política de privacidad y tratamiento de datos personales de Inspira Church.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  const fileUrl = settings.privacyPolicyUrl;

  return (
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={ABOUT_COLORS.coral}>Legal</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 max-w-2xl text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
            )}
          >
            Política de privacidad
          </h1>
          <p className={cn(hind.className, "mt-4 max-w-xl text-lg text-white/70")}>
            Así protegemos y tratamos tus datos personales cuando nos escribes o dejas tu
            información en el sitio.
          </p>
        </Container>
      </section>

      <section className="bg-black py-10 sm:py-14">
        <Container>
          {fileUrl ? (
            <div className="h-[75vh] w-full overflow-hidden rounded-md border border-white/10 bg-white">
              <iframe src={fileUrl} title="Política de privacidad" className="h-full w-full" />
            </div>
          ) : (
            <p className={cn(hind.className, "text-white/60")}>
              Todavía no hemos publicado este documento. Escríbenos si tienes preguntas sobre el
              tratamiento de tus datos.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
