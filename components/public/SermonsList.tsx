"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { SermonCard } from "@/components/public/SermonCard";
import { loadMoreSermons } from "@/lib/actions/sermons";
import { ABOUT_COLORS, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export interface SermonListItem {
  id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  sermon_date: string;
  series_id: string | null;
  preacher_id: string | null;
  topics: string[] | null;
}

interface SermonsListProps {
  initialSermons: SermonListItem[];
  initialHasMore: boolean;
  filters: { preacherId?: string; seriesId?: string; topic?: string; search?: string };
  seriesById: Record<string, string>;
  preacherById: Record<string, string>;
}

/** Grid de "Todas las prédicas" + "Cargar más" — se remonta (key en el padre) cada vez que cambian filtros/búsqueda, así el estado acumulado nunca queda desincronizado. */
export function SermonsList({
  initialSermons,
  initialHasMore,
  filters,
  seriesById,
  preacherById,
}: SermonsListProps) {
  const [sermons, setSermons] = useState(initialSermons);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const { sermons: next, hasMore: nextHasMore } = await loadMoreSermons(filters, sermons.length);
      setSermons((prev) => [...prev, ...next]);
      setHasMore(nextHasMore);
    });
  }

  if (sermons.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-white/15 bg-black px-8 py-14 text-center">
        <p className="text-lg font-bold uppercase tracking-wide text-white">
          No encontramos ese mensaje
        </p>
        <p className={cn(hind.className, "mx-auto mt-3 max-w-sm text-white/60")}>
          Prueba cambiando alguno de los filtros o explora todas nuestras prédicas.
        </p>
        <Link
          href="/predicas"
          className="mt-6 inline-block text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
          style={{ color: ABOUT_COLORS.coral }}
        >
          Ver todas las prédicas →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {sermons.map((sermon) => (
          <SermonCard
            key={sermon.id}
            slug={sermon.slug}
            title={sermon.title}
            thumbnailUrl={sermon.thumbnail_url}
            sermonDate={sermon.sermon_date}
            preacherName={sermon.preacher_id ? preacherById[sermon.preacher_id] : undefined}
            seriesName={sermon.series_id ? seriesById[sermon.series_id] : undefined}
            topic={sermon.topics?.[0]}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-md border-2 border-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-white disabled:opacity-50"
          >
            {isPending ? "Cargando…" : "Cargar más mensajes"}
          </button>
        </div>
      )}
    </div>
  );
}
