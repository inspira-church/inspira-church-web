"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initialState: AuthActionState = {};

export function RequestPasswordResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.success) {
    return (
      <div className="text-center">
        <p className="text-ink">
          Si ese correo tiene una cuenta en el panel, te enviamos un enlace
          para restablecer la contraseña.
        </p>
        <Link
          href="/admin/login"
          className="mt-4 inline-block text-sm text-accent hover:underline"
        >
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}

      <TextField
        label="Correo"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      {state.fieldErrors?.email && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.email}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Enviando…" : "Enviar enlace"}
      </Button>

      <p className="text-center text-sm text-ink-faint">
        <Link href="/admin/login" className="text-accent hover:underline">
          Volver a ingresar
        </Link>
      </p>
    </form>
  );
}
