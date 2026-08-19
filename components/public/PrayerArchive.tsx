"use client";

import { useMemo, useState, useTransition } from "react";
import { PrayerCard } from "@/components/public/PrayerCard";
import { loadMorePrayerSermons } from "@/lib/actions/sermons";
import { ABOUT_COLORS } from "@/lib/fonts";

export interface PrayerSermonItem {
  id: string;
  slug: string;
  thumbnail_url: string | null;
  sermon_date: string;
  preacher_id: string | null;
  meeting_type: string | null;
}

interface PrayerArchiveProps {
  initialSermons: PrayerSermonItem[];
  initialHasMore: boolean;
  excludeId?: string;
  preacherById: Record<string, string>;
  /** Modalidades realmente usadas entre las publicadas — el filtro solo se muestra si hay al menos dos, para no ofrecer una opción sin sentido. */
  meetingTypesInUse: string[];
}

type FilterValue = "all" | "presencial" | "virtual";

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "presencial", label: "Presenciales" },
  { value: "virtual", label: "Virtuales" },
];

/** Grid "Vuelve a estos momentos" + "Cargar más momentos", con filtro Presencial/Virtual opcional aplicado sobre lo ya cargado. */
export function PrayerArchive({
  initialSermons,
  initialHasMore,
  excludeId,
  preacherById,
  meetingTypesInUse,
}: PrayerArchiveProps) {
  const [sermons, setSermons] = useState(initialSermons);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isPending, startTransition] = useTransition();

  const showFilter = meetingTypesInUse.length >= 2;

  const filtered = useMemo(
    () => (filter === "all" ? sermons : sermons.filter((s) => s.meeting_type === filter)),
    [sermons, filter]
  );

  function handleLoadMore() {
    startTransition(async () => {
      const { sermons: next, hasMore: nextHasMore } = await loadMorePrayerSermons(
        sermons.length,
        excludeId
      );
      setSermons((prev) => [...prev, ...next]);
      setHasMore(nextHasMore);
    });
  }

  return (
    <div>
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => {
            const active = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={active}
                className="rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors motion-reduce:transition-none"
                style={
                  active
                    ? { borderColor: ABOUT_COLORS.teal, backgroundColor: ABOUT_COLORS.teal, color: "#000" }
                    : { borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.7)" }
                }
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10 border border-dashed border-white/15 bg-black px-8 py-14 text-center">
          <p className="text-white/50">No hay momentos de oración en esta modalidad todavía.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((sermon) => (
            <PrayerCard
              key={sermon.id}
              slug={sermon.slug}
              thumbnailUrl={sermon.thumbnail_url}
              sermonDate={sermon.sermon_date}
              preacherName={sermon.preacher_id ? preacherById[sermon.preacher_id] : undefined}
              meetingType={sermon.meeting_type}
            />
          ))}
        </div>
      )}

      {hasMore && filter === "all" && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded-md border-2 border-white/70 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors motion-reduce:transition-none hover:border-white disabled:opacity-50"
          >
            {isPending ? "Cargando…" : "Cargar más momentos"}
          </button>
        </div>
      )}
    </div>
  );
}
