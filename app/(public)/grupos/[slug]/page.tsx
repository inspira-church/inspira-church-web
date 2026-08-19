import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoldButton } from "@/components/public/cartel";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Container } from "@/components/ui/Container";
import { anton, hind } from "@/lib/fonts";
import { dayName, formatTime } from "@/lib/format";
import { getGroupTypeColor } from "@/lib/group-types";
import { getPublicGroupBySlug } from "@/lib/queries/growth-groups";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getPublicGroupBySlug(slug);
  if (!group) return {};
  const place = [group.sector, group.locality].filter(Boolean).join(" · ");
  return {
    title: `${group.name} | ${group.groupType} | Inspira Church`,
    description:
      group.description ||
      `${group.groupType} · ${dayName(group.dayOfWeek)} ${formatTime(group.timeOfDay)}${place ? ` · ${place}` : ""}.`,
  };
}

export default async function GroupPage({ params }: PageProps) {
  const { slug } = await params;
  const group = await getPublicGroupBySlug(slug);
  if (!group) notFound();

  const place = [group.sector, group.locality].filter(Boolean).join(" · ");
  const color = getGroupTypeColor(group.groupType);

  return (
    <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <span
              className="inline-block border px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ borderColor: color, color }}
            >
              {group.groupType}
            </span>
            <h1 className={cn(anton.className, "mt-3 text-balance text-4xl uppercase leading-[0.95] text-white sm:text-5xl")}>
              {group.name}
            </h1>
            {group.description && (
              <p className={cn(hind.className, "mt-4 text-lg text-white/70")}>{group.description}</p>
            )}

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-white/45">
                  Día y hora
                </dt>
                <dd className="mt-1 text-white">
                  {dayName(group.dayOfWeek)} · {formatTime(group.timeOfDay)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-white/45">
                  Ubicación
                </dt>
                <dd className="mt-1 text-white">{place || group.city}</dd>
              </div>
              {group.leaderFullName && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-white/45">
                    Líder
                  </dt>
                  <dd className="mt-1 text-white">{group.leaderFullName}</dd>
                </div>
              )}
              {group.coleaderFullName && (
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-white/45">
                    Colíder
                  </dt>
                  <dd className="mt-1 text-white">{group.coleaderFullName}</dd>
                </div>
              )}
            </dl>

            <p className={cn(hind.className, "mt-6 text-sm text-white/45")}>
              Por seguridad de la familia anfitriona, la dirección exacta se comparte al
              confirmar tu asistencia.
            </p>

            <div className="mt-8">
              <GoldButton href={`/grupos/unirme?grupo=${group.slug}`} color={color}>
                Quiero conectarme con este grupo
              </GoldButton>
            </div>
          </div>

          {group.latApprox !== null && group.lngApprox !== null && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/45 lg:hidden">
                Mapa
              </p>
              <div className="mt-2 h-64 overflow-hidden border border-white/10 lg:mt-0 lg:h-full">
                <SinglePointMap
                  lat={group.latApprox}
                  lng={group.lngApprox}
                  label={group.name}
                  sublabel={group.sector}
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
