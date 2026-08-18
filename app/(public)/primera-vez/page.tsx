import type { Metadata } from "next";
import { BookOpen, Handshake, HandHeart, Sparkles, Sprout, Users } from "lucide-react";
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

const GROWTH_PATH = [
  {
    num: "01",
    icon: Handshake,
    color: "#508A8C",
    title: "Conéctate",
    description:
      "Conoce personas, construye amistades y empieza a caminar en comunidad. No tienes que crecer solo.",
  },
  {
    num: "02",
    icon: Sprout,
    color: "#D2431B",
    title: "Crece",
    description:
      "Conoce más de Dios, fortalece tu fe y avanza en un proceso que afirmará tu identidad y tu propósito.",
  },
  {
    num: "03",
    icon: BookOpen,
    color: "#266C62",
    title: "Avanza",
    description:
      "En los grupos de crecimiento y en los cursos de formación encontrarás espacios que te ayudarán a profundizar en la Palabra y vivir tu fe con mayor convicción.",
  },
];

const WHAT_TO_EXPECT = [
  {
    num: "01",
    icon: Sparkles,
    title: "Ven como estás",
    description: "No hay un código de vestimenta — ven cómodo, tal como eres.",
  },
  {
    num: "02",
    icon: HandHeart,
    title: "Un tiempo de adoración",
    description:
      "Alabamos, oramos y escuchamos una enseñanza basada en la Biblia, práctica para la vida diaria.",
  },
  {
    num: "03",
    icon: Users,
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

      {/* Tu camino con nosotros */}
      <section className="border-b border-white/10 bg-black py-16 sm:py-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[0]}>Tu camino con nosotros</Eyebrow>
          <p className={cn(hind.className, "mt-5 max-w-2xl text-base text-white/70")}>
            Ya sea que nos visites por primera vez o que estés buscando una comunidad para
            crecer, aquí encontrarás diferentes maneras de dar tus primeros pasos con nosotros.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {GROWTH_PATH.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden border border-white/10 bg-[#0d0d0d] p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/25"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      anton.className,
                      "pointer-events-none absolute right-3 top-3 select-none text-5xl leading-none text-[#008080] opacity-[0.18] transition-opacity duration-300 ease-out group-hover:opacity-[0.28]"
                    )}
                  >
                    {item.num}
                  </span>

                  <div className="relative">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: item.color }}
                    >
                      <Icon className="h-5 w-5 text-black" aria-hidden="true" />
                    </div>
                    <h3
                      className={cn(
                        anton.className,
                        "mt-6 text-xl uppercase leading-tight text-white"
                      )}
                    >
                      {item.title}
                    </h3>
                    <p className={cn(hind.className, "mt-3 text-sm leading-relaxed text-white/60")}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Qué esperar — recorrido, no tarjetas */}
      <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <Eyebrow color={CAMPAIGN_COLORS[1]}>Qué esperar</Eyebrow>
          <PosterHeading>Lo que vivirás en Inspira</PosterHeading>

          <div className="relative mt-20">
            {/* conector horizontal — solo escritorio, donde los 3 puntos quedan en línea */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-[5px] hidden h-px bg-white/10 sm:block"
            />

            <div className="grid grid-cols-1 gap-16 sm:grid-cols-3 sm:gap-10">
              {WHAT_TO_EXPECT.map((item, i) => {
                const c = CAMPAIGN_COLORS[(i + 1) % CAMPAIGN_COLORS.length];
                const Icon = item.icon;
                const isLast = i === WHAT_TO_EXPECT.length - 1;
                return (
                  <div key={item.title} className="group relative flex flex-col items-center text-center">
                    {/* conector vertical — solo móvil, limitado al espacio entre bloques (nunca cruza el texto) */}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        className="absolute -bottom-16 left-1/2 h-16 w-px -translate-x-1/2 bg-white/10 sm:hidden"
                      />
                    )}

                    {/* punto de anclaje sobre el conector */}
                    <span
                      aria-hidden="true"
                      className="relative z-10 h-[9px] w-[9px] shrink-0 rounded-full ring-4 ring-[#0d0d0d] transition-transform duration-300 ease-out group-hover:scale-125"
                      style={{ backgroundColor: c }}
                    />

                    <span
                      className={cn(anton.className, "mt-6 text-sm tracking-[0.25em]")}
                      style={{ color: c }}
                    >
                      {item.num}
                    </span>

                    <Icon
                      className="mt-4 h-9 w-9 transition-all duration-300 ease-out group-hover:-translate-y-1"
                      style={{ color: c }}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />

                    <h3
                      className={cn(
                        anton.className,
                        "mt-5 text-xl uppercase leading-tight text-white"
                      )}
                    >
                      {item.title}
                    </h3>
                    <p className={cn(hind.className, "mx-auto mt-3 max-w-[15rem] text-sm leading-relaxed text-white/60")}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
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
