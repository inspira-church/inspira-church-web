"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initialState: AuthActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const callbackError = searchParams.get("error");

  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {(state.error || callbackError) && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          {state.error ??
            (callbackError === "account_disabled"
              ? "Tu cuenta fue desactivada. Contacta a un Administrador."
              : "El enlace ya no es válido. Solicita uno nuevo.")}
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

      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state.fieldErrors?.password && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.password}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>

      <p className="text-center text-sm text-ink-faint">
        <Link href="/admin/recuperar" className="text-accent hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
