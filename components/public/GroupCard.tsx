import Link from "next/link";
import { anton, hind } from "@/lib/fonts";
import { dayName, formatTime } from "@/lib/format";
import { getGroupTypeColor } from "@/lib/group-types";
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
}: GroupCardProps) {
  const place = [sector, locality].filter(Boolean).join(" · ");
  const accentColor = getGroupTypeColor(groupType);

  return (
    <Link
      href={`/grupos/${slug}`}
      className="group flex flex-col border border-white/10 bg-black p-6 transition-all duration-300 ease-out motion-reduce:transition-none hover:-translate-y-1 hover:border-white/25"
    >
      <span
        className="inline-block w-fit border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
        style={{ borderColor: accentColor, color: accentColor }}
      >
        {groupType}
      </span>
      <h3 className={cn(anton.className, "mt-3 text-balance text-xl uppercase leading-tight text-white")}>
        {name}
      </h3>
      {place && <p className={cn(hind.className, "mt-2 text-sm text-white/50")}>{place}</p>}
      <p className="mt-3 text-sm font-bold uppercase tracking-wide text-white">
        {dayName(dayOfWeek)} · {formatTime(timeOfDay)}
      </p>
      {leaderFullName && (
        <p className={cn(hind.className, "mt-1 text-sm text-white/40")}>Lidera {leaderFullName}</p>
      )}
      <p
        className="mt-5 text-sm font-bold uppercase tracking-wide transition-transform duration-200 ease-out motion-reduce:transition-none group-hover:translate-x-1"
        style={{ color: accentColor }}
      >
        Ver grupo →
      </p>
    </Link>
  );
}
