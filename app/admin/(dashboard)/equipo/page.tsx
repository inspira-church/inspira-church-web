import Image from "next/image";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toggleTeamMemberActive } from "@/lib/actions/team-members";
import { createClient } from "@/lib/supabase/server";

type TeamMemberRow = {
  id: string;
  full_name: string;
  type: "pastor" | "lider";
  role_title: string;
  photo_url: string | null;
  active: boolean;
  order_index: number;
};

function MemberRow({ member }: { member: TeamMemberRow }) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 transition-colors duration-150 hover:bg-ink/5">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-paper">
        {member.photo_url && (
          <Image src={member.photo_url} alt="" fill className="object-cover" sizes="48px" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{member.full_name}</p>
        <p className="truncate text-sm text-ink-faint">{member.role_title}</p>
      </div>
      <Badge variant={member.active ? "accent" : "neutral"}>
        {member.active ? "Visible" : "Oculto"}
      </Badge>
      <Link href={`/admin/equipo/${member.id}`} className="text-sm font-medium text-accent hover:underline">
        Editar
      </Link>
      <form action={toggleTeamMemberActive.bind(null, member.id, !member.active)}>
        <button type="submit" className="text-sm text-ink-soft hover:text-ink">
          {member.active ? "Ocultar" : "Mostrar"}
        </button>
      </form>
    </div>
  );
}

function MemberGroup({ title, description, members }: { title: string; description: string; members: TeamMemberRow[] }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-ink">
        {title} <span className="text-sm font-normal text-ink-faint">({members.length})</span>
      </h2>
      <p className="mt-1 text-sm text-ink-faint">{description}</p>
      {members.length === 0 ? (
        <EmptyState icon={UserRound} title="Todavía no hay nadie aquí." className="mt-4" />
      ) : (
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {members.map((member) => (
            <MemberRow key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
}

export default async function TeamMembersListPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("id, full_name, type, role_title, photo_url, active, order_index")
    .order("order_index");

  const pastors = (members ?? []).filter((m) => m.type === "pastor");
  const leaders = (members ?? []).filter((m) => m.type === "lider");

  return (
    <div>
      <PageHeader
        title="Pastores y líderes"
        actions={
          <Button as={Link} href="/admin/equipo/nuevo" size="sm">
            Agregar
          </Button>
        }
      />

      <div className="mt-8 space-y-10">
        <MemberGroup
          title="Pastores"
          description="Equipo pastoral — se muestra en /nosotros con biografía en un modal."
          members={pastors}
        />
        <MemberGroup
          title="Líderes"
          description="Personas que sirven en áreas y ministerios — se muestran en /nosotros en el mosaico de liderazgo."
          members={leaders}
        />
      </div>
    </div>
  );
}
