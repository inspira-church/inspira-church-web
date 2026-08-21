"use client";

import { useRef, useState } from "react";
import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

interface AreaGroup {
  label?: string;
  age: string;
  when: string;
  practice?: string;
}

interface Area {
  id: string;
  name: string;
  tags: string;
  tint: string;
  span: string;
  groups: AreaGroup[];
  purpose: string;
}

/** Edades y horarios tal como están definidos hoy — nada inventado; donde aún no hay dato se deja "Por definir". */
const AREAS: Area[] = [
  {
    id: "alabanza",
    name: "Alabanza",
    tags: "Adoración · Disciplina · Sensibilidad",
    tint: ABOUT_COLORS.coral,
    span: "col-span-2 row-span-2 sm:col-span-3 sm:row-span-2",
    groups: [
      { label: "Voces", age: "Por definir", when: "Sábado · 9:00–11:00 a. m.", practice: "45 min al día" },
      { label: "Instrumentos", age: "8 años (sugerido)", when: "Sábado · 9:00–11:00 a. m.", practice: "Aprox. 1 hora al día" },
    ],
    purpose: "Adorar con excelencia y guiar a la congregación a encontrarse con la presencia de Dios.",
  },
  {
    id: "medios",
    name: "Medios",
    tags: "Creatividad · Técnica · Concentración",
    tint: ABOUT_COLORS.tealLight,
    span: "col-span-2 sm:col-span-3",
    groups: [{ age: "10 años (sugerido)", when: "Preparación el sábado previo" }],
    purpose: "Contar la historia de lo que Dios hace, con excelencia técnica y sensibilidad creativa.",
  },
  {
    id: "teatro",
    name: "Teatro",
    tags: "Expresión · Creatividad · Confianza",
    tint: ABOUT_COLORS.cream,
    span: "row-span-2 sm:col-span-1 sm:row-span-2",
    groups: [{ age: "4 años", when: "Primer y tercer sábado · 9:00–11:00 a. m." }],
    purpose: "Enseñar verdades de Dios a través de la expresión artística y corporal.",
  },
  {
    id: "real-love",
    name: "Real Love",
    tags: "Hospitalidad · Empatía · Servicio",
    tint: "#c9603b",
    span: "sm:col-span-2",
    groups: [{ age: "6 años", when: "Preparación breve antes del servicio" }],
    purpose: "Ser el primer rostro que recibe a cada familia que llega, con calidez y atención genuina.",
  },
  {
    id: "kids",
    name: "Kids",
    tags: "Paciencia · Enseñanza · Acompañamiento",
    tint: ABOUT_COLORS.teal,
    span: "sm:col-span-2",
    groups: [{ age: "10 años (sugerido)", when: "Preparación el sábado previo" }],
    purpose: "Acompañar a los más pequeños con paciencia, enseñando la Palabra de forma que puedan entenderla.",
  },
  {
    id: "logistica",
    name: "Logística",
    tags: "Orden · Atención · Equipo",
    tint: "#5b5b58",
    span: "",
    groups: [{ age: "8 años", when: "Día del servicio · llegada 9:00 a. m." }],
    purpose: "Cuidar los detalles que hacen que todo funcione: orden, atención y trabajo en equipo.",
  },
  {
    id: "cafeteria",
    name: "Cafetería",
    tags: "Servicio · Cuidado",
    tint: ABOUT_COLORS.cream,
    span: "",
    groups: [{ age: "8 años", when: "Día del servicio · llegada 9:00 a. m." }],
    purpose: "Servir con calidez algo tan sencillo como un café, y hacer sentir a alguien bienvenido.",
  },
  {
    id: "anuncios",
    name: "Anuncios",
    tags: "Comunicación · Confianza",
    tint: ABOUT_COLORS.tealLight,
    span: "",
    groups: [{ age: "8 años", when: "Día del servicio + ensayo previo" }],
    purpose: "Comunicar con claridad lo que la iglesia necesita saber, con seguridad y buena dicción.",
  },
  {
    id: "diezmos",
    name: "Diezmos",
    tags: "Mayordomía · Honra",
    tint: ABOUT_COLORS.coral,
    span: "",
    groups: [{ age: "8 años", when: "Día del servicio · llegada 9:00 a. m." }],
    purpose: "Aprender mayordomía sirviendo con honestidad en una de las áreas de mayor confianza.",
  },
];

