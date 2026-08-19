import { GoldButton } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface AboutCTAProps {
  title: string;
  text: string;
}

export function AboutCTA({ title, text }: AboutCTAProps) {
  return (
    <section className="bg-black py-20 text-center sm:py-32">
      <Container>
        <p
          className={cn(
            anton.className,
            "mx-auto max-w-2xl text-balance text-3xl uppercase leading-[1.05] text-white sm:text-5xl"
          )}
        >
          {title}
        </p>
        <p className={cn(hind.className, "mx-auto mt-5 max-w-md text-lg text-white/70")}>{text}</p>
        <div className="mt-10 flex justify-center">
          <GoldButton href="/contacto" color={ABOUT_COLORS.coral}>
            Quiero visitar Inspira
          </GoldButton>
        </div>
      </Container>
    </section>
  );
}
