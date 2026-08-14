import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { dayName, formatTime } from "@/lib/format";

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
  const place = [sector, locality].filter(Boolean).join(", ");

  return (
    <Card as={Link} href={`/grupos/${slug}`} interactive className="block p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-balance font-display text-lg font-semibold text-ink">
          {name}
        </h3>
        <Badge variant="accent" className="shrink-0">
          {groupType}
        </Badge>
      </div>
      {place && <p className="mt-2 text-sm text-ink-soft">{place}</p>}
      <p className="mt-3 text-sm font-medium text-ink">
        {dayName(dayOfWeek)} · {formatTime(timeOfDay)}
      </p>
      {leaderFullName && (
        <p className="mt-1 text-sm text-ink-faint">Lidera {leaderFullName}</p>
      )}
    </Card>
  );
}
