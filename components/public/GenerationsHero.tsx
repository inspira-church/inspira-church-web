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
 * Palabra de fondo gigante y muy tenue, con una deriva horizontal lenta —
 * puramente CSS (sin listener de scroll), y `motion-reduce:animate-none`
 * la detiene por completo si el usuario prefiere menos movimiento.
 */
function LegadoBackdrop() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        anton.className,
        "pointer-events-none absolute left-[-4%] top-[8%] whitespace-nowrap text-[6rem] uppercase text-white opacity-[0.05] sm:text-[12rem] lg:text-[18rem]",
        "animate-[generations-legado-drift_46s_linear_infinite] motion-reduce:animate-none"
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
    <section className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden border-b border-white/10 bg-black pb-12 pt-24 sm:min-h-screen sm:pb-16">
      <div className="absolute inset-0 z-0">
        <GenerationsPhotoSlot
          photoUrl={photoUrl}
          label="Foto — niños y jóvenes sirviendo"
          tint={ABOUT_COLORS.coral}
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.55) 45%, #000 100%)" }}
        />
      </div>

      <LegadoBackdrop />

      <Container className="relative z-10">
        <p className="inline-block border border-[#FF7F50] px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#FF7F50]">
          {eyebrow}
        </p>
        <h1
          className={cn(
            anton.className,
            "mt-5 text-balance text-[3.4rem] uppercase leading-[0.86] text-white sm:text-[6.5rem] lg:text-[9rem]"
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            anton.className,
            "mt-6 max-w-[18ch] text-balance text-2xl uppercase leading-[1.08] text-white sm:text-4xl"
          )}
        >
          {taglineWhite} <span style={{ color: ABOUT_COLORS.coral }}>{taglineCoral}</span>
        </p>
        <blockquote
          className={cn(
            hind.className,
            "mt-7 max-w-md border-l-2 pl-4 text-sm italic text-white/50 sm:text-base"
          )}
          style={{ borderColor: ABOUT_COLORS.coral }}
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
