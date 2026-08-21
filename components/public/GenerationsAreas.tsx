"use client";

import { useRef, useState } from "react";
import { GenerationsPhotoSlot } from "@/components/public/GenerationsPhotoSlot";
import { Reveal } from "@/components/public/Reveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import type { GenerationsArea } from "@/lib/queries/generations";
import { cn } from "@/lib/utils";

interface GenerationsAreasProps {
  title: string;
  intro: string;
  areas: GenerationsArea[];
  photoByAreaId: Record<string, string | undefined>;
}

/**
 * Color y tamaño de grilla de cada tarjeta se quedan fijos en código, no en
 * el panel (mismo principio que el resto del CMS: diseño en código,
 * contenido en admin) — mapeados por el id estable de cada área. Un área
 * nueva creada desde el admin (id no reconocido aquí) cae a un color de la
 * paleta rotativo y ocupa una sola celda — nunca rompe el layout.
 */
const AREA_STYLE: Record<string, { tint: string; span: string }> = {
  alabanza: { tint: ABOUT_COLORS.coral, span: "col-span-2 row-span-2 sm:col-span-3 sm:row-span-2" },
  medios: { tint: ABOUT_COLORS.tealLight, span: "col-span-2 sm:col-span-3" },
  teatro: { tint: ABOUT_COLORS.cream, span: "row-span-2 sm:col-span-1 sm:row-span-2" },
  "real-love": { tint: "#c9603b", span: "sm:col-span-2" },
  kids: { tint: ABOUT_COLORS.teal, span: "sm:col-span-2" },
  logistica: { tint: "#5b5b58", span: "" },
  cafeteria: { tint: ABOUT_COLORS.cream, span: "" },
  anuncios: { tint: ABOUT_COLORS.tealLight, span: "" },
  diezmos: { tint: ABOUT_COLORS.coral, span: "" },
};

const FALLBACK_TINTS = [ABOUT_COLORS.coral, ABOUT_COLORS.tealLight, ABOUT_COLORS.cream, ABOUT_COLORS.teal];

function styleForArea(id: string, index: number) {
  return AREA_STYLE[id] ?? { tint: FALLBACK_TINTS[index % FALLBACK_TINTS.length], span: "" };
}

function AreaTile({
  area,
  style,
  photoUrl,
  onOpen,
}: {
  area: GenerationsArea;
  style: { tint: string; span: string };
  photoUrl: string | undefined;
  onOpen: (area: GenerationsArea) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(area)}
      className={cn(
        "group relative overflow-hidden border border-white/10 bg-[#141414] text-left transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
        style.span
      )}
    >
      <GenerationsPhotoSlot
        photoUrl={photoUrl}
        label=""
        tint={style.tint}
        className="transition-transform duration-400 ease-out group-hover:scale-105"
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.92) 100%)" }}
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[--tint] opacity-0 mix-blend-multiply transition-opacity duration-300 ease-out group-hover:opacity-20"
        style={{ ["--tint" as string]: style.tint }}
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

export function GenerationsAreas({ title, intro, areas, photoByAreaId }: GenerationsAreasProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<GenerationsArea | null>(null);

  function openArea(area: GenerationsArea) {
    setSelected(area);
    dialogRef.current?.showModal();
  }

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
      <Container>
        <Reveal className="max-w-xl">
          <h2 className={cn(anton.className, "text-balance text-4xl uppercase leading-[0.95] text-white sm:text-6xl")}>
            {title}
          </h2>
          <p className={cn(hind.className, "mt-4 text-lg text-white/70")}>{intro}</p>
        </Reveal>

        <Reveal delay={150} className="mt-10 grid auto-rows-[120px] grid-cols-2 gap-2.5 sm:mt-14 sm:auto-rows-[110px] sm:grid-cols-6">
          {areas.map((area, i) => (
            <AreaTile
              key={area.id}
              area={area}
              style={styleForArea(area.id, i)}
              photoUrl={photoByAreaId[area.id]}
              onOpen={openArea}
            />
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
