import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { EditUserForm } from "@/components/admin/EditUserForm";
import { updateStaffUser } from "@/lib/actions/users";
import { createClient } from "@/lib/supabase/server";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: staffUser } = await supabase
    .from("profiles")
    .select("full_name, email, phone, role, active, is_primary")
    .eq("id", id)
    .single();

  if (!staffUser) notFound();

  const updateWithId = updateStaffUser.bind(null, id);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Usuarios", href: "/admin/usuarios" }, { label: "Editar usuario" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Editar usuario</h1>
      <div className="mt-8">
        <EditUserForm
          action={updateWithId}
          email={staffUser.email}
          isPrimary={staffUser.is_primary}
          defaultValues={{
            fullName: staffUser.full_name,
            phone: staffUser.phone,
            role: staffUser.role,
            active: staffUser.active,
          }}
        />
      </div>
    </div>
  );
}
