import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GenerationsFamiliesProps {
  title: string;
  text: string;
  parentsGuideUrl?: string;
  photoUrl?: string | null;
}

export function GenerationsFamilies({ title, text, parentsGuideUrl, photoUrl }: GenerationsFamiliesProps) {
  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 sm:items-center sm:gap-16">
          <Reveal className="relative aspect-[4/5] overflow-hidden">
            <GenerationsPhotoSlot photoUrl={photoUrl} label="Foto — familia acompañando" tint={ABOUT_COLORS.cream} />
          </Reveal>

          <Reveal delay={120}>
            <h2 className={cn(anton.className, "text-balance text-3xl uppercase leading-[0.95] text-white sm:text-5xl whitespace-pre-line")}>
              {title}
            </h2>
            <p className={cn(hind.className, "mt-5 max-w-[48ch] text-lg text-white/70")}>{text}</p>
            <div className="mt-7">
              {parentsGuideUrl ? (
                <a
                  href={parentsGuideUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border border-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white"
                  style={{ borderColor: ABOUT_COLORS.coral, color: ABOUT_COLORS.coral }}
                >
                  Conoce la guía para padres
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed border border-white/20 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/40"
                  >
                    Conoce la guía para padres
                  </button>
                  <p className="mt-2.5 text-xs text-white/40">
                    Este botón se activa solo en cuanto exista la guía real — nunca lleva a un enlace
                    vacío.
                  </p>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
