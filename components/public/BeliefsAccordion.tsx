"use client";

import { useId, useState } from "react";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import type { AboutBelief } from "@/lib/queries/about";
import { ABOUT_COLORS, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface BeliefsAccordionProps {
  eyebrow: string;
  title: string;
  intro: string;
  beliefs: AboutBelief[];
}

function BeliefRow({ belief }: { belief: AboutBelief }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `belief-panel-${id}`;

  return (
    <div className="border-b border-white/15">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span className="text-lg font-semibold uppercase tracking-wide text-white sm:text-xl">
            {belief.category}
          </span>
          <span
            aria-hidden="true"
            className={cn(
              "shrink-0 text-2xl font-light text-white/70 transition-transform duration-300 ease-out",
              open && "rotate-45"
            )}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        className={cn("grid transition-all duration-400 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
      >
        <div className="overflow-hidden">
          <p className={cn(hind.className, "max-w-2xl pb-6 text-base leading-relaxed text-white/80")}>
            {belief.content}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BeliefsAccordion({ eyebrow, title, intro, beliefs }: BeliefsAccordionProps) {
  const visibleBeliefs = beliefs.filter((b) => b.visible && b.content.trim().length > 0);
  if (visibleBeliefs.length === 0) return null;

  return (
    <section className="border-b border-white/10 py-16 sm:py-24" style={{ backgroundColor: ABOUT_COLORS.green }}>
      <Container>
        <Eyebrow color={ABOUT_COLORS.cream}>{eyebrow}</Eyebrow>
        <PosterHeading>{title}</PosterHeading>
        <p className={cn(hind.className, "mt-5 max-w-xl text-base text-white/80")}>{intro}</p>

        <div className="mt-12 border-t border-white/15">
          {visibleBeliefs.map((belief) => (
            <BeliefRow key={belief.category} belief={belief} />
          ))}
        </div>
      </Container>
    </section>
  );
}
