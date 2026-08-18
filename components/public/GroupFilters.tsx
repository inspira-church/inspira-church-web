"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DAY_NAMES } from "@/lib/constants";

interface Option {
  value: string;
  label: string;
}

interface GroupFiltersProps {
  localities: Option[];
  types: Option[];
}

const SELECT_CLASSES =
  "rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94a]";

export function GroupFilters({ localities, types }: GroupFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/grupos${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={SELECT_CLASSES}
        value={searchParams.get("ubicacion") ?? ""}
        onChange={(e) => updateParam("ubicacion", e.target.value)}
        aria-label="Filtrar por ubicación"
      >
        <option value="" className="bg-black">Todas las localidades</option>
        {localities.map((l) => (
          <option key={l.value} value={l.value} className="bg-black">
            {l.label}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASSES}
        value={searchParams.get("dia") ?? ""}
        onChange={(e) => updateParam("dia", e.target.value)}
        aria-label="Filtrar por día"
      >
        <option value="" className="bg-black">Todos los días</option>
        {DAY_NAMES.map((day, index) => (
          <option key={day} value={String(index)} className="bg-black">
            {day}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASSES}
        value={searchParams.get("tipo") ?? ""}
        onChange={(e) => updateParam("tipo", e.target.value)}
        aria-label="Filtrar por tipo de grupo"
      >
        <option value="" className="bg-black">Todos los tipos</option>
        {types.map((t) => (
          <option key={t.value} value={t.value} className="bg-black">
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
