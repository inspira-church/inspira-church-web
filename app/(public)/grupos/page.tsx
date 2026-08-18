import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { GroupFilters } from "@/components/public/GroupFilters";
import { GroupsExplorer } from "@/components/public/GroupsExplorer";
import { Container } from "@/components/ui/Container";
import { hind, CAMPAIGN_COLORS } from "@/lib/fonts";
import { getPublicGroups } from "@/lib/queries/growth-groups";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Grupos de crecimiento | Inspira Church",
  description:
    "Encuentra un grupo de crecimiento cerca de ti: filtra por ubicación, día y tipo de grupo.",
};

/** Grupos hereda el color que Inicio ya le asocia en "Tres pasos" (paso 2 → /grupos). */
const PAGE_COLOR = CAMPAIGN_COLORS[3];

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
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={PAGE_COLOR}>Comunidad</Eyebrow>
          <PosterHeading>Encuentra un grupo de crecimiento</PosterHeading>
          <p className={cn(hind.className, "mt-4 max-w-xl text-white/70")}>
            Reuniones pequeñas cerca de ti. Filtra por ubicación, día o tipo de grupo, o mira
            todos en el mapa.
          </p>
        </Container>
      </section>

      <section className="bg-[#0d0d0d] py-16 sm:py-24">
        <Container>
          <GroupFilters localities={localities} types={types} />
          <div className="mt-8">
            <GroupsExplorer groups={filtered} />
          </div>
        </Container>
      </section>
    </>
  );
}
