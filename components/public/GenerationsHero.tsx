import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GenerationsHeroProps {
  eyebrow: string;
  title: string;
  taglineWhite: string;
  taglineCoral: string;
  verseText: string;
  verseRef: string;
  photoUrl?: string | null;
}

/**
 * Palabra de fondo gigante, con una deriva horizontal lenta — puramente CSS
 * (sin listener de scroll), y `motion-reduce:animate-none` la detiene por
 * completo si el usuario prefiere menos movimiento. `mix-blend-overlay`
 * hace que el blanco reaccione al color de la foto de fondo (se aclara
 * sobre zonas oscuras, se oscurece sobre zonas claras) en vez de un blanco
 * plano que puede perderse según qué foto suba el admin — sigue siendo
 * perceptible sin importar los colores de la imagen.
 */
function LegadoBackdrop() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        anton.className,
        "pointer-events-none absolute left-[8%] top-1/2 whitespace-nowrap text-[6rem] uppercase text-white mix-blend-overlay sm:text-[12rem] lg:text-[18rem]",
        "animate-[generations-legado-drift_42s_linear_infinite] motion-reduce:animate-none motion-reduce:opacity-[0.06] motion-reduce:-translate-y-1/2"
      )}
    >
      Legado
    </span>
  );
}

export function GenerationsHero({
  eyebrow,
  title,
  taglineWhite,
  taglineCoral,
  verseText,
  verseRef,
  photoUrl,
}: GenerationsHeroProps) {
  return (
    <section className="relative flex min-h-[92svh] flex-col overflow-hidden border-b border-white/10 bg-black pb-12 pt-24 sm:min-h-screen sm:pb-16">
      <div className="absolute inset-0 z-0">
        <GenerationsPhotoSlot
          photoUrl={photoUrl}
          label="Foto — niños y jóvenes sirviendo"
          tint={ABOUT_COLORS.tealLight}
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 45%, #000 100%)" }}
        />
      </div>

      {/* Ocupa exactamente el espacio entre el borde superior de la foto y el
          bloque de texto de abajo — LEGADO se centra dentro de este bloque
          (top-1/2 + translateY(-50%) en el propio span), sin depender de un
          top-% fijo que se rompería en distintos alto de viewport/contenido. */}
      <div className="relative z-[5] flex-1">
        <LegadoBackdrop />
      </div>

      <Container className="relative z-10">
        <p className="inline-block border border-[#508A8C] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#508A8C]">
          {eyebrow}
        </p>
        <h1
          className={cn(
            anton.className,
            "mt-5 text-balance text-[3.4rem] uppercase leading-[0.98] sm:text-[6.5rem] lg:text-[9rem]",
            "animate-[generations-title-shimmer_9s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
          )}
          style={{
            backgroundImage:
              "linear-gradient(100deg, #00545E 0%, #266C62 12.5%, #508A8C 25%, #58978F 37.5%, #FFFFFF 50%, #58978F 62.5%, #508A8C 75%, #266C62 87.5%, #00545E 100%)",
            backgroundSize: "260% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {title}
        </h1>
        <p
          className={cn(
            anton.className,
            "mt-6 max-w-[18ch] text-balance text-2xl uppercase leading-[1.08] text-white sm:text-4xl"
          )}
        >
          {taglineWhite} <span style={{ color: ABOUT_COLORS.tealLight }}>{taglineCoral}</span>
        </p>
        <blockquote
          className={cn(
            hind.className,
            "mt-7 max-w-md border-l-2 pl-4 text-sm italic text-white/50 sm:text-base"
          )}
          style={{ borderColor: ABOUT_COLORS.tealLight }}
        >
          «{verseText}»
          <cite className="mt-2 block text-xs not-italic uppercase tracking-widest text-white/30">
            {verseRef}
          </cite>
        </blockquote>
      </Container>
    </section>
  );
}
