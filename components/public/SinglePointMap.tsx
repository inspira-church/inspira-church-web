"use client";

import dynamic from "next/dynamic";

const GroupsMap = dynamic(
  () => import("@/components/public/GroupsMap").then((m) => m.GroupsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-ink-faint">
        Cargando mapa…
      </div>
    ),
  }
);

interface SinglePointMapProps {
  lat: number;
  lng: number;
  label: string;
  sublabel?: string | null;
}

/** Mapa de un solo punto (grupo o evento) — envuelve GroupsMap para poder usarse desde un Server Component. */
export function SinglePointMap({ lat, lng, label, sublabel }: SinglePointMapProps) {
  return (
    <GroupsMap
      center={[lat, lng]}
      groups={[{ slug: "detail", name: label, lat, lng, sector: sublabel }]}
    />
  );
}
