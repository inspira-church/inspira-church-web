import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { GrowthGroupForm } from "@/components/admin/GrowthGroupForm";
import { updateGrowthGroup } from "@/lib/actions/growth-groups";
import { createClient } from "@/lib/supabase/server";

export default async function EditGrowthGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: group }, { data: members }] = await Promise.all([
    supabase.from("growth_groups").select("*").eq("id", id).single(),
    supabase.from("team_members").select("id, full_name").order("full_name"),
  ]);

  if (!group) notFound();

  const updateWithId = updateGrowthGroup.bind(null, id);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Grupos", href: "/admin/grupos" }, { label: "Editar grupo" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Editar grupo</h1>
      <div className="mt-8">
        <GrowthGroupForm
          action={updateWithId}
          teamMemberOptions={(members ?? []).map((m) => ({ value: m.id, label: m.full_name }))}
          defaultValues={{
            name: group.name,
            slug: group.slug,
            groupType: group.group_type,
            description: group.description,
            city: group.city,
            locality: group.locality,
            sector: group.sector,
            latApprox: group.lat_approx,
            lngApprox: group.lng_approx,
            dayOfWeek: group.day_of_week,
            timeOfDay: group.time_of_day,
            leaderId: group.leader_id,
            coleaderId: group.coleader_id,
            exactAddress: group.exact_address,
            leaderPhonePrivate: group.leader_phone_private,
            internalNotes: group.internal_notes,
            active: group.active,
          }}
        />
      </div>
    </div>
  );
}
