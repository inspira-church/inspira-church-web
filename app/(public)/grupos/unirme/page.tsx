import type { Metadata } from "next";
import { Suspense } from "react";
import { Eyebrow } from "@/components/public/cartel";
import { GroupJoinForm } from "@/components/public/GroupJoinForm";
import { Container } from "@/components/ui/Container";
import { ABOUT_COLORS, anton, hind } from "@/lib/fonts";
import { getPublicGroups } from "@/lib/queries/growth-groups";
import { getSiteSettings } from "@/lib/queries/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quiero pertenecer a un grupo | Inspira Church",
  description: "Cuéntanos un poco de ti y te conectamos con un grupo de crecimiento.",
};

export default async function GroupJoinPage() {
  const [groups, settings] = await Promise.all([getPublicGroups(), getSiteSettings()]);
  const groupOptions = groups.map((g) => ({
    id: g.id,
    slug: g.slug,
    label: `${g.name} — ${g.locality ?? g.city}`,
  }));

  return (
    <section className="bg-black pb-16 pt-16 sm:pb-24 sm:pt-24">
      <Container>
        <div className="mx-auto max-w-xl">
          <Eyebrow color={ABOUT_COLORS.coral}>Grupos de crecimiento</Eyebrow>
          <h1
            className={cn(
              anton.className,
              "mt-4 text-balance text-4xl uppercase leading-[0.92] text-white sm:text-5xl"
            )}
          >
            Quiero pertenecer a un grupo
          </h1>
          <p className={cn(hind.className, "mt-4 text-white/70")}>
            Completa tus datos y el líder del grupo se pondrá en contacto contigo.
          </p>
          <div className="mt-10">
            <Suspense fallback={null}>
              <GroupJoinForm groupOptions={groupOptions} privacyPolicyUrl={settings.privacyPolicyUrl} />
            </Suspense>
          </div>
        </div>
      </Container>
    </section>
  );
}
