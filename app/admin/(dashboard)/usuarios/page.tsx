import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toggleStaffActive } from "@/lib/actions/users";
import { createClient } from "@/lib/supabase/server";

export default async function UsersListPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, active, is_primary")
    .order("created_at");

  return (
    <div>
      <PageHeader
        title="Usuarios"
        actions={
          <Button as={Link} href="/admin/usuarios/nuevo" size="sm">
            Invitar
          </Button>
        }
      />

      {!users || users.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Todavía no hay cuentas de staff."
          className="mt-8"
          action={
            <Button as={Link} href="/admin/usuarios/nuevo" size="sm">
              Invitar usuario
            </Button>
          }
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {users.map((staffUser) => (
            <div
              key={staffUser.id}
              className="flex flex-wrap items-center gap-4 p-4 transition-colors duration-150 hover:bg-ink/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">
                  {staffUser.full_name || staffUser.email}
                  {staffUser.is_primary && (
                    <span className="ml-2 text-xs text-ink-faint">(principal)</span>
                  )}
                </p>
                <p className="truncate text-sm text-ink-faint">{staffUser.email}</p>
              </div>
              <Badge variant={staffUser.role === "admin" ? "accent" : "neutral"}>
                {staffUser.role === "admin" ? "Administrador" : "Editor"}
              </Badge>
              <Badge variant={staffUser.active ? "accent" : "neutral"}>
                {staffUser.active ? "Activo" : "Desactivado"}
              </Badge>
              <Link
                href={`/admin/usuarios/${staffUser.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              {!staffUser.is_primary && (
                <form action={toggleStaffActive.bind(null, staffUser.id, !staffUser.active)}>
                  <button type="submit" className="text-sm text-ink-soft hover:text-ink">
                    {staffUser.active ? "Desactivar" : "Activar"}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
