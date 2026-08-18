import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { InviteUserForm } from "@/components/admin/InviteUserForm";

export default function InviteUserPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Usuarios", href: "/admin/usuarios" }, { label: "Invitar usuario" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Invitar usuario</h1>
      <div className="mt-8">
        <InviteUserForm />
      </div>
    </div>
  );
}
