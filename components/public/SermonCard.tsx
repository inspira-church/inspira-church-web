import Image from "next/image";
import Link from "next/link";
import { anton, hind } from "@/lib/fonts";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SermonCardProps {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  sermonDate: string;
  preacherName?: string;
  seriesName?: string;
  /** Color de acento rotativo (CAMPAIGN_COLORS) — mismo patrón que las tarjetas de evento de Inicio. */
  accentColor?: string;
}

export function SermonCard({
  slug,
  title,
  thumbnailUrl,
  sermonDate,
  preacherName,
  seriesName,
  accentColor = "#d9a94a",
}: SermonCardProps) {
  return (
    <Link
      href={`/predicas/${slug}`}
      className="group flex flex-col overflow-hidden border border-white/10 bg-black transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-110"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#0d0d0d]">
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
      <div className="flex flex-1 flex-col p-5">
        {seriesName && (
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            {seriesName}
          </p>
        )}
        <h3 className={cn(anton.className, "mt-1.5 text-balance text-lg uppercase leading-tight text-white")}>
          {title}
        </h3>
        <p className={cn(hind.className, "mt-3 text-sm text-white/50")}>
          {preacherName ? `${preacherName} · ` : ""}
          {formatDate(sermonDate)}
        </p>
      </div>
    </Link>
  );
}
