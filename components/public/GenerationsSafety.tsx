import { Eyebrow } from "@/components/public/cartel";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface GenerationsSafetyProps {
  eyebrow: string;
  title: string;
  principles: string[];
  careGuidelinesUrl?: string;
}

export function GenerationsSafety({ eyebrow, title, principles, careGuidelinesUrl }: GenerationsSafetyProps) {
  return (
    <section className="border-b border-white/10 py-16 sm:py-24" style={{ backgroundColor: "#12332e" }}>
      <Container>
        <div className="grid gap-10 sm:grid-cols-[0.85fr_1.15fr] sm:gap-16">
          <Reveal>
            <Eyebrow color={ABOUT_COLORS.tealLight}>{eyebrow}</Eyebrow>
            <h2 className={cn(anton.className, "mt-5 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-5xl whitespace-pre-line")}>
              {title}
            </h2>
          </Reveal>

          <Reveal delay={120}>
            <ul className="flex flex-col">
              {principles.map((p, i) => (
                <li key={i} className="flex gap-3.5 border-t border-white/15 py-4 text-white/75 last:border-b">
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-1.5 w-1.5 shrink-0"
                    style={{ backgroundColor: ABOUT_COLORS.tealLight }}
                  />
                  <span className={hind.className}>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7">
              {careGuidelinesUrl ? (
                <a
                  href={careGuidelinesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border px-6 py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                  style={{ borderColor: ABOUT_COLORS.tealLight, color: ABOUT_COLORS.tealLight }}
                >
                  Conoce los lineamientos de cuidado
                </a>
              ) : (
                <>
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed border border-white/25 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white/45"
                  >
                    Conoce los lineamientos de cuidado
                  </button>
                  <p className="mt-2.5 text-xs text-white/40">
                    Se activa en cuanto exista el documento real — nunca apunta a un lugar vacío.
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
