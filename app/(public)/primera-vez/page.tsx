import type { Metadata } from "next";
import { HandHeart, MapPinned, Sparkles } from "lucide-react";
import Image from "next/image";
import { Eyebrow, GoldButton, PosterHeading } from "@/components/public/cartel";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { Container } from "@/components/ui/Container";
import { anton, hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { getFirstTimeHeroImage } from "@/lib/queries/media";
import { getSiteSettings } from "@/lib/queries/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Primera vez | Inspira Church",
  description:
    "¿Nos visitas por primera vez? Aquí encuentras todo lo que necesitas saber antes de tu visita a Inspira Church.",
};

const WHAT_TO_EXPECT = [
  {
    icon: Sparkles,
    title: "Ven como estás",
    description: "No hay un código de vestimenta — ven cómodo, tal como eres.",
  },
  {
    icon: HandHeart,
    title: "Un tiempo de adoración",
    description:
      "Cantamos, oramos y escuchamos una enseñanza basada en la Biblia, práctica para la vida diaria.",
  },
  {
    icon: MapPinned,
    title: "Un ambiente familiar",
    description: "Alguien del equipo te recibirá en la entrada — no estarás solo.",
  },
];

export default async function FirstTimePage() {
  const [heroImage, settings] = await Promise.all([
    getFirstTimeHeroImage(),
    getSiteSettings(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-white/10 bg-black">
        {heroImage && (
          <div className="relative h-[22rem] w-full overflow-hidden sm:h-[28rem]">
            <Image
              src={heroImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black from-10% via-black/70 via-40% to-transparent" />
          </div>
        )}
        <Container
          className={cn(
            "relative pb-14 text-center sm:pb-20",
            heroImage ? "-mt-20 sm:-mt-24" : "pt-16 sm:pt-24"
          )}
        >
          <div className="mx-auto max-w-xl">
            <h1
              className={cn(
                anton.className,
                "text-balance text-2xl uppercase leading-tight text-white sm:text-3xl"
              )}
            >
              ¡Te estábamos esperando!
            </h1>
            <p className={cn(hind.className, "mt-4 text-base text-white/70")}>
              {settings.firstTimeHeroText}
            </p>
          </div>
        </Container>
      </section>

      {/* Qué esperar */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[1]}>Qué esperar</Eyebrow>
          <PosterHeading>Así es una visita a Inspira</PosterHeading>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {WHAT_TO_EXPECT.map((item, i) => {
              const c = CAMPAIGN_COLORS[(i + 1) % CAMPAIGN_COLORS.length];
              const Icon = item.icon;
              return (
                <div key={item.title}>
                  <Icon className="h-5 w-5" style={{ color: c }} aria-hidden="true" />
                  <h3
                    className={cn(
                      anton.className,
                      "mt-3 text-lg uppercase leading-tight text-white"
                    )}
                  >
                    {item.title}
                  </h3>
                  <p className={cn(hind.className, "mt-2 text-sm text-white/60")}>
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Preguntas / CTA */}
      <section className="bg-black py-16 sm:py-24">
        <Container>
          <div className="max-w-xl">
            <Eyebrow color={CAMPAIGN_COLORS[4]}>¿Tienes preguntas?</Eyebrow>
            <PosterHeading>Escríbenos antes de venir</PosterHeading>
            <p className={cn(hind.className, "mt-5 text-white/70")}>
              Con gusto resolvemos cualquier duda antes de tu visita.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <GoldButton href="/contacto" color={CAMPAIGN_COLORS[4]}>
                Ir a contacto
              </GoldButton>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <span>o escríbenos directo</span>
                <WhatsAppButton
                  variant="inline"
                  message={settings.whatsappMessage}
                  number={settings.whatsappNumber}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
