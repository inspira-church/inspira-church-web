"use client";

import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { useScrollReveal } from "@/components/public/useScrollReveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import type { AboutValue } from "@/lib/queries/about";
import { cn } from "@/lib/utils";

const VALUE_COLORS = [ABOUT_COLORS.teal, ABOUT_COLORS.coral, ABOUT_COLORS.cream, ABOUT_COLORS.tealLight];

interface ChurchValuesProps {
  eyebrow: string;
  title: string;
  values: AboutValue[];
}

function ValueRow({
  value,
  color,
  align,
}: {
  value: AboutValue;
  color: string;
  align: "left" | "right";
}) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={cn("flex", align === "right" && "justify-end")}>
      <div className={cn("w-full max-w-xl", align === "right" && "text-right")}>
        <div
          className="h-px transition-all duration-700 ease-out motion-reduce:transition-none"
          style={{
            backgroundColor: color,
            width: revealed ? "100%" : "0%",
            marginLeft: align === "right" ? "auto" : undefined,
          }}
        />
        <p
          className={cn(
            anton.className,
            "mt-5 text-3xl uppercase leading-none text-white transition-all duration-700 ease-out motion-reduce:transition-none sm:text-5xl",
            revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
          style={{ color, transitionDelay: "80ms" }}
        >
          {value.title}
        </p>
        <p
          className={cn(
            hind.className,
            "mt-3 max-w-md text-base text-white/65 transition-all duration-700 ease-out motion-reduce:transition-none",
            align === "right" && "ml-auto",
            revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
          style={{ transitionDelay: "160ms" }}
        >
          {value.description}
        </p>
      </div>
    </div>
  );
}

export function ChurchValues({ eyebrow, title, values }: ChurchValuesProps) {
  const visibleValues = values.filter((v) => v.visible && v.title.trim() && v.description.trim());
  if (visibleValues.length === 0) return null;

  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <Eyebrow color={ABOUT_COLORS.coral}>{eyebrow}</Eyebrow>
        <PosterHeading>{title}</PosterHeading>

        <div className="mt-16 flex flex-col gap-12 sm:gap-16">
          {visibleValues.map((value, i) => (
            <ValueRow
              key={`${value.title}-${i}`}
              value={value}
              color={VALUE_COLORS[i % VALUE_COLORS.length]}
              align={i % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
