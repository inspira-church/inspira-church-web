import Image from "next/image";
import Link from "next/link";
import { SermonPlayIndicator } from "@/components/public/SermonPlayIndicator";
import { anton, hind } from "@/lib/fonts";
import { formatDateCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SermonCardProps {
  slug: string;
  title: string;
  thumbnailUrl?: string | null;
  sermonDate: string;
  preacherName?: string;
  seriesName?: string;
  topic?: string;
}

export function SermonCard({
  slug,
  title,
  thumbnailUrl,
  sermonDate,
  preacherName,
  seriesName,
  topic,
}: SermonCardProps) {
  return (
    <Link href={`/predicas/${slug}`} aria-label={`Reproducir ${title}`} className="group flex flex-col">
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#0d0d0d]">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 ease-out motion-reduce:transition-none group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
        <div
          className="absolute inset-0 bg-black/0 transition-colors duration-300 ease-out motion-reduce:transition-none group-hover:bg-black/20"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none group-hover:opacity-100">
          <SermonPlayIndicator />
        </div>
      </div>
      <div className="flex flex-1 flex-col pt-4">
        {(seriesName || topic) && (
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF7F50]">
            {seriesName ?? topic}
          </p>
        )}
        <h3 className={cn(anton.className, "mt-1.5 text-balance text-lg uppercase leading-tight text-white")}>
          {title}
        </h3>
        <p className={cn(hind.className, "mt-2 text-sm text-white/50")}>
          {preacherName ? `${preacherName} · ` : ""}
          {formatDateCompact(sermonDate)}
        </p>
      </div>
    </Link>
  );
}
