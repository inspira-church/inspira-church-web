import Image from "next/image";
import Link from "next/link";
import { SermonPlayIndicator } from "@/components/public/SermonPlayIndicator";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { dayNameFromDate, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface LatestPrayerMomentProps {
  slug: string;
  thumbnailUrl: string | null;
  sermonDate: string;
  preacherName?: string;
  meetingType?: string | null;
}

const MEETING_TYPE_LABEL: Record<string, string> = {
  presencial: "Presencial",
  virtual: "Virtual",
};

/**
 * "Último encuentro" — protagonista de /oraciones, derivada solo por
 * published + fecha (getLatestSermonByTopic), nunca elegida a mano.
 * Deliberadamente más atmosférica que LatestSermon de /predicas: overlay de
 * degradado permanente (no solo en hover) y tipografía de fecha apilada en
 * vez de un título libre, para que la pieza se sienta contemplativa y no
 * "otra media card".
 */
export function LatestPrayerMoment({
  slug,
  thumbnailUrl,
  sermonDate,
  preacherName,
  meetingType,
}: LatestPrayerMomentProps) {
  const dayName = dayNameFromDate(sermonDate).toUpperCase();
  const label = `Reproducir oración del ${formatDate(sermonDate)}`;

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
      <Container>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.teal }}>
          Último encuentro
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[60%_1fr] lg:items-center lg:gap-12">
          <Link href={`/oraciones/${slug}`} aria-label={label} className="group relative aspect-video w-full overflow-hidden bg-black">
            {thumbnailUrl && (
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                priority
                className="object-cover transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-105"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <SermonPlayIndicator size="lg" />
            </div>
          </Link>

          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: ABOUT_COLORS.coral }}
            >
              Oración{meetingType && MEETING_TYPE_LABEL[meetingType] ? ` · ${MEETING_TYPE_LABEL[meetingType]}` : ""}
            </p>
            <h2
              className={cn(
                anton.className,
                "mt-2 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl"
              )}
            >
              <span className="block">{dayName}</span>
              <span className="block">{formatDate(sermonDate)}</span>
            </h2>
            <p className={cn(hind.className, "mt-4 text-white/60")}>{preacherName}</p>
            <Link
              href={`/oraciones/${slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors motion-reduce:transition-none hover:brightness-110"
              style={{ color: ABOUT_COLORS.teal }}
            >
              Ver oración
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
