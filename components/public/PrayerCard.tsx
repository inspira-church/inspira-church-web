import Image from "next/image";
import Link from "next/link";
import { SermonPlayIndicator } from "@/components/public/SermonPlayIndicator";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { dayNameFromDate, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PrayerCardProps {
  slug: string;
  thumbnailUrl?: string | null;
  sermonDate: string;
  preacherName?: string;
  meetingType?: string | null;
}

const MEETING_TYPE_LABEL: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
};

/**
 * Tarjeta del archivo de oraciones — deliberadamente distinta de SermonCard
 * (eyebrow = modalidad, no serie/tema; encabezado = día de la semana
 * derivado de sermon_date, no el título libre que escribe el admin, para
 * que el diseño no dependa de que cada título siga un patrón exacto).
 */
export function PrayerCard({ slug, thumbnailUrl, sermonDate, preacherName, meetingType }: PrayerCardProps) {
  const dayName = dayNameFromDate(sermonDate).toUpperCase();

  return (
    <Link
      href={`/oraciones/${slug}`}
      aria-label={`Ver oración del ${formatDate(sermonDate)}`}
      className="group flex flex-col"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-[#0d0d0d]">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-105"
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
        {meetingType && MEETING_TYPE_LABEL[meetingType] && (
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
            {MEETING_TYPE_LABEL[meetingType]}
          </p>
        )}
        <h3 className={cn(anton.className, "mt-1.5 text-lg uppercase leading-tight text-white")}>
          {dayName}
        </h3>
        <p className={cn(hind.className, "mt-2 text-sm text-white/50")}>
          {preacherName ? `${preacherName} · ` : ""}
          {formatDate(sermonDate)}
        </p>
      </div>
    </Link>
  );
}
