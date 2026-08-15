import { InviteUserForm } from "@/components/admin/InviteUserForm";

export default function InviteUserPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Invitar usuario</h1>
      <div className="mt-8">
        <InviteUserForm />
      </div>
    </div>
  );
}
