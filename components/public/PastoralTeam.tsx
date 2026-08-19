"use client";

import Image from "next/image";
import { useRef } from "react";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { useScrollReveal } from "@/components/public/useScrollReveal";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export interface PastoralTeamMember {
  id: string;
  fullName: string;
  roleTitle: string;
  photoUrl: string | null;
  bio: string | null;
}

const ROW_COLORS = [ABOUT_COLORS.coral, ABOUT_COLORS.teal, ABOUT_COLORS.tealLight, ABOUT_COLORS.orange];

function PastorRow({
  member,
  color,
  reversed,
}: {
  member: PastoralTeamMember;
  color: string;
  reversed: boolean;
}) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const hasBio = Boolean(member.bio && member.bio.trim().length > 0);

  return (
    <div
      ref={ref}
      className={cn(
        "grid items-center gap-8 transition-all duration-700 ease-out motion-reduce:transition-none sm:grid-cols-2 sm:gap-12",
        revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className={cn("relative aspect-[4/5] w-full overflow-hidden bg-[#0d0d0d]", reversed && "sm:order-2")}>
        {member.photoUrl && (
          <Image
            src={member.photoUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        )}
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      </div>

      <div className={cn(reversed && "sm:order-1")}>
        <p className={cn(anton.className, "text-2xl uppercase leading-tight text-white sm:text-3xl")}>
          {member.fullName}
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest" style={{ color }}>
          {member.roleTitle}
        </p>
        {hasBio && (
          <>
            <button
              type="button"
              onClick={() => dialogRef.current?.showModal()}
              className="mt-5 text-sm font-bold uppercase tracking-wide text-white/70 transition-colors hover:text-white"
            >
              Conocer su historia →
            </button>
            <dialog
              ref={dialogRef}
              onClick={(e) => {
                if (e.target === dialogRef.current) dialogRef.current?.close();
              }}
              className="fixed left-1/2 top-1/2 m-0 w-[calc(100vw-2.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-white/10 bg-[#0d0d0d] p-0 text-white backdrop:bg-black/80"
              aria-labelledby={`pastor-name-${member.id}`}
            >
              <div className="relative p-8">
                <button
                  type="button"
                  onClick={() => dialogRef.current?.close()}
                  aria-label="Cerrar"
                  className="absolute right-5 top-5 text-2xl leading-none text-white/60 transition-colors hover:text-white"
                >
                  ×
                </button>
                <p id={`pastor-name-${member.id}`} className={cn(anton.className, "pr-8 text-2xl uppercase text-white")}>
                  {member.fullName}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-widest" style={{ color }}>
                  {member.roleTitle}
                </p>
                <p className={cn(hind.className, "mt-5 text-base leading-relaxed text-white/75")}>
                  {member.bio}
                </p>
              </div>
            </dialog>
          </>
        )}
      </div>
    </div>
  );
}

export function PastoralTeam({ members }: { members: PastoralTeamMember[] }) {
  if (members.length === 0) return null;

  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <Eyebrow color={ABOUT_COLORS.coral}>Quienes nos acompañan</Eyebrow>
        <PosterHeading>Nuestro equipo pastoral</PosterHeading>

        <div className="mt-16 flex flex-col gap-16 sm:gap-20">
          {members.map((member, i) => (
            <PastorRow
              key={member.id}
              member={member}
              color={ROW_COLORS[i % ROW_COLORS.length]}
              reversed={i % 2 === 1}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
