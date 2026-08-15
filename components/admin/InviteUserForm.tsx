"use client";

import { useActionState } from "react";
import { FormError } from "@/components/admin/FormError";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { inviteStaffUser } from "@/lib/actions/users";
import type { ActionState } from "@/lib/form-errors";

const initialState: ActionState = {};

export function InviteUserForm() {
  const [state, formAction] = useActionState(inviteStaffUser, initialState);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />

      <TextField label="Nombre completo" name="fullName" required />
      {state.fieldErrors?.fullName && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.fullName}</p>
      )}

      <TextField
        label="Correo electrónico"
        name="email"
        type="email"
        hint="Recibirá un enlace para crear su contraseña."
        required
      />
      {state.fieldErrors?.email && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.email}</p>
      )}

      <TextField label="Teléfono" name="phone" type="tel" hint="Opcional" />

      <SelectField
        label="Rol"
        name="role"
        defaultValue="editor"
        options={[
          { value: "editor", label: "Editor" },
          { value: "admin", label: "Administrador" },
        ]}
        required
      />

      <SubmitButton pendingText="Enviando invitación…">Enviar invitación</SubmitButton>
    </form>
  );
}
