"use client";

import { useId, useState } from "react";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "¿Y si mi hijo nunca ha servido o no tiene experiencia?",
    a: "No hay ningún problema — todos empiezan por algún lado. Durante el primer semestre cada niño o joven explora distintas áreas acompañado por los líderes, sin necesitar experiencia previa.",
  },
  {
    q: "¿Puede cambiar de área?",
    a: "Sí. La etapa de exploración existe justamente para eso: descubrir dónde encajan mejor sus dones antes de conformar los equipos base del segundo semestre.",
  },
  {
    q: "¿Qué pasa si tenemos un viaje o no podemos asistir?",
    a: "Entendemos que cada familia tiene su propio ritmo. Avisa a los líderes del área y retomen el proceso cuando puedan volver, sin ninguna presión.",
  },
  {
    q: "¿Puede participar si es tímido?",
    a: "Por supuesto. Hay áreas que se acomodan bien a personalidades más reservadas, y todo el proceso respeta el tiempo de cada niño o joven.",
  },
  {
    q: "¿Tiene algún costo?",
    a: "No. Participar en Generaciones no tiene ningún costo para la familia.",
  },
  {
    q: "¿Qué pasa si tiene una condición especial?",
    a: "Cuéntanos con anticipación. Junto a la familia buscamos la forma en que cada niño o joven pueda servir de manera segura y significativa.",
  },
];

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
          <span className="text-base font-medium text-white sm:text-lg">{q}</span>
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

export function GenerationsFAQ() {
  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <Reveal>
          <h2 className={cn(anton.className, "text-balance text-3xl uppercase leading-[0.95] text-white sm:text-5xl")}>
            ¿Tienes preguntas?
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10 max-w-3xl border-t border-white/15 sm:mt-14">
          {FAQ_ITEMS.map((item) => (
            <FAQRow key={item.q} q={item.q} a={item.a} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
