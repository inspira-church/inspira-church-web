import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SinglePointMap } from "@/components/public/SinglePointMap";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { dayName, formatTime } from "@/lib/format";
import { getPublicGroupBySlug } from "@/lib/queries/growth-groups";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getPublicGroupBySlug(slug);
  if (!group) return {};
  return {
    title: `${group.name} | Grupos de crecimiento | Inspira Church`,
    description: group.description,
  };
}

export default async function GroupPage({ params }: PageProps) {
  const { slug } = await params;
  const group = await getPublicGroupBySlug(slug);
  if (!group) notFound();

  const place = [group.sector, group.locality].filter(Boolean).join(", ");

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <Badge variant="accent">{group.groupType}</Badge>
          <h1 className="mt-3 text-balance font-display text-4xl font-semibold text-ink sm:text-5xl">
            {group.name}
          </h1>
          <p className="mt-4 text-lg text-ink-soft">{group.description}</p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Día y hora
              </dt>
              <dd className="mt-1 text-ink">
                {dayName(group.dayOfWeek)} · {formatTime(group.timeOfDay)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                Ubicación
              </dt>
              <dd className="mt-1 text-ink">{place || group.city}</dd>
            </div>
            {group.leaderFullName && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Líder
                </dt>
                <dd className="mt-1 text-ink">{group.leaderFullName}</dd>
              </div>
            )}
            {group.coleaderFullName && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  Colíder
                </dt>
                <dd className="mt-1 text-ink">{group.coleaderFullName}</dd>
              </div>
            )}
          </dl>

          <p className="mt-6 text-sm text-ink-faint">
            Por seguridad de la familia anfitriona, la dirección exacta se
            comparte al confirmar tu asistencia.
          </p>

          <div className="mt-8">
            <Button as={Link} href={`/grupos/unirme?grupo=${group.slug}`} size="lg">
              Quiero pertenecer a este grupo
            </Button>
          </div>
        </div>

        {group.latApprox !== null && group.lngApprox !== null && (
          <div className="h-64 overflow-hidden rounded-lg border border-border lg:h-full">
            <SinglePointMap
              lat={group.latApprox}
              lng={group.lngApprox}
              label={group.name}
              sublabel={group.sector}
            />
          </div>
        )}
      </div>
    </Section>
  );
}
