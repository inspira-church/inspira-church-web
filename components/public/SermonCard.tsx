import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/format";

interface SermonCardProps {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  sermonDate: string;
  preacherName?: string;
  seriesName?: string;
}

export function SermonCard({
  slug,
  title,
  thumbnailUrl,
  sermonDate,
  preacherName,
  seriesName,
}: SermonCardProps) {
  return (
    <Card as={Link} href={`/predicas/${slug}`} interactive className="group block overflow-hidden">
      <div className="relative aspect-video overflow-hidden bg-paper">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
      </div>
      <div className="p-5">
        {seriesName && (
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {seriesName}
          </p>
        )}
        <h3 className="mt-1 text-balance font-display text-lg font-semibold text-ink">
          {title}
        </h3>
        <p className="mt-2 text-sm text-ink-faint">
          {preacherName ? `${preacherName} · ` : ""}
          {formatDate(sermonDate)}
        </p>
      </div>
    </Card>
  );
}