function AreaTile({ area, onOpen }: { area: Area; onOpen: (area: Area) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(area)}
      className={cn(
        "group relative overflow-hidden border border-white/10 bg-[#141414] text-left transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        area.span
      )}
    >
      <GenerationsPhotoSlot label="" tint={area.tint} className="transition-transform duration-400 ease-out group-hover:scale-105" />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.92) 100%)" }}
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[--tint] opacity-0 mix-blend-multiply transition-opacity duration-300 ease-out group-hover:opacity-20"
        style={{ ["--tint" as string]: area.tint }}
      />
      <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/30 text-sm text-white/70">
        +
      </span>
      <div className="absolute inset-x-4 bottom-3.5">
        <p className={cn(anton.className, "text-lg uppercase leading-none text-white sm:text-2xl")}>{area.name}</p>
        <p className="mt-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.coral }}>
          {area.tags}
        </p>
      </div>
    </button>
  );
}

export function GenerationsAreas() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Area | null>(null);

  function openArea(area: Area) {
    setSelected(area);
    dialogRef.current?.showModal();
  }

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
      <Container>
        <Reveal className="max-w-xl">
          <h2 className={cn(anton.className, "text-balance text-4xl uppercase leading-[0.95] text-white sm:text-6xl")}>
            Descubre tu lugar
          </h2>
          <p className={cn(hind.className, "mt-4 text-lg text-white/70")}>
            Cada área es una oportunidad para servir, aprender y descubrir los dones que Dios ha
            puesto en cada niño y joven. Toca cualquiera para ver los detalles.
          </p>
        </Reveal>

        <Reveal delay={150} className="mt-10 grid auto-rows-[120px] grid-cols-2 gap-2.5 sm:mt-14 sm:auto-rows-[110px] sm:grid-cols-6">
          {AREAS.map((area) => (
            <AreaTile key={area.id} area={area} onOpen={openArea} />
          ))}
        </Reveal>
      </Container>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="fixed left-1/2 top-1/2 m-0 w-[calc(100vw-2.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-white/10 bg-[#141414] p-0 text-white backdrop:bg-black/80"
        aria-labelledby="generations-area-name"
      >
        {selected && (
          <div className="relative p-7 sm:p-8">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="absolute right-5 top-5 text-2xl leading-none text-white/60 transition-colors hover:text-white"
            >
              ×
            </button>
            <p id="generations-area-name" className={cn(anton.className, "pr-8 text-2xl uppercase text-white sm:text-3xl")}>
              {selected.name}
            </p>
            <p className="mt-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.coral }}>
              {selected.tags}
            </p>

            <div className="mt-6 space-y-5">
              {selected.groups.map((g, i) => (
                <dl key={i} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
                  {g.label && (
                    <p className={cn(anton.className, "col-span-2 text-base uppercase text-white/90")}>{g.label}</p>
                  )}
                  <dt className="text-white/45">Edad</dt>
                  <dd>{g.age}</dd>
                  <dt className="text-white/45">Horario</dt>
                  <dd>{g.when}</dd>
                  {g.practice && (
                    <>
                      <dt className="text-white/45">Práctica</dt>
                      <dd>{g.practice}</dd>
                    </>
                  )}
                </dl>
              ))}
            </div>

            <p className={cn(hind.className, "mt-5 border-t border-white/10 pt-5 text-sm leading-relaxed text-white/75")}>
              {selected.purpose}
            </p>
            <p className="mt-4 text-xs text-white/40">
              La edad es una guía — puede ajustarse según madurez, habilidades y la evaluación del
              equipo de líderes.
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}
