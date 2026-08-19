import Image from "next/image";
import Link from "next/link";
import { SermonPlayIndicator } from "@/components/public/SermonPlayIndicator";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { formatDateCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

interface LatestSermonProps {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  sermonDate: string;
  preacherName?: string;
  seriesName?: string;
  topic?: string;
}

/** "Último mensaje" — jerarquía visual superior, composición editorial 60/40, nunca una tarjeta cerrada. */
export function LatestSermon({
  slug,
  title,
  thumbnailUrl,
  sermonDate,
  preacherName,
  seriesName,
  topic,
}: LatestSermonProps) {
  return (
    <section className="border-b border-white/10 bg-black py-16 sm:py-24">
      <Container>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: ABOUT_COLORS.coral }}>
          Último mensaje
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[60%_1fr] lg:items-center lg:gap-12">
          <Link
            href={`/predicas/${slug}`}
            aria-label={`Reproducir ${title}`}
            className="group relative aspect-video w-full overflow-hidden bg-[#0d0d0d]"
          >
            {thumbnailUrl && (
              <Image
                src={thumbnailUrl}
                alt=""
                fill
                priority
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            )}
            <div
              className="absolute inset-0 bg-black/0 transition-colors duration-300 ease-out group-hover:bg-black/20"
              aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <SermonPlayIndicator size="lg" />
            </div>
          </Link>

          <div>
            {(seriesName || topic) && (
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: ABOUT_COLORS.teal }}
              >
                {seriesName ?? topic}
              </p>
            )}
            <h2
              className={cn(
                anton.className,
                "mt-2 text-balance text-3xl uppercase leading-[0.95] text-white sm:text-4xl"
              )}
            >
              {title}
            </h2>
            <p className={cn(hind.className, "mt-4 text-white/60")}>
              {preacherName ? `${preacherName} · ` : ""}
              {formatDateCompact(sermonDate)}
            </p>
            <Link
              href={`/predicas/${slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide transition-colors hover:brightness-110"
              style={{ color: ABOUT_COLORS.coral }}
            >
              Ver prédica
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
