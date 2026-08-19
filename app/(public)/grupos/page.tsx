import type { Metadata } from "next";
import { Eyebrow, PosterHeading } from "@/components/public/cartel";
import { GroupsExplorer } from "@/components/public/GroupsExplorer";
import { GroupsHelpCTA } from "@/components/public/GroupsHelpCTA";
import { GroupsIntro } from "@/components/public/GroupsIntro";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { getPublicGroups } from "@/lib/queries/growth-groups";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Grupos de crecimiento | Inspira Church",
  description:
    "Encuentra un grupo de crecimiento cerca de ti: filtra por ubicación, día y tipo de grupo.",
};

export default async function GroupsPage() {
  const growthGroups = await getPublicGroups();

  const localities = Array.from(
    new Set(growthGroups.map((g) => g.locality).filter((v): v is string => !!v))
  ).sort();
  const types = Array.from(new Set(growthGroups.map((g) => g.groupType))).sort();

  return (
    <>
      <section className="border-b border-white/10 bg-black pb-10 pt-16 sm:pb-14 sm:pt-24">
        <Container>
          <Eyebrow color={ABOUT_COLORS.coral}>Comunidad</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 max-w-2xl text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
            )}
          >
            Encuentra un grupo de crecimiento
          </h1>
          <p className={cn(hind.className, "mt-4 max-w-xl text-lg text-white/70")}>
            Hay un lugar para crecer, compartir y caminar con otros. Encuentra un grupo cerca de
            ti y da tu siguiente paso en comunidad.
          </p>
          <p className={cn(hind.className, "mt-3 text-sm text-white/45")}>
            No tienes que hacer la vida solo.
          </p>
        </Container>
      </section>

      <GroupsIntro />

      <section className="bg-black py-16 sm:py-24">
        <Container>
          <PosterHeading>Encuentra tu grupo</PosterHeading>
          <p className={cn(hind.className, "mt-3 text-white/60")}>
            Filtra por zona, día o tipo de grupo.
          </p>
          <div className="mt-8">
            <GroupsExplorer groups={growthGroups} localities={localities} types={types} />
          </div>
        </Container>
      </section>

      <GroupsHelpCTA />
    </>
  );
}
