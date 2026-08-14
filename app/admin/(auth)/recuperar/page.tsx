import type { Metadata } from "next";
import { RequestPasswordResetForm } from "@/components/admin/RequestPasswordResetForm";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Panel administrativo",
};

export default function RecoverPasswordPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-2xl font-semibold text-ink">
          Recuperar contraseña
        </p>
        <p className="mt-1 text-center text-sm text-ink-faint">
          Te enviamos un enlace para crear una nueva.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-paper-raised p-6">
          <RequestPasswordResetForm />
        </div>
      </div>
    </main>
  );
}
