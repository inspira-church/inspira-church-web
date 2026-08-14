import { GrowthGroupForm } from "@/components/admin/GrowthGroupForm";
import { createGrowthGroup } from "@/lib/actions/growth-groups";
import { createClient } from "@/lib/supabase/server";

export default async function NewGrowthGroupPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("id, full_name")
    .order("full_name");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Nuevo grupo</h1>
      <div className="mt-8">
        <GrowthGroupForm
          action={createGrowthGroup}
          teamMemberOptions={(members ?? []).map((m) => ({ value: m.id, label: m.full_name }))}
        />
      </div>
    </div>
  );
}
