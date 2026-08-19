import Image from "next/image";
import Link from "next/link";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const TILE_COLORS = [ABOUT_COLORS.teal, ABOUT_COLORS.coral, ABOUT_COLORS.tealLight, ABOUT_COLORS.cream];

interface SeriesItem {
  id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  count: number;
}

/** "Explora por series" — colecciones grandes, no tarjetas de prédica repetidas. */
export function SermonSeriesShowcase({ series }: { series: SeriesItem[] }) {
  const withSermons = series.filter((s) => s.count > 0);
  if (withSermons.length === 0) return null;

  return (
    <section className="border-b border-white/10 bg-[#0d0d0d] py-16 sm:py-24">
      <Container>
        <Eyebrow color={ABOUT_COLORS.teal}>Para seguir creciendo</Eyebrow>
        <PosterHeading>Explora por series</PosterHeading>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withSermons.map((item, i) => (
            <Link
              key={item.id}
              href={`/series/${item.slug}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden bg-black p-6 transition-transform duration-300 ease-out hover:-translate-y-1"
            >
              {item.cover_image_url ? (
                <Image
                  src={item.cover_image_url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: TILE_COLORS[i % TILE_COLORS.length], opacity: 0.25 }}
                  aria-hidden="true"
                />
              )}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.88) 100%)" }}
                aria-hidden="true"
              />
              <div className="relative">
                <p
                  className={cn(anton.className, "text-2xl uppercase leading-[0.95] text-white sm:text-3xl")}
                >
                  {item.name}
                </p>
                <p className={cn(hind.className, "mt-2 text-sm text-white/70")}>
                  {item.count} {item.count === 1 ? "mensaje" : "mensajes"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
