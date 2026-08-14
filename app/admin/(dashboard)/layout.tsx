import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

/**
 * Shell del panel (sidebar + topbar) para todo lo que SÍ requiere sesión.
 * proxy.ts ya bloquea /admin/** sin sesión antes de llegar aquí; este
 * redirect es la segunda barrera de la defensa en profundidad.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "editor";

  return (
    <AdminShell
      userName={profile?.full_name || user.email || ""}
      userRole={role}
      isAdmin={role === "admin"}
    >
      {children}
    </AdminShell>
  );
}
