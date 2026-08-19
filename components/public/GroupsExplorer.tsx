"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { GroupCard } from "@/components/public/GroupCard";
import { DAY_NAMES } from "@/lib/constants";
import { ABOUT_COLORS, hind } from "@/lib/fonts";
import { normalizeSearch, titleCase } from "@/lib/format";
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
  localities: string[];
  types: string[];
}

const BOGOTA_CENTER: [number, number] = [4.65, -74.09];
const SELECT_CLASSES =
  "w-full rounded-md border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50] sm:w-auto";
const LABEL_CLASSES = "text-xs font-bold uppercase tracking-widest text-white/45";

export function GroupsExplorer({ groups, localities, types }: GroupsExplorerProps) {
  const [search, setSearch] = useState("");
  const [locality, setLocality] = useState("");
  const [day, setDay] = useState("");
  const [type, setType] = useState("");
  const [view, setView] = useState<"lista" | "mapa">("lista");

  const hasActiveFilters = Boolean(search || locality || day || type);

  const filtered = useMemo(() => {
    const query = normalizeSearch(search);
    return groups
      .filter((g) => !locality || g.locality === locality)
      .filter((g) => !day || g.dayOfWeek === Number(day))
      .filter((g) => !type || g.groupType === type)
      .filter((g) => {
        if (!query) return true;
        const haystack = normalizeSearch(
          [g.name, g.sector, g.locality, g.groupType].filter(Boolean).join(" ")
        );
        return haystack.includes(query);
      });
  }, [groups, search, locality, day, type]);

  const groupsOnMap = filtered.filter(
    (g): g is GrowthGroup & { latApprox: number; lngApprox: number } =>
      g.latApprox !== null && g.lngApprox !== null
  );

  function clearFilters() {
    setSearch("");
    setLocality("");
    setDay("");
    setType("");
  }

  return (
    <div>
      <div className="max-w-md">
        <label htmlFor="group-search" className={LABEL_CLASSES}>
          Buscar
        </label>
        <input
          id="group-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por barrio o nombre del grupo…"
          className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="group-locality" className={LABEL_CLASSES}>
            Localidad
          </label>
          <select
            id="group-locality"
            className={cn(SELECT_CLASSES, "mt-1.5")}
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
          >
            <option value="" className="bg-black">Todas las localidades</option>
            {localities.map((l) => (
              <option key={l} value={l} className="bg-black">
                {titleCase(l)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="group-day" className={LABEL_CLASSES}>
            Día
          </label>
          <select
            id="group-day"
            className={cn(SELECT_CLASSES, "mt-1.5")}
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            <option value="" className="bg-black">Todos los días</option>
            {DAY_NAMES.map((d, index) => (
              <option key={d} value={String(index)} className="bg-black">
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="group-type" className={LABEL_CLASSES}>
            Tipo
          </label>
          <select
            id="group-type"
            className={cn(SELECT_CLASSES, "mt-1.5")}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="" className="bg-black">Todos los tipos</option>
            {types.map((t) => (
              <option key={t} value={t} className="bg-black">
                {t}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-bold uppercase tracking-wide text-white/60 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Vista de grupos"
          className="inline-flex rounded-md border border-white/15 p-1"
        >
          {(["lista", "mapa"] as const).map((option) => (
            <button
              key={option}
              role="tab"
              aria-selected={view === option}
              onClick={() => setView(option)}
              className={cn(
                "rounded px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors",
                view === option ? "bg-[#FF7F50] text-black" : "text-white/60 hover:text-white"
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <p className={cn(hind.className, "text-sm text-white/45")}>
          {filtered.length} {filtered.length === 1 ? "grupo" : "grupos"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 border border-dashed border-white/15 bg-black px-8 py-14 text-center">
          <p className="text-lg font-bold uppercase tracking-wide text-white">
            No encontramos un grupo con esos filtros
          </p>
          <p className={cn(hind.className, "mx-auto mt-3 max-w-sm text-white/60")}>
            Prueba otra zona o día. Si quieres, también podemos ayudarte personalmente.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold uppercase tracking-wide text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white"
              >
                Limpiar filtros
              </button>
            )}
            <Link
              href="/grupos/unirme"
              className="text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
              style={{ color: ABOUT_COLORS.coral }}
            >
              Quiero que me contacten →
            </Link>
          </div>
        </div>
      ) : view === "lista" ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((group) => (
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
              locality: g.locality,
              groupType: g.groupType,
              dayOfWeek: g.dayOfWeek,
              timeOfDay: g.timeOfDay,
            }))}
          />
        </div>
      )}
    </div>
  );
}
