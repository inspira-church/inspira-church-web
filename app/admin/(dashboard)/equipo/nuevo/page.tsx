import { TeamMemberForm } from "@/components/admin/TeamMemberForm";
import { createTeamMember } from "@/lib/actions/team-members";

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Nuevo miembro del equipo
      </h1>
      <div className="mt-8">
        <TeamMemberForm action={createTeamMember} />
      </div>
    </div>
  );
}
