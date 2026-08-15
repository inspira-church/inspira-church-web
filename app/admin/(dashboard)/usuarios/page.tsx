import Link from "next/link";
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
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Usuarios</h1>
        <Button as={Link} href="/admin/usuarios/nuevo" size="sm">
          Invitar
        </Button>
      </div>

      {!users || users.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay cuentas de staff.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {users.map((staffUser) => (
            <div key={staffUser.id} className="flex flex-wrap items-center gap-4 p-4">
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
