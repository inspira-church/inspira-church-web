import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { TeamMemberForm } from "@/components/admin/TeamMemberForm";
import { updateTeamMember } from "@/lib/actions/team-members";
import { createClient } from "@/lib/supabase/server";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: member } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (!member) notFound();

  const updateWithId = updateTeamMember.bind(null, id);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Pastores y líderes", href: "/admin/equipo" },
          { label: "Editar miembro" },
        ]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">
        Editar miembro del equipo
      </h1>
      <div className="mt-8">
        <TeamMemberForm
          action={updateWithId}
          defaultValues={{
            fullName: member.full_name,
            type: member.type,
            roleTitle: member.role_title,
            bio: member.bio,
            photoUrl: member.photo_url,
            orderIndex: member.order_index,
            active: member.active,
          }}
        />
      </div>
    </div>
  );
}
