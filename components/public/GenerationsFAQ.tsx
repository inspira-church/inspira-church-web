"use client";

import { useId, useState } from "react";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { anton, hind } from "@/lib/fonts";
import type { GenerationsFaqItem } from "@/lib/queries/generations";
import { cn } from "@/lib/utils";

interface GenerationsFAQProps {
  title: string;
  items: GenerationsFaqItem[];
}

function FAQRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const panelId = `generations-faq-${id}`;

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
          <span
            className="text-base font-medium transition-colors duration-300 ease-out sm:text-lg"
            style={{ color: open ? "#FF7F50" : "#FFFFFF" }}
          >
            {q}
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
          <p className={cn(hind.className, "max-w-2xl pb-6 text-base leading-relaxed text-white/70")}>{a}</p>
        </div>
      </div>
    </div>
  );
}

export function GenerationsFAQ({ title, items }: GenerationsFAQProps) {
  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <Reveal>
          <h2 className={cn(anton.className, "text-balance text-3xl uppercase leading-[0.95] text-white sm:text-5xl")}>
            {title}
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10 max-w-3xl border-t border-white/15 sm:mt-14">
          {items.map((item, i) => (
            <FAQRow key={i} q={item.q} a={item.a} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
