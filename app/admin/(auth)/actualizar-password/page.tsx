import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/admin/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Actualizar contraseña | Panel administrativo",
};

export default function UpdatePasswordPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-2xl font-semibold text-ink">
          Crea tu nueva contraseña
        </p>

        <div className="mt-8 rounded-lg border border-border bg-paper-raised p-6">
          <UpdatePasswordForm />
        </div>
      </div>
    </main>
  );
}
