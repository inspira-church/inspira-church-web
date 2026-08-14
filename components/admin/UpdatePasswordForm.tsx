"use client";

import { useActionState } from "react";
import { updatePassword, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const initialState: AuthActionState = {};

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}

      <TextField
        label="Nueva contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        required
      />
      {state.fieldErrors?.password && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.password}</p>
      )}

      <TextField
        label="Confirmar contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
      />
      {state.fieldErrors?.confirmPassword && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.confirmPassword}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
