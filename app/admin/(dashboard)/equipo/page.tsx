import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toggleTeamMemberActive } from "@/lib/actions/team-members";
import { createClient } from "@/lib/supabase/server";

export default async function TeamMembersListPage() {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("id, full_name, type, role_title, photo_url, active, order_index")
    .order("order_index");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Pastores y líderes
        </h1>
        <Button as={Link} href="/admin/equipo/nuevo" size="sm">
          Agregar
        </Button>
      </div>

      {!members || members.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay nadie registrado.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {members.map((member) => (
            <div key={member.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-paper">
                {member.photo_url && (
                  <Image
                    src={member.photo_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{member.full_name}</p>
                <p className="truncate text-sm text-ink-faint">{member.role_title}</p>
              </div>
              <Badge variant={member.type === "pastor" ? "accent" : "neutral"}>
                {member.type === "pastor" ? "Pastor" : "Líder"}
              </Badge>
              <Badge variant={member.active ? "accent" : "neutral"}>
                {member.active ? "Visible" : "Oculto"}
              </Badge>
              <Link
                href={`/admin/equipo/${member.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              <form action={toggleTeamMemberActive.bind(null, member.id, !member.active)}>
                <button
                  type="submit"
                  className="text-sm text-ink-soft hover:text-ink"
                >
                  {member.active ? "Ocultar" : "Mostrar"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
