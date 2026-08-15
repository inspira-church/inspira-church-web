import type { Metadata } from "next";
import { GroupFilters } from "@/components/public/GroupFilters";
import { GroupsExplorer } from "@/components/public/GroupsExplorer";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicGroups } from "@/lib/queries/growth-groups";

export const metadata: Metadata = {
  title: "Grupos de crecimiento | Inspira Church",
  description:
    "Encuentra un grupo de crecimiento cerca de ti: filtra por ubicación, día y tipo de grupo.",
};

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ ubicacion?: string; dia?: string; tipo?: string }>;
}) {
  const { ubicacion, dia, tipo } = await searchParams;
  const growthGroups = await getPublicGroups();

  const localities = Array.from(
    new Set(growthGroups.map((g) => g.locality).filter((v): v is string => !!v))
  )
    .sort()
    .map((l) => ({ value: l, label: l }));

  const types = Array.from(new Set(growthGroups.map((g) => g.groupType)))
    .sort()
    .map((t) => ({ value: t, label: t }));

  const filtered = growthGroups
    .filter((g) => !ubicacion || g.locality === ubicacion)
    .filter((g) => !dia || g.dayOfWeek === Number(dia))
    .filter((g) => !tipo || g.groupType === tipo);

  return (
    <Section className="pt-16 sm:pt-24">
      <SectionHeading
        as="h1"
        eyebrow="Comunidad"
        title="Encuentra un grupo de crecimiento"
        description="Reuniones pequeñas cerca de ti. Filtra por ubicación, día o tipo de grupo, o mira todos en el mapa."
      />

      <div className="mt-8">
        <GroupFilters localities={localities} types={types} />
      </div>

      <div className="mt-8">
        <GroupsExplorer groups={filtered} />
      </div>
    </Section>
  );
}
