import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Ingresar | Panel administrativo",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="text-center font-display text-2xl font-semibold text-ink">
          Inspira Church
        </p>
        <p className="mt-1 text-center text-sm text-ink-faint">
          Panel administrativo
        </p>

        <div className="mt-8 rounded-lg border border-border bg-paper-raised p-6">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
