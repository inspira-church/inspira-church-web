"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { useScrollReveal } from "@/components/public/useScrollReveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export interface LeaderTileData {
  id: string;
  fullName: string;
  roleTitle: string;
  photoUrl: string | null;
}

const TILE_COLORS = [
  ABOUT_COLORS.teal,
  ABOUT_COLORS.coral,
  ABOUT_COLORS.tealLight,
  ABOUT_COLORS.cream,
  ABOUT_COLORS.orange,
];

/**
 * Un solo lugar para los tiempos del mosaico — el fundido usa exactamente
 * FADE_MS tanto en la transición CSS (inline, para no depender de que una
 * clase de Tailwind coincida con este número) como en el timer de React
 * que cambia el contenido a mitad del fundido, así nunca se desincronizan.
 * FADE_MIN_OPACITY nunca llega a 0: la foto solo se atenúa, nunca
 * desaparece del todo, para que el cambio se sienta como un disolvido
 * suave y no como un parpadeo.
 */
const ROTATE_INTERVAL_MS = 12000;
const FADE_MS = 4000;
// Baja casi hasta el fondo (no del todo, para no verse como un apagón) —
// un 70% se nota poco y deja ver el cambio de foto a mitad de camino, que
// es justo lo brusco que se quería evitar. Atenuando bien el momento del
// cruce queda oculto, y el efecto se percibe como un disolvido real.
const FADE_MIN_OPACITY = 0.12;
const FADE_TRANSITION_STYLE = { transitionDuration: `${FADE_MS}ms` };

/**
 * Mosaico editorial: el cuadro (tamaño, posición, color, `large`) es fijo
 * por posición y nunca se mueve — solo el contenido (foto, nombre, cargo)
 * rota entre líderes con el tiempo, con su propio fundido. Así la
 * transición la hacen las fotos, no la cuadrícula.
 */
function LeaderTile({ member, color, large }: { member: LeaderTileData; color: string; large: boolean }) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  const [shown, setShown] = useState(member);
  // Derivado, no estado propio: en cuanto `member` (la prop) difiere de lo
  // que se está mostrando, el div ya pinta la opacidad atenuada ese mismo
  // render — la transición CSS anima ese cambio sola. A mitad del fundido
  // (FADE_MS / 2) `shown` se actualiza y `fading` vuelve a false, mismo
  // mecanismo para el fundido de entrada — el cruce ocurre en el punto más
  // tenue, nunca se ve el salto de una foto a otra.
  const fading = member.id !== shown.id;

  useEffect(() => {
    if (!fading) return;
    const timeout = window.setTimeout(() => setShown(member), FADE_MS / 2);
    return () => window.clearTimeout(timeout);
  }, [fading, member]);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden bg-[#0d0d0d] transition-all duration-500 ease-out motion-reduce:transition-none",
        large && "col-span-2 row-span-2",
        revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <div
        className="absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none"
        style={{ ...FADE_TRANSITION_STYLE, opacity: fading ? FADE_MIN_OPACITY : 1 }}
      >
        {shown.photoUrl && (
          <Image
            src={shown.photoUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes={large ? "(min-width: 640px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.85) 100%)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className={cn(anton.className, "text-base uppercase leading-tight text-white", large && "text-xl")}>
            {shown.fullName}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
            {shown.roleTitle}
          </p>
        </div>
      </div>
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} aria-hidden="true" />
    </div>
  );
}

export function LeadershipMosaic({ members }: { members: LeaderTileData[] }) {
  // Cada posición (slot) es fija: el slot 0 siempre es "large", el color de
  // cada slot nunca cambia. `offset` decide qué líder se muestra en cada
  // slot en este momento — una rotación tipo "sillas musicales" sin
  // repetir a nadie, que avanza cada pocos segundos.
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (members.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % members.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [members.length]);

  if (members.length === 0) return null;

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
      <Container>
        <Eyebrow color={ABOUT_COLORS.tealLight}>Personas que sirven</Eyebrow>
        <PosterHeading>Lideramos sirviendo</PosterHeading>

        <div
          className="mt-12 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:grid-cols-4 sm:gap-4"
          style={{ gridAutoFlow: "dense" }}
        >
          {members.map((_, slot) => (
            <LeaderTile
              key={slot}
              member={members[(slot + offset) % members.length]}
              color={TILE_COLORS[slot % TILE_COLORS.length]}
              large={slot === 0}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
