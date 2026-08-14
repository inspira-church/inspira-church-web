import type { Metadata } from "next";
import { Suspense } from "react";
import { GroupJoinForm } from "@/components/public/GroupJoinForm";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPublicGroups } from "@/lib/queries/growth-groups";

export const metadata: Metadata = {
  title: "Quiero pertenecer a un grupo | Inspira Church",
  description: "Cuéntanos un poco de ti y te conectamos con un grupo de crecimiento.",
};

export default async function GroupJoinPage() {
  const groups = await getPublicGroups();
  const groupOptions = groups.map((g) => ({
    id: g.id,
    slug: g.slug,
    label: `${g.name} — ${g.locality ?? g.city}`,
  }));

  return (
    <Section className="pt-16 sm:pt-24">
      <div className="mx-auto max-w-xl">
        <SectionHeading
          eyebrow="Grupos de crecimiento"
          title="Quiero pertenecer a un grupo"
          description="Completa tus datos y el líder del grupo se pondrá en contacto contigo."
        />
        <div className="mt-10">
          <Suspense fallback={null}>
            <GroupJoinForm groupOptions={groupOptions} />
          </Suspense>
        </div>
      </div>
    </Section>
  );
}
