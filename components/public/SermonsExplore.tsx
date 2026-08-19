"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { ABOUT_COLORS } from "@/lib/fonts";

interface Option {
  value: string;
  label: string;
}

interface SermonsExploreProps {
  preachers: Option[];
  series: Option[];
  topics: Option[];
}

const SELECT_CLASSES =
  "w-full rounded-md border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50] sm:w-auto";
const LABEL_CLASSES = "text-xs font-bold uppercase tracking-widest text-white/45";
const SEARCH_DEBOUNCE_MS = 400;

/** Búsqueda (con debounce) + filtros de predicador/serie/tema — todo contra servidor vía searchParams, igual que antes. */
export function SermonsExplore({ preachers, series, topics }: SermonsExploreProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const predicador = searchParams.get("predicador") ?? "";
  const serie = searchParams.get("serie") ?? "";
  const tema = searchParams.get("tema") ?? "";
  const q = searchParams.get("q") ?? "";
  const hasActiveFilters = Boolean(predicador || serie || tema || q);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/predicas${params.toString() ? `?${params.toString()}` : ""}`);
  }

  // Debounce: solo navega tras una pausa de tecleo, y solo si el texto realmente cambió respecto a la URL.
  useEffect(() => {
    if (search === q) return;
    const id = setTimeout(() => updateParam("q", search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a `search`; incluir `q`/updateParam reiniciaría el debounce en cada navegación.
  }, [search]);

  return (
    <div>
      <Eyebrow color={ABOUT_COLORS.coral}>Explora</Eyebrow>
      <PosterHeading>Encuentra un mensaje para este momento.</PosterHeading>

      <div className="mt-8 max-w-md">
        <label htmlFor="sermon-search" className={LABEL_CLASSES}>
          Buscar
        </label>
        <input
          id="sermon-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar una prédica..."
          className="mt-1.5 w-full rounded-md border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7F50]"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="sermon-preacher" className={LABEL_CLASSES}>
            Predicador
          </label>
          <select
            id="sermon-preacher"
            className={`${SELECT_CLASSES} mt-1.5`}
            value={predicador}
            onChange={(e) => updateParam("predicador", e.target.value)}
          >
            <option value="" className="bg-black">Todos los predicadores</option>
            {preachers.map((p) => (
              <option key={p.value} value={p.value} className="bg-black">
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sermon-series" className={LABEL_CLASSES}>
            Serie
          </label>
          <select
            id="sermon-series"
            className={`${SELECT_CLASSES} mt-1.5`}
            value={serie}
            onChange={(e) => updateParam("serie", e.target.value)}
          >
            <option value="" className="bg-black">Todas las series</option>
            {series.map((s) => (
              <option key={s.value} value={s.value} className="bg-black">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sermon-topic" className={LABEL_CLASSES}>
            Tema
          </label>
          <select
            id="sermon-topic"
            className={`${SELECT_CLASSES} mt-1.5`}
            value={tema}
            onChange={(e) => updateParam("tema", e.target.value)}
          >
            <option value="" className="bg-black">Todos los temas</option>
            {topics.map((t) => (
              <option key={t.value} value={t.value} className="bg-black">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <Link
            href="/predicas"
            className="text-sm font-bold uppercase tracking-wide text-white/60 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white"
          >
            Limpiar filtros
          </Link>
        )}
      </div>
    </div>
  );
}
