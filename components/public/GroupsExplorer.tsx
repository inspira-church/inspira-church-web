"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { GroupCard } from "@/components/public/GroupCard";
import { CAMPAIGN_COLORS } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { GrowthGroup } from "@/types/content";

const GroupsMap = dynamic(
  () => import("@/components/public/GroupsMap").then((m) => m.GroupsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-white/50">
        Cargando mapa…
      </div>
    ),
  }
);

interface GroupsExplorerProps {
  groups: GrowthGroup[];
}

const BOGOTA_CENTER: [number, number] = [4.65, -74.09];

export function GroupsExplorer({ groups }: GroupsExplorerProps) {
  const [view, setView] = useState<"tarjetas" | "mapa">("tarjetas");

  const groupsOnMap = groups.filter(
    (g): g is GrowthGroup & { latApprox: number; lngApprox: number } =>
      g.latApprox !== null && g.lngApprox !== null
  );

  return (
    <div>
      <div
        role="tablist"
        aria-label="Vista de grupos"
        className="inline-flex rounded-md border border-white/15 p-1"
      >
        {(["tarjetas", "mapa"] as const).map((option) => (
          <button
            key={option}
            role="tab"
            aria-selected={view === option}
            onClick={() => setView(option)}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors",
              view === option
                ? "bg-[#FF7F50] text-black"
                : "text-white/60 hover:text-white"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="mt-10 border border-dashed border-white/15 bg-black px-8 py-14 text-center">
          <p className="text-white/50">
            No encontramos grupos con esos filtros. Prueba quitando alguno.
          </p>
        </div>
      ) : view === "tarjetas" ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group, i) => (
            <GroupCard
              key={group.id}
              slug={group.slug}
              name={group.name}
              groupType={group.groupType}
              dayOfWeek={group.dayOfWeek}
              timeOfDay={group.timeOfDay}
              locality={group.locality}
              sector={group.sector}
              leaderFullName={group.leaderFullName}
              accentColor={CAMPAIGN_COLORS[(i + 3) % CAMPAIGN_COLORS.length]}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 h-[480px] overflow-hidden border border-white/10">
          <GroupsMap
            center={BOGOTA_CENTER}
            groups={groupsOnMap.map((g) => ({
              slug: g.slug,
              name: g.name,
              lat: g.latApprox,
              lng: g.lngApprox,
              sector: g.sector,
            }))}
          />
        </div>
      )}
    </div>
  );
}
