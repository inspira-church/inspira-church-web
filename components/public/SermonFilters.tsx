"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Option {
  value: string;
  label: string;
}

interface SermonFiltersProps {
  preachers: Option[];
  series: Option[];
  topics: Option[];
}

const SELECT_CLASSES =
  "rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9a94a]";

export function SermonFilters({ preachers, series, topics }: SermonFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/predicas${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <select
        className={SELECT_CLASSES}
        value={searchParams.get("predicador") ?? ""}
        onChange={(e) => updateParam("predicador", e.target.value)}
        aria-label="Filtrar por predicador"
      >
        <option value="" className="bg-black">Todos los predicadores</option>
        {preachers.map((p) => (
          <option key={p.value} value={p.value} className="bg-black">
            {p.label}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASSES}
        value={searchParams.get("serie") ?? ""}
        onChange={(e) => updateParam("serie", e.target.value)}
        aria-label="Filtrar por serie"
      >
        <option value="" className="bg-black">Todas las series</option>
        {series.map((s) => (
          <option key={s.value} value={s.value} className="bg-black">
            {s.label}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASSES}
        value={searchParams.get("tema") ?? ""}
        onChange={(e) => updateParam("tema", e.target.value)}
        aria-label="Filtrar por tema"
      >
        <option value="" className="bg-black">Todos los temas</option>
        {topics.map((t) => (
          <option key={t.value} value={t.value} className="bg-black">
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
