import Link from "next/link";
import { anton, hind } from "@/lib/fonts";
import { dayName, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  slug: string;
  name: string;
  groupType: string;
  dayOfWeek: number;
  timeOfDay: string;
  locality?: string | null;
  sector?: string | null;
  leaderFullName?: string | null;
  /** Color de acento rotativo (CAMPAIGN_COLORS). */
  accentColor?: string;
}

export function GroupCard({
  slug,
  name,
  groupType,
  dayOfWeek,
  timeOfDay,
  locality,
  sector,
  leaderFullName,
  accentColor = "#3e6fa8",
}: GroupCardProps) {
  const place = [sector, locality].filter(Boolean).join(", ");

  return (
    <Link
      href={`/grupos/${slug}`}
      className="group flex flex-col border border-white/10 bg-black p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-110"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={cn(anton.className, "text-balance text-lg uppercase leading-tight text-white")}>
          {name}
        </h3>
        <span
          className="shrink-0 border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {groupType}
        </span>
      </div>
      {place && <p className={cn(hind.className, "mt-2 text-sm text-white/50")}>{place}</p>}
      <p className="mt-3 text-sm font-bold uppercase tracking-wide text-white">
        {dayName(dayOfWeek)} · {formatTime(timeOfDay)}
      </p>
      {leaderFullName && (
        <p className={cn(hind.className, "mt-1 text-sm text-white/40")}>Lidera {leaderFullName}</p>
      )}
    </Link>
  );
}
