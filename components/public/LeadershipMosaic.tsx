"use client";

import Image from "next/image";
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

/** Mosaico editorial: cada 4º elemento ocupa el doble de espacio para romper la cuadrícula sin perder alineación. */
function LeaderTile({ member, color, large }: { member: LeaderTileData; color: string; large: boolean }) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden bg-[#0d0d0d] transition-all duration-500 ease-out motion-reduce:transition-none",
        large && "col-span-2 row-span-2",
        revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      {member.photoUrl && (
        <Image
          src={member.photoUrl}
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
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className={cn(anton.className, "text-base uppercase leading-tight text-white", large && "text-xl")}>
          {member.fullName}
        </p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
          {member.roleTitle}
        </p>
      </div>
    </div>
  );
}

export function LeadershipMosaic({ members }: { members: LeaderTileData[] }) {
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
          {members.map((member, i) => (
            <LeaderTile
              key={member.id}
              member={member}
              color={TILE_COLORS[i % TILE_COLORS.length]}
              large={i % 4 === 0}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
